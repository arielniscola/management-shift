import moment from "moment";
import Log from "../libs/logger";
import { IMovement } from "../models/movements";
import { IRouteController } from "../routes/index";
import { movementService } from "../services/movements";

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

  static create: IRouteController = async (req, res) => {
    const logger = new Log(res.locals.requestId, "MovementController.create");
    try {
      const companyCode = res.locals.companyCode;
      const movement: IMovement = req.body;
      const date = new Date(); // Fecha actual
      date.setHours(date.getHours() - 3);
      movement.date = date;
      movement.companyCode = companyCode;
      if (movement.client === "") delete movement.client;

      const created = await movementService.insertOne(movement);
      if (!created) throw new Error("No se creo la venta");
      return res
        .status(200)
        .json({ ack: 0, message: "Se creo la venta correctamente" });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  static update: IRouteController = async (req, res) => {
    const logger = new Log(res.locals.requestId, "MovementController.update");
    try {
      const companyCode = res.locals.companyCode;
      const mov: IMovement = req.body;
      /** Verificar si existe */
      const exist = await movementService.findOne({
        _id: mov._id,
      });
      if (!exist) throw new Error("Venta no encontrada");
      const movUpdated = await movementService.updateOne({ _id: mov._id }, mov);
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
      const companyCode = res.locals.companyCode;
      const id = req.params.id;
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
}
