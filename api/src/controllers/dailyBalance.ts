import moment from "moment";
import Log from "../libs/logger";
import { IRouteController } from "../routes/index";
import { IMovement } from "../models/movements";
import { movementService } from "../services/movements";
import { dailyBalanceService } from "../services/dailyBalance";

export class DailyBalanceController {
  static find: IRouteController<{}, {}, {}, { date: string }> = async (
    req,
    res
  ) => {
    const logger = new Log(res.locals.requestId, "MovementController.find");
    try {
      const companyCode = res.locals.companyCode;
      const startDate = moment(req.query.date, "YYYY/MM/DD");
      const endDate = moment(req.query.date, "YYYY/MM/DD").endOf("day");
      const filter = {
        ...{ companyCode: companyCode },
        ...(req.query.date
          ? { date: { $gte: startDate.toDate(), $lte: endDate.toDate() } }
          : {}),
      };
      const movements = await movementService.find(filter);

      const balance = await dailyBalanceService.findOne(filter);

      return res
        .status(200)
        .json({ ack: 0, data: { movements: movements, balance: balance } });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };
}
