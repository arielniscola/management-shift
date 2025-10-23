import moment from "moment";
import Log from "../libs/logger";
import { IRouteController } from "../routes/index";
import { movementService } from "../services/movements";
import { IPayment } from "../models/payment";
import { paymentService } from "../services/payment";

export class PaymentController {
  static find: IRouteController<{}, {}, {}, { date: string; client: string }> =
    async (req, res) => {
      const logger = new Log(res.locals.requestId, "PaymentController.find");
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
        const data: IPayment[] = await paymentService.find(
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
    const logger = new Log(res.locals.requestId, "PaymentController.create");
    try {
      const companyCode = res.locals.companyCode;
      const payment: IPayment = req.body;
      const date = new Date();
      payment.date = date;
      payment.companyCode = companyCode;
      if (payment.client === "") delete payment.client;
      const created = await paymentService.insertOne(payment);
      console.log(created);
      if (!created) throw new Error("No se creo el pago");
      /** Actualizar movimientos pagados */
      await paymentService.updateMovements(payment, companyCode);
      return res
        .status(200)
        .json({ ack: 0, message: "Se creo el pago correctamente" });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  static delete: IRouteController = async (req, res) => {
    const logger = new Log(res.locals.requestId, "PaymentController.delete");
    try {
      const companyCode = res.locals.companyCode;
      const id = req.params.id;
      const deleted = await movementService.deleteOne({
        _id: id,
        companyCode,
      });
      if (!deleted) throw new Error("Pago no eliminado");
      return res
        .status(200)
        .json({ ack: 0, message: "Pago eliminado correctamente" });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };
}
