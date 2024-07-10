import Log from "../libs/logger";
import { IPaymentMethod } from "../models/paymentMethod";
import { IRouteController } from "../routes";
import { paymentMethodService } from "../services/paymentMethod";

export class PaymentMethodController {
  static find: IRouteController<{}, {}, {}, { code: string }> = async (
    req,
    res
  ) => {
    const logger = new Log(
      res.locals.requestId,
      "PaymentMethodController.find"
    );
    try {
      const companyCode = res.locals.companyCode;
      const filter = {
        ...{ companyCode: companyCode },
        ...(req.query.code ? { code: req.query.code } : {}),
      };
      const data: IPaymentMethod[] = await paymentMethodService.find(filter);

      return res.status(200).json({ ack: 0, data: data });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ message: e.message });
    }
  };

  static create: IRouteController = async (req, res) => {
    const logger = new Log(
      res.locals.requestId,
      "PaymentMethodController.create"
    );
    try {
      const companyCode = res.locals.companyCode;
      const paymentMethod: IPaymentMethod = req.body;

      const exist = await paymentMethodService.findOne({
        companyCode: companyCode,
        identificationNumber: paymentMethod.identificationNumber,
      });
      if (exist) throw "Ya existe metodo de pago con mismo CBU";
      const create = await paymentMethodService.insertOne(paymentMethod);
      if (!create) throw "Metodo de pago no se pudo crear correctamente";

      return res.status(200).json({ ack: 0, message: "Metodo de pago creado" });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };

  static update: IRouteController = (req, res) => {
    const logger = new Log(
      res.locals.requestId,
      "PaymentMethodController.update"
    );
    try {
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ message: e.message });
    }
  };
}
