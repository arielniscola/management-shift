import Log from "../libs/logger";
import { IOpenTab, IOpenTabProduct } from "../models/openTab";
import { IRouteController } from "../routes/index";
import { openTabService } from "../services/openTab";

export class OpenTabController {
  /**
   * Listar cuentas abiertas (activas)
   */
  static find: IRouteController<{}, {}, {}, { includeAll?: string }> = async (
    req,
    res
  ) => {
    const logger = new Log(res.locals.requestId, "OpenTabController.find");
    try {
      const companyCode = res.locals.companyCode;
      const includeAll = req.query.includeAll === "true";

      const filter: any = { companyCode };
      if (!includeAll) {
        filter.state = { $ne: "closed" };
      }

      const data = await openTabService.find(filter, {}, { sort: { createdAt: -1 } });
      return res.status(200).json({ ack: 0, data });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  /**
   * Obtener detalle de una cuenta
   */
  static findOne: IRouteController<{ id: string }> = async (req, res) => {
    const logger = new Log(res.locals.requestId, "OpenTabController.findOne");
    try {
      const companyCode = res.locals.companyCode;
      const data = await openTabService.findOne({
        _id: req.params.id,
        companyCode,
      });

      if (!data) {
        return res.status(404).json({ ack: 1, message: "Cuenta no encontrada" });
      }

      return res.status(200).json({ ack: 0, data });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  /**
   * Crear nueva cuenta abierta
   */
  static create: IRouteController<{}, {}, { name: string }> = async (req, res) => {
    const logger = new Log(res.locals.requestId, "OpenTabController.create");
    try {
      const companyCode = res.locals.companyCode;
      const { name } = req.body;

      if (!name || name.trim() === "") {
        throw new Error("El nombre de la cuenta es requerido");
      }

      const newTab: Partial<IOpenTab> = {
        name: name.trim(),
        companyCode,
        state: "open",
        createdAt: new Date(),
        sharedProducts: [],
        participants: [],
        totalAmount: 0,
        generatedMovements: [],
      };

      const created = await openTabService.insertOne(newTab);
      return res.status(201).json({ ack: 0, data: created, message: "Cuenta creada" });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  /**
   * Agregar producto al carrito compartido
   */
  static addProduct: IRouteController<{ id: string }, {}, { product: IOpenTabProduct }> =
    async (req, res) => {
      const logger = new Log(res.locals.requestId, "OpenTabController.addProduct");
      try {
        const companyCode = res.locals.companyCode;
        const { product } = req.body;

        if (!product || !product.code || !product.name) {
          throw new Error("Producto inválido");
        }

        const data = await openTabService.addProduct(
          req.params.id,
          product,
          companyCode
        );
        return res.status(200).json({ ack: 0, data });
      } catch (e) {
        logger.error(e);
        return res.status(400).json({ ack: 1, message: e.message });
      }
    };

  /**
   * Eliminar producto del carrito compartido
   */
  static removeProduct: IRouteController<{ id: string; index: string }> = async (
    req,
    res
  ) => {
    const logger = new Log(res.locals.requestId, "OpenTabController.removeProduct");
    try {
      const companyCode = res.locals.companyCode;
      const index = parseInt(req.params.index, 10);

      const data = await openTabService.removeProduct(req.params.id, index, companyCode);
      return res.status(200).json({ ack: 0, data });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  /**
   * Actualizar cantidad de producto
   */
  static updateProductUnits: IRouteController<
    { id: string; index: string },
    {},
    { units: number }
  > = async (req, res) => {
    const logger = new Log(res.locals.requestId, "OpenTabController.updateProductUnits");
    try {
      const companyCode = res.locals.companyCode;
      const index = parseInt(req.params.index, 10);
      const { units } = req.body;

      const data = await openTabService.updateProductUnits(
        req.params.id,
        index,
        units,
        companyCode
      );
      return res.status(200).json({ ack: 0, data });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  /**
   * Dividir cuenta equitativamente
   */
  static divideEqual: IRouteController<
    { id: string },
    {},
    { participants: { clientId?: string; clientName: string }[] }
  > = async (req, res) => {
    const logger = new Log(res.locals.requestId, "OpenTabController.divideEqual");
    try {
      const companyCode = res.locals.companyCode;
      const { participants } = req.body;

      const data = await openTabService.divideEqual(
        req.params.id,
        participants,
        companyCode
      );
      return res.status(200).json({ ack: 0, data });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  /**
   * Dividir cuenta por productos
   */
  static divideByProducts: IRouteController<
    { id: string },
    {},
    {
      assignments: {
        clientId?: string;
        clientName: string;
        productIndices: number[];
      }[];
    }
  > = async (req, res) => {
    const logger = new Log(res.locals.requestId, "OpenTabController.divideByProducts");
    try {
      const companyCode = res.locals.companyCode;
      const { assignments } = req.body;

      const data = await openTabService.divideByProducts(
        req.params.id,
        assignments,
        companyCode
      );
      return res.status(200).json({ ack: 0, data });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  /**
   * Agregar producto a participante (post-división)
   */
  static addProductToParticipant: IRouteController<
    { id: string; participantId: string },
    {},
    { product: IOpenTabProduct }
  > = async (req, res) => {
    const logger = new Log(
      res.locals.requestId,
      "OpenTabController.addProductToParticipant"
    );
    try {
      const companyCode = res.locals.companyCode;
      const { product } = req.body;

      const data = await openTabService.addProductToParticipant(
        req.params.id,
        req.params.participantId,
        product,
        companyCode
      );
      return res.status(200).json({ ack: 0, data });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  /**
   * Eliminar producto de participante
   */
  static removeProductFromParticipant: IRouteController<
    { id: string; participantId: string; productIndex: string }
  > = async (req, res) => {
    const logger = new Log(
      res.locals.requestId,
      "OpenTabController.removeProductFromParticipant"
    );
    try {
      const companyCode = res.locals.companyCode;
      const productIndex = parseInt(req.params.productIndex, 10);

      const data = await openTabService.removeProductFromParticipant(
        req.params.id,
        req.params.participantId,
        productIndex,
        companyCode
      );
      return res.status(200).json({ ack: 0, data });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  /**
   * Transferir producto entre participantes
   */
  static transferProduct: IRouteController<
    { id: string },
    {},
    {
      fromParticipantId: string;
      toParticipantId: string;
      productIndex: number;
      units: number;
    }
  > = async (req, res) => {
    const logger = new Log(res.locals.requestId, "OpenTabController.transferProduct");
    try {
      const companyCode = res.locals.companyCode;
      const { fromParticipantId, toParticipantId, productIndex, units } = req.body;

      const data = await openTabService.transferProduct(
        req.params.id,
        fromParticipantId,
        toParticipantId,
        productIndex,
        units,
        companyCode
      );
      return res.status(200).json({ ack: 0, data });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  /**
   * Registrar pago de participante
   */
  static registerPayment: IRouteController<
    { id: string; participantId: string },
    {},
    { payments: { amount: number; paymentMethod: any }[] }
  > = async (req, res) => {
    const logger = new Log(res.locals.requestId, "OpenTabController.registerPayment");
    try {
      const companyCode = res.locals.companyCode;
      const { payments } = req.body;

      const data = await openTabService.registerPayment(
        req.params.id,
        req.params.participantId,
        payments,
        companyCode
      );
      return res.status(200).json({ ack: 0, data });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  /**
   * Cerrar cuenta y generar movements
   */
  static closeTab: IRouteController<{ id: string }> = async (req, res) => {
    const logger = new Log(res.locals.requestId, "OpenTabController.closeTab");
    try {
      const companyCode = res.locals.companyCode;

      const data = await openTabService.closeTab(req.params.id, companyCode);
      return res.status(200).json({
        ack: 0,
        data,
        message: "Cuenta cerrada correctamente",
      });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  /**
   * Cancelar cuenta
   */
  static cancelTab: IRouteController<{ id: string }> = async (req, res) => {
    const logger = new Log(res.locals.requestId, "OpenTabController.cancelTab");
    try {
      const companyCode = res.locals.companyCode;

      await openTabService.cancelTab(req.params.id, companyCode);
      return res.status(200).json({
        ack: 0,
        message: "Cuenta cancelada correctamente",
      });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };
}
