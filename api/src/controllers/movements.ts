import moment from "moment";
import Log from "../libs/logger";
import { IMovement } from "../models/movements";
import { IRouteController } from "../routes/index";
import { movementService } from "../services/movements";
import { IPayment } from "../models/payment";
import { paymentService } from "../services/payment";
import { stockService } from "../services/stock";

export class MovementController {
  static find: IRouteController<{}, {}, {}, { date: string; client: string }> =
    async (req, res) => {
      const logger = new Log(res.locals.requestId, "MovementController.find");
      try {
        const companyCode = res.locals.companyCode;
        const startDate = moment(req.query.date, "YYYY/MM/DD").startOf("day");
        const endDate = moment(req.query.date, "YYYY/MM/DD").endOf("day");
        const filter = {
          ...{ companyCode: companyCode },
          ...(req.query.date
            ? { date: { $gte: startDate.toDate(), $lte: endDate.toDate() } }
            : {}),
          ...(req.query.client ? { client: "" } : {}),
        };
        const data: IMovement[] = await movementService.find(
          filter,
          {},
          { populate: "client" }
        );

        return res.status(200).json({ ack: 0, data: data });
      } catch (e) {
        logger.error(e);
        return res.status(400).json({ ack: 1, message: e.message });
      }
    };

  static create: IRouteController<
    {},
    {},
    { movement: IMovement; payments?: IPayment[] }
  > = async (req, res) => {
    const logger = new Log(res.locals.requestId, "MovementController.create");
    try {
      const companyCode = res.locals.companyCode;
      const { movement } = req.body;
      const date = new Date();
      movement.date = date;
      movement.companyCode = companyCode;
      if (movement.client === "") delete movement.client;
      /** Generar numero de movimiento */
      movement.identifacationNumber =
        await movementService.generateMovementNumber(companyCode);
      /** Si el estado es pagada crear pagos y validar si los montos de los pagos es el total de la venta*/
      let totalPayments = 0;
      if (
        movement.state === "paid" &&
        req.body.payments &&
        req.body.payments.length > 0
      ) {
        for (const pay of req.body.payments) {
          totalPayments += pay.amount;
          pay.movementsNumber = [movement.identifacationNumber];
          pay.date = date;
          pay.companyCode = companyCode;
          await paymentService.insertOne(pay);
        }
        if (totalPayments < movement.totalAmount) {
          movement.state = "incomplete";
          movement.amountPaid = totalPayments;
        } else {
          movement.amountPaid = movement.totalAmount;
        }
      }

      const created = await movementService.insertOne(movement);
      if (!created) throw new Error("No se creo la venta");

      // Descontar stock de los productos vendidos
      if (movement.details && movement.details.length > 0) {
        await stockService.processSaleStock(
          movement.details,
          companyCode,
          movement.identifacationNumber
        );
      }

      return res
        .status(200)
        .json({ ack: 0, message: "Se creo la venta correctamente" });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  static update: IRouteController<
    {},
    {},
    { movement: IMovement; payments?: IPayment[] }
  > = async (req, res) => {
    const logger = new Log(res.locals.requestId, "MovementController.update");
    try {
      const { movement } = req.body;
      /** Verificar si existe */
      const exist = await movementService.findOne({
        _id: movement._id,
      });
      if (!exist) throw new Error("Venta no encontrada");
      let totalPayments = 0;
      if (
        movement.state === "paid" &&
        req.body.payments &&
        req.body.payments.length > 0
      ) {
        for (const pay of req.body.payments) {
          totalPayments += pay.amount;
          pay.movementsNumber = [movement.identifacationNumber];
          pay.date = new Date();
          pay.companyCode = exist.companyCode;
          await paymentService.insertOne(pay);
        }
        if (totalPayments < movement.totalAmount) {
          movement.state = "incomplete";
          movement.amountPaid = totalPayments;
        }
      }
      if (movement.client === "") delete movement.client;
      const movUpdated = await movementService.updateOne(
        { _id: movement._id },
        movement
      );
      if (!movUpdated) throw new Error("Venta no se actualizo");
      return res.status(200).json({ ack: 0, message: "Venta actualizada" });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  static delete: IRouteController = async (req, res) => {
    const logger = new Log(res.locals.requestId, "MovementController.delete");
    try {
      const id = req.params.id;
      const companyCode = res.locals.companyCode;

      // Obtener la venta antes de eliminarla para revertir el stock
      const movement = await movementService.findOne({ _id: id });
      if (!movement) throw new Error("Venta no encontrada");

      // Revertir el stock de los productos
      if (movement.details && movement.details.length > 0) {
        await stockService.revertSaleStock(
          movement.details,
          companyCode,
          movement.identifacationNumber
        );
      }

      const deleted = await movementService.deleteOne({
        _id: id,
      });
      if (!deleted) throw new Error("Venta no eliminada");
      return res
        .status(200)
        .json({ ack: 0, message: "Venta eliminada correctamente" });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  static findLast: IRouteController<{}, {}, {}, {}> = async (req, res) => {
    const logger = new Log(res.locals.requestId, "MovementController.find");
    try {
      const companyCode = res.locals.companyCode;
      const filter = {
        ...{ companyCode: companyCode },
      };
      const data: IMovement[] = await movementService.find(
        filter,
        {},
        { populate: "client", sort: { date: -1 }, limit: 40 }
      );

      return res.status(200).json({ ack: 0, data: data });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };
}
