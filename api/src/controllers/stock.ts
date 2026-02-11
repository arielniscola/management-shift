import moment from "moment";
import Log from "../libs/logger";
import { IRouteController } from "../routes/index";
import { stockService } from "../services/stock";

export class StockController {
  /**
   * Obtener resumen de stock
   * GET /stock/summary
   */
  static getStockSummary: IRouteController = async (req, res) => {
    const logger = new Log(res.locals.requestId, "StockController.getStockSummary");
    try {
      const companyCode = res.locals.companyCode;
      const summary = await stockService.getStockSummary(companyCode);

      return res.status(200).json({ ack: 0, data: summary });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  /**
   * Obtener historial de movimientos de stock
   * GET /stock/movements
   */
  static getMovements: IRouteController<
    {},
    {},
    {},
    { productId?: string; startDate?: string; endDate?: string; limit?: string }
  > = async (req, res) => {
    const logger = new Log(res.locals.requestId, "StockController.getMovements");
    try {
      const companyCode = res.locals.companyCode;
      const { productId, startDate, endDate, limit } = req.query;

      const start = startDate
        ? moment(startDate, "YYYY-MM-DD").startOf("day").toDate()
        : undefined;
      const end = endDate
        ? moment(endDate, "YYYY-MM-DD").endOf("day").toDate()
        : undefined;

      const movements = await stockService.getStockMovements(
        companyCode,
        productId,
        start,
        end,
        limit ? parseInt(limit) : 100
      );

      return res.status(200).json({ ack: 0, data: movements });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  /**
   * Obtener productos con stock bajo
   * GET /stock/low
   */
  static getLowStock: IRouteController = async (req, res) => {
    const logger = new Log(res.locals.requestId, "StockController.getLowStock");
    try {
      const companyCode = res.locals.companyCode;
      const products = await stockService.getLowStockProducts(companyCode);

      return res.status(200).json({ ack: 0, data: products });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  /**
   * Registrar entrada de mercadería
   * POST /stock/entry
   */
  static registerEntry: IRouteController<
    {},
    {},
    { productId: string; quantity: number; notes?: string }
  > = async (req, res) => {
    const logger = new Log(res.locals.requestId, "StockController.registerEntry");
    try {
      const companyCode = res.locals.companyCode;
      const { productId, quantity, notes } = req.body;

      if (!productId || !quantity) {
        throw new Error("Producto y cantidad son requeridos");
      }

      const movement = await stockService.registerEntry(
        productId,
        quantity,
        companyCode,
        notes
      );

      return res.status(200).json({
        ack: 0,
        message: "Entrada de stock registrada correctamente",
        data: movement,
      });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  /**
   * Ajuste manual de stock
   * POST /stock/adjustment
   */
  static adjustment: IRouteController<
    {},
    {},
    { productId: string; quantity: number; notes?: string }
  > = async (req, res) => {
    const logger = new Log(res.locals.requestId, "StockController.adjustment");
    try {
      const companyCode = res.locals.companyCode;
      const { productId, quantity, notes } = req.body;

      if (!productId || quantity === undefined) {
        throw new Error("Producto y cantidad son requeridos");
      }

      const movement = await stockService.updateStock(
        productId,
        quantity,
        "adjustment",
        companyCode,
        undefined,
        notes
      );

      return res.status(200).json({
        ack: 0,
        message: "Ajuste de stock registrado correctamente",
        data: movement,
      });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  /**
   * Validar stock para una lista de productos
   * POST /stock/validate
   */
  static validateStock: IRouteController<
    {},
    {},
    { products: Array<{ _id: string; units: number; name?: string }> }
  > = async (req, res) => {
    const logger = new Log(res.locals.requestId, "StockController.validateStock");
    try {
      const companyCode = res.locals.companyCode;
      const { products } = req.body;

      if (!products || !Array.isArray(products)) {
        throw new Error("Lista de productos requerida");
      }

      const warnings = await stockService.validateStock(products, companyCode);

      return res.status(200).json({
        ack: 0,
        data: {
          hasWarnings: warnings.length > 0,
          warnings,
        },
      });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  /**
   * Obtener movimientos de stock con paginación
   * GET /stock/movements/paginated
   */
  static getMovementsPaginated: IRouteController<
    {},
    {},
    {},
    { page?: string; pageSize?: string; productId?: string; startDate?: string; endDate?: string }
  > = async (req, res) => {
    const logger = new Log(res.locals.requestId, "StockController.getMovementsPaginated");
    try {
      const companyCode = res.locals.companyCode;
      const { page, pageSize, productId, startDate, endDate } = req.query;

      const start = startDate
        ? moment(startDate, "YYYY-MM-DD").startOf("day").toDate()
        : undefined;
      const end = endDate
        ? moment(endDate, "YYYY-MM-DD").endOf("day").toDate()
        : undefined;

      const result = await stockService.getStockMovementsPaginated(
        companyCode,
        page ? parseInt(page) : 1,
        pageSize ? parseInt(pageSize) : 20,
        productId,
        start,
        end
      );

      return res.status(200).json({ ack: 0, data: result });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  /**
   * Obtener resumen de ventas por día
   * GET /stock/daily-sales
   */
  static getDailySales: IRouteController<
    {},
    {},
    {},
    { date: string }
  > = async (req, res) => {
    const logger = new Log(res.locals.requestId, "StockController.getDailySales");
    try {
      const companyCode = res.locals.companyCode;
      const { date } = req.query;

      if (!date) {
        throw new Error("Fecha requerida");
      }

      const targetDate = moment(date, "YYYY-MM-DD").toDate();
      const result = await stockService.getDailySales(companyCode, targetDate);

      return res.status(200).json({ ack: 0, data: result });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };
}
