import { Service } from ".";
import { IProduct, ProductModel } from "../models/products";
import { IStockMovement, StockMovementModel } from "../models/stockMovement";
import { MovementModel } from "../models/movements";

export interface StockValidationResult {
  productId: string;
  productName: string;
  requested: number;
  available: number;
  hasWarning: boolean;
}

export class StockService extends Service<IStockMovement> {
  constructor() {
    super(StockMovementModel);
  }

  /**
   * Actualiza el stock de un producto y registra el movimiento
   */
  async updateStock(
    productId: string,
    quantity: number,
    type: "sale" | "entry" | "adjustment",
    companyCode: string,
    reference?: string,
    notes?: string,
    createdBy?: string
  ): Promise<IStockMovement> {
    // Obtener producto actual
    const product = await ProductModel.findOne({
      _id: productId,
      companyCode,
    }).lean();
    if (!product) {
      throw new Error("Producto no encontrado");
    }

    const previousStock = product.stock || 0;
    let newStock: number;

    // Calcular nuevo stock según tipo de movimiento
    if (type === "sale") {
      newStock = previousStock - Math.abs(quantity);
    } else if (type === "entry") {
      newStock = previousStock + Math.abs(quantity);
    } else {
      // adjustment: quantity puede ser positivo o negativo
      newStock = previousStock + quantity;
    }

    // Actualizar stock del producto
    await ProductModel.updateOne({ _id: productId }, { stock: newStock });

    // Registrar movimiento de stock
    const movement = await this.insertOne({
      product: productId,
      type,
      quantity: type === "sale" ? -Math.abs(quantity) : quantity,
      previousStock,
      newStock,
      reference,
      notes,
      companyCode,
      date: new Date(),
      createdBy,
    });

    return movement;
  }

  /**
   * Valida el stock disponible para una lista de productos
   * Retorna advertencias pero NO bloquea la operación
   */
  async validateStock(
    products: Array<{ _id: string; units: number; name?: string }>,
    companyCode: string
  ): Promise<StockValidationResult[]> {
    const warnings: StockValidationResult[] = [];

    for (const item of products) {
      const product = await ProductModel.findOne({
        _id: item._id,
        companyCode,
      }).lean();

      if (product) {
        const available = product.stock || 0;
        const requested = item.units || 1;

        if (requested > available) {
          warnings.push({
            productId: item._id,
            productName: item.name || product.name,
            requested,
            available,
            hasWarning: true,
          });
        }
      }
    }

    return warnings;
  }

  /**
   * Obtiene el historial de movimientos de stock
   */
  async getStockMovements(
    companyCode: string,
    productId?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100
  ): Promise<IStockMovement[]> {
    const filter: any = { companyCode };

    if (productId) {
      filter.product = productId;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const movements = await this.find(filter, {}, {
      populate: "product",
      sort: { date: -1 },
      limit,
    });

    return movements;
  }

  /**
   * Obtiene productos con stock bajo el mínimo
   */
  async getLowStockProducts(companyCode: string): Promise<IProduct[]> {
    const products = await ProductModel.find({
      companyCode,
      $expr: { $lt: ["$stock", "$minimumStock"] },
    }).lean();

    return products as IProduct[];
  }

  /**
   * Registra una entrada de mercadería
   */
  async registerEntry(
    productId: string,
    quantity: number,
    companyCode: string,
    notes?: string,
    createdBy?: string
  ): Promise<IStockMovement> {
    if (quantity <= 0) {
      throw new Error("La cantidad debe ser mayor a 0");
    }

    return this.updateStock(
      productId,
      quantity,
      "entry",
      companyCode,
      undefined,
      notes,
      createdBy
    );
  }

  /**
   * Procesa el descuento de stock para una venta
   */
  async processSaleStock(
    products: Array<{ _id?: string; units: number; name?: string }>,
    companyCode: string,
    reference?: string,
    createdBy?: string
  ): Promise<void> {
    for (const item of products) {
      if (item._id && item.units > 0) {
        await this.updateStock(
          item._id,
          item.units,
          "sale",
          companyCode,
          reference,
          undefined,
          createdBy
        );
      }
    }
  }

  /**
   * Revierte el stock de una venta (cuando se elimina)
   */
  async revertSaleStock(
    products: Array<{ _id?: string; units: number }>,
    companyCode: string,
    reference?: string,
    createdBy?: string
  ): Promise<void> {
    for (const item of products) {
      if (item._id && item.units > 0) {
        await this.updateStock(
          item._id,
          item.units,
          "entry",
          companyCode,
          reference,
          "Reversión por eliminación de venta",
          createdBy
        );
      }
    }
  }

  /**
   * Obtiene el resumen de ventas por día agrupado por producto
   */
  async getDailySales(
    companyCode: string,
    date: Date
  ): Promise<Array<{
    productId: string;
    productName: string;
    productCode: string;
    totalQuantity: number;
    totalValue: number;
    movements: number;
  }>> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await MovementModel.aggregate([
      {
        $match: {
          companyCode,
          date: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      { $unwind: "$details" },
      {
        $group: {
          _id: { code: "$details.code", name: "$details.name" },
          totalQuantity: { $sum: "$details.units" },
          totalValue: { $sum: { $multiply: ["$details.price", "$details.units"] } },
          movements: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          productId: "$_id.code",
          productName: "$_id.name",
          productCode: "$_id.code",
          totalQuantity: 1,
          totalValue: 1,
          movements: 1,
        },
      },
      {
        $sort: { totalQuantity: -1 },
      },
    ]);

    return result;
  }

  /**
   * Obtiene el resumen de stock: total productos, unidades y valor
   */
  async getStockSummary(
    companyCode: string
  ): Promise<{ totalProducts: number; totalUnits: number; totalValue: number }> {
    const result = await ProductModel.aggregate([
      { $match: { companyCode } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalUnits: { $sum: "$stock" },
          totalValue: { $sum: { $multiply: ["$stock", "$price"] } },
        },
      },
    ]);

    if (result.length === 0) {
      return { totalProducts: 0, totalUnits: 0, totalValue: 0 };
    }

    return {
      totalProducts: result[0].totalProducts,
      totalUnits: result[0].totalUnits,
      totalValue: result[0].totalValue,
    };
  }

  /**
   * Obtiene el historial de movimientos de stock con paginación
   */
  async getStockMovementsPaginated(
    companyCode: string,
    page: number = 1,
    pageSize: number = 20,
    productId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{ movements: IStockMovement[]; total: number; pages: number }> {
    const filter: any = { companyCode };

    if (productId) {
      filter.product = productId;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = startDate;
      if (endDate) filter.date.$lte = endDate;
    }

    const total = await StockMovementModel.countDocuments(filter);
    const pages = Math.ceil(total / pageSize);
    const skip = (page - 1) * pageSize;

    const movements = await StockMovementModel.find(filter)
      .populate("product")
      .sort({ date: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    return { movements: movements as IStockMovement[], total, pages };
  }
}

export const stockService = new StockService();
