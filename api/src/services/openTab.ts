import { Service } from ".";
import { IOpenTab, IOpenTabParticipant, IOpenTabProduct, OpenTabModel } from "../models/openTab";
import { movementService } from "./movements";
import { paymentService } from "./payment";
import { stockService } from "./stock";
import { Types } from "mongoose";

export class OpenTabService extends Service<IOpenTab> {
  constructor() {
    super(OpenTabModel);
  }

  /**
   * Calcula el total de productos
   */
  calculateTotal(products: IOpenTabProduct[]): number {
    return products.reduce((sum, p) => sum + p.price * p.units, 0);
  }

  /**
   * Agrega un producto al carrito compartido
   */
  async addProduct(
    tabId: string,
    product: IOpenTabProduct,
    companyCode: string
  ): Promise<IOpenTab> {
    const tab = await this.findOne({ _id: tabId, companyCode });
    if (!tab) throw new Error("Cuenta no encontrada");
    if (tab.state !== "open") throw new Error("La cuenta no está abierta para agregar productos");

    // Buscar si el producto ya existe
    const existingIndex = tab.sharedProducts.findIndex(
      (p) => p.code === product.code
    );

    if (existingIndex >= 0) {
      tab.sharedProducts[existingIndex].units += product.units;
    } else {
      tab.sharedProducts.push(product);
    }

    tab.totalAmount = this.calculateTotal(tab.sharedProducts);

    await this.updateOne({ _id: tabId }, {
      sharedProducts: tab.sharedProducts,
      totalAmount: tab.totalAmount,
    });

    return this.findOne({ _id: tabId });
  }

  /**
   * Elimina un producto del carrito compartido
   */
  async removeProduct(
    tabId: string,
    productIndex: number,
    companyCode: string
  ): Promise<IOpenTab> {
    const tab = await this.findOne({ _id: tabId, companyCode });
    if (!tab) throw new Error("Cuenta no encontrada");
    if (tab.state !== "open") throw new Error("La cuenta no está abierta");

    if (productIndex < 0 || productIndex >= tab.sharedProducts.length) {
      throw new Error("Índice de producto inválido");
    }

    tab.sharedProducts.splice(productIndex, 1);
    tab.totalAmount = this.calculateTotal(tab.sharedProducts);

    await this.updateOne({ _id: tabId }, {
      sharedProducts: tab.sharedProducts,
      totalAmount: tab.totalAmount,
    });

    return this.findOne({ _id: tabId });
  }

  /**
   * Actualiza cantidad de un producto en el carrito compartido
   */
  async updateProductUnits(
    tabId: string,
    productIndex: number,
    units: number,
    companyCode: string
  ): Promise<IOpenTab> {
    const tab = await this.findOne({ _id: tabId, companyCode });
    if (!tab) throw new Error("Cuenta no encontrada");
    if (tab.state !== "open") throw new Error("La cuenta no está abierta");

    if (productIndex < 0 || productIndex >= tab.sharedProducts.length) {
      throw new Error("Índice de producto inválido");
    }

    if (units <= 0) {
      return this.removeProduct(tabId, productIndex, companyCode);
    }

    tab.sharedProducts[productIndex].units = units;
    tab.totalAmount = this.calculateTotal(tab.sharedProducts);

    await this.updateOne({ _id: tabId }, {
      sharedProducts: tab.sharedProducts,
      totalAmount: tab.totalAmount,
    });

    return this.findOne({ _id: tabId });
  }

  /**
   * Divide la cuenta equitativamente entre N participantes
   */
  async divideEqual(
    tabId: string,
    participants: { clientId?: string; clientName: string }[],
    companyCode: string
  ): Promise<IOpenTab> {
    const tab = await this.findOne({ _id: tabId, companyCode });
    if (!tab) throw new Error("Cuenta no encontrada");
    if (tab.state !== "open") throw new Error("La cuenta ya fue dividida");
    if (tab.sharedProducts.length === 0) throw new Error("No hay productos para dividir");
    if (participants.length === 0) throw new Error("Debe haber al menos un participante");

    const subtotalPerParticipant = Math.round(tab.totalAmount / participants.length);

    const newParticipants: IOpenTabParticipant[] = participants.map((p, index) => {
      // El último participante recibe el resto para evitar errores de redondeo
      const isLast = index === participants.length - 1;
      const subtotal = isLast
        ? tab.totalAmount - subtotalPerParticipant * (participants.length - 1)
        : subtotalPerParticipant;

      return {
        _id: new Types.ObjectId().toString(),
        clientId: p.clientId,
        clientName: p.clientName,
        products: [], // En división equitativa no se asignan productos específicos
        subtotal,
        isPaid: false,
        payments: [],
      };
    });

    await this.updateOne({ _id: tabId }, {
      state: "paying",
      divisionType: "equal",
      participants: newParticipants,
    });

    // El stock se descuenta al cerrar la cuenta (closeTab)

    return this.findOne({ _id: tabId });
  }

  /**
   * Divide la cuenta por productos asignados a cada participante
   */
  async divideByProducts(
    tabId: string,
    assignments: {
      clientId?: string;
      clientName: string;
      productIndices: number[];
    }[],
    companyCode: string
  ): Promise<IOpenTab> {
    const tab = await this.findOne({ _id: tabId, companyCode });
    if (!tab) throw new Error("Cuenta no encontrada");
    if (tab.state !== "open") throw new Error("La cuenta ya fue dividida");
    if (tab.sharedProducts.length === 0) throw new Error("No hay productos para dividir");

    // Verificar que todos los productos estén asignados
    const allIndices = assignments.flatMap((a) => a.productIndices);
    const uniqueIndices = new Set(allIndices);

    if (allIndices.length !== uniqueIndices.size) {
      throw new Error("Un producto no puede estar asignado a múltiples participantes");
    }

    const newParticipants: IOpenTabParticipant[] = assignments.map((a) => {
      const products = a.productIndices.map((i) => ({
        ...tab.sharedProducts[i],
        _id: new Types.ObjectId().toString(),
      }));
      const subtotal = this.calculateTotal(products);

      return {
        _id: new Types.ObjectId().toString(),
        clientId: a.clientId,
        clientName: a.clientName,
        products,
        subtotal,
        isPaid: false,
        payments: [],
      };
    });

    await this.updateOne({ _id: tabId }, {
      state: "paying",
      divisionType: "byProduct",
      participants: newParticipants,
    });

    // El stock se descuenta al cerrar la cuenta (closeTab)

    return this.findOne({ _id: tabId });
  }

  /**
   * Agrega un producto a un participante específico (post-división)
   */
  async addProductToParticipant(
    tabId: string,
    participantId: string,
    product: IOpenTabProduct,
    companyCode: string
  ): Promise<IOpenTab> {
    const tab = await this.findOne({ _id: tabId, companyCode });
    if (!tab) throw new Error("Cuenta no encontrada");
    if (tab.state !== "paying") throw new Error("La cuenta no está en estado de pago");

    const participantIndex = tab.participants.findIndex(
      (p) => p._id?.toString() === participantId
    );
    if (participantIndex < 0) throw new Error("Participante no encontrado");
    if (tab.participants[participantIndex].isPaid) {
      throw new Error("El participante ya pagó");
    }

    // Buscar si el producto ya existe en el participante
    const existingIndex = tab.participants[participantIndex].products.findIndex(
      (p) => p.code === product.code
    );

    const productTotal = product.price * product.units;

    if (existingIndex >= 0) {
      tab.participants[participantIndex].products[existingIndex].units += product.units;
    } else {
      product._id = new Types.ObjectId().toString();
      tab.participants[participantIndex].products.push(product);
    }

    // Recalcular subtotales según tipo de división
    if (tab.divisionType === "equal") {
      // En división equitativa: agregar el precio completo al subtotal del participante
      // No modificar sharedProducts (son los productos originales compartidos)
      tab.participants[participantIndex].subtotal += productTotal;
      tab.totalAmount += productTotal;
    } else {
      // En división por productos: recalcular desde los productos del participante
      // También agregar a sharedProducts para el registro total
      const sharedIndex = tab.sharedProducts.findIndex((p) => p.code === product.code);
      if (sharedIndex >= 0) {
        tab.sharedProducts[sharedIndex].units += product.units;
      } else {
        tab.sharedProducts.push({ ...product, _id: new Types.ObjectId().toString() });
      }
      tab.participants[participantIndex].subtotal = this.calculateTotal(
        tab.participants[participantIndex].products
      );
      tab.totalAmount = this.calculateTotal(tab.sharedProducts);
    }

    await this.updateOne({ _id: tabId }, {
      sharedProducts: tab.sharedProducts,
      participants: tab.participants,
      totalAmount: tab.totalAmount,
    });

    // El stock se descuenta al cerrar la cuenta (closeTab)

    return this.findOne({ _id: tabId });
  }

  /**
   * Elimina un producto de un participante (solo productos propios, no compartidos)
   */
  async removeProductFromParticipant(
    tabId: string,
    participantId: string,
    productIndex: number,
    companyCode: string
  ): Promise<IOpenTab> {
    const tab = await this.findOne({ _id: tabId, companyCode });
    if (!tab) throw new Error("Cuenta no encontrada");
    if (tab.state !== "paying") throw new Error("La cuenta no está en estado de pago");

    const participantIndex = tab.participants.findIndex(
      (p) => p._id?.toString() === participantId
    );
    if (participantIndex < 0) throw new Error("Participante no encontrado");
    if (tab.participants[participantIndex].isPaid) {
      throw new Error("El participante ya pagó");
    }

    const participant = tab.participants[participantIndex];
    if (productIndex < 0 || productIndex >= participant.products.length) {
      throw new Error("Índice de producto inválido");
    }

    const product = participant.products[productIndex];
    const productTotal = product.price * product.units;

    // Eliminar el producto del participante
    participant.products.splice(productIndex, 1);

    // Actualizar subtotales según tipo de división
    if (tab.divisionType === "equal") {
      // En división equitativa: restar el precio del subtotal
      participant.subtotal -= productTotal;
      tab.totalAmount -= productTotal;
    } else {
      // En división por productos: también actualizar sharedProducts
      const sharedIndex = tab.sharedProducts.findIndex((p) => p.code === product.code);
      if (sharedIndex >= 0) {
        if (tab.sharedProducts[sharedIndex].units <= product.units) {
          tab.sharedProducts.splice(sharedIndex, 1);
        } else {
          tab.sharedProducts[sharedIndex].units -= product.units;
        }
      }
      participant.subtotal = this.calculateTotal(participant.products);
      tab.totalAmount = this.calculateTotal(tab.sharedProducts);
    }

    tab.participants[participantIndex] = participant;

    await this.updateOne({ _id: tabId }, {
      sharedProducts: tab.sharedProducts,
      participants: tab.participants,
      totalAmount: tab.totalAmount,
    });

    // El stock se descuenta al cerrar la cuenta (closeTab)

    return this.findOne({ _id: tabId });
  }

  /**
   * Transfiere un producto de un participante a otro
   */
  async transferProduct(
    tabId: string,
    fromParticipantId: string,
    toParticipantId: string,
    productIndex: number,
    units: number,
    companyCode: string
  ): Promise<IOpenTab> {
    const tab = await this.findOne({ _id: tabId, companyCode });
    if (!tab) throw new Error("Cuenta no encontrada");
    if (tab.state !== "paying") throw new Error("La cuenta no está en estado de pago");

    const fromIndex = tab.participants.findIndex((p) => p._id?.toString() === fromParticipantId);
    const toIndex = tab.participants.findIndex((p) => p._id?.toString() === toParticipantId);

    if (fromIndex < 0 || toIndex < 0) throw new Error("Participante no encontrado");
    if (tab.participants[fromIndex].isPaid || tab.participants[toIndex].isPaid) {
      throw new Error("No se puede transferir desde/hacia un participante que ya pagó");
    }

    const fromParticipant = tab.participants[fromIndex];
    if (productIndex < 0 || productIndex >= fromParticipant.products.length) {
      throw new Error("Índice de producto inválido");
    }

    const product = fromParticipant.products[productIndex];
    if (units > product.units) {
      throw new Error("Cantidad a transferir excede las unidades disponibles");
    }

    // Reducir del origen
    if (units === product.units) {
      fromParticipant.products.splice(productIndex, 1);
    } else {
      fromParticipant.products[productIndex].units -= units;
    }

    // Agregar al destino
    const toParticipant = tab.participants[toIndex];
    const existingIndex = toParticipant.products.findIndex(
      (p) => p.code === product.code
    );

    if (existingIndex >= 0) {
      toParticipant.products[existingIndex].units += units;
    } else {
      toParticipant.products.push({
        ...product,
        _id: new Types.ObjectId().toString(),
        units,
      });
    }

    // Recalcular subtotales
    fromParticipant.subtotal = this.calculateTotal(fromParticipant.products);
    toParticipant.subtotal = this.calculateTotal(toParticipant.products);

    tab.participants[fromIndex] = fromParticipant;
    tab.participants[toIndex] = toParticipant;

    await this.updateOne({ _id: tabId }, { participants: tab.participants });

    return this.findOne({ _id: tabId });
  }

  /**
   * Registra el pago de un participante
   */
  async registerPayment(
    tabId: string,
    participantId: string,
    payments: { amount: number; paymentMethod: any }[],
    companyCode: string
  ): Promise<IOpenTab> {
    const tab = await this.findOne({ _id: tabId, companyCode });
    if (!tab) throw new Error("Cuenta no encontrada");
    if (tab.state !== "paying") throw new Error("La cuenta no está en estado de pago");

    const participantIndex = tab.participants.findIndex(
      (p) => p._id?.toString() === participantId
    );
    if (participantIndex < 0) throw new Error("Participante no encontrado");
    if (tab.participants[participantIndex].isPaid) {
      throw new Error("El participante ya pagó");
    }

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    if (totalPaid < tab.participants[participantIndex].subtotal) {
      throw new Error("El monto pagado es insuficiente");
    }

    // Registrar los pagos
    const newPayments = payments.map((p) => ({
      _id: new Types.ObjectId().toString(),
      date: new Date(),
      amount: p.amount,
      paymentMethod: p.paymentMethod,
    }));

    tab.participants[participantIndex].payments = newPayments;
    tab.participants[participantIndex].isPaid = true;

    await this.updateOne({ _id: tabId }, { participants: tab.participants });

    return this.findOne({ _id: tabId });
  }

  /**
   * Cierra la cuenta y genera los movements correspondientes
   */
  async closeTab(tabId: string, companyCode: string): Promise<IOpenTab> {
    const tab = await this.findOne({ _id: tabId, companyCode });
    if (!tab) throw new Error("Cuenta no encontrada");
    if (tab.state !== "paying") throw new Error("La cuenta no está lista para cerrar");

    // Verificar que todos los participantes hayan pagado
    const unpaid = tab.participants.filter((p) => !p.isPaid);
    if (unpaid.length > 0) {
      throw new Error(`Faltan ${unpaid.length} participantes por pagar`);
    }

    const generatedMovements: string[] = [];

    // Generar un movement por cada participante
    const participantCount = tab.participants.length;

    for (let i = 0; i < tab.participants.length; i++) {
      const participant = tab.participants[i];
      const identificationNumber = await movementService.generateMovementNumber(companyCode);

      // Determinar los productos para el movement
      let details;
      if (tab.divisionType === "byProduct") {
        details = participant.products.map((p) => ({
          code: p.code,
          name: p.name,
          price: p.price,
          units: p.units,
          description: "",
          stock: 0,
          minimumStock: 0,
          companyCode,
        }));
      } else {
        // División equitativa: dividir unidades proporcionalmente entre participantes
        // para evitar que los reportes inflen la cantidad de productos vendidos
        details = tab.sharedProducts.map((p) => {
          const baseUnits = Math.floor(p.units / participantCount);
          const remainder = p.units % participantCount;
          // Los primeros 'remainder' participantes reciben 1 unidad extra
          const participantUnits = baseUnits + (i < remainder ? 1 : 0);

          return {
            code: p.code,
            name: p.name,
            price: p.price,
            units: participantUnits,
            description: "",
            stock: 0,
            minimumStock: 0,
            companyCode,
          };
        }).filter((d) => d.units > 0);
      }

      const movement = await movementService.insertOne({
        date: new Date(),
        details,
        totalAmount: participant.subtotal,
        state: "paid",
        companyCode,
        processed: false,
        client: participant.clientId || undefined,
        amountPaid: participant.subtotal,
        identifacationNumber: identificationNumber,
        openTabId: tabId,
        openTabName: tab.name,
      });

      generatedMovements.push(movement._id.toString());

      // Registrar los pagos
      for (const payment of participant.payments) {
        await paymentService.insertOne({
          date: payment.date,
          amount: payment.amount,
          companyCode,
          client: participant.clientId,
          paymentMenthod: payment.paymentMethod,
          movementsNumber: [identificationNumber],
          processed: false,
        });
      }
    }

    // Descontar stock al generar las ventas
    // Recopilar todos los productos: sharedProducts + productos individuales post-división
    const productsForStock = new Map<string, { _id: string; units: number; name: string }>();

    for (const p of tab.sharedProducts) {
      if (p.productId) {
        const existing = productsForStock.get(p.productId);
        if (existing) {
          existing.units += p.units;
        } else {
          productsForStock.set(p.productId, { _id: p.productId, units: p.units, name: p.name });
        }
      }
    }

    // Para división equitativa, incluir productos agregados a participantes post-división
    // (en byProduct ya están reflejados en sharedProducts)
    if (tab.divisionType === "equal") {
      for (const participant of tab.participants) {
        for (const p of participant.products) {
          if (p.productId) {
            const existing = productsForStock.get(p.productId);
            if (existing) {
              existing.units += p.units;
            } else {
              productsForStock.set(p.productId, { _id: p.productId, units: p.units, name: p.name });
            }
          }
        }
      }
    }

    if (productsForStock.size > 0) {
      await stockService.processSaleStock(
        Array.from(productsForStock.values()),
        companyCode,
        `OpenTab-${tabId}`
      );
    }

    await this.updateOne({ _id: tabId }, {
      state: "closed",
      generatedMovements,
    });

    return this.findOne({ _id: tabId });
  }

  /**
   * Cancela una cuenta abierta
   */
  async cancelTab(tabId: string, companyCode: string): Promise<void> {
    const tab = await this.findOne({ _id: tabId, companyCode });
    if (!tab) throw new Error("Cuenta no encontrada");
    if (tab.state === "closed") throw new Error("No se puede cancelar una cuenta cerrada");

    // Verificar que ningún participante haya pagado
    const paid = tab.participants.filter((p) => p.isPaid);
    if (paid.length > 0) {
      throw new Error("No se puede cancelar, hay participantes que ya pagaron");
    }

    await this.deleteOne({ _id: tabId });
  }
}

export const openTabService = new OpenTabService();
