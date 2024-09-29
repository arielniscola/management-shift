import Log from "../libs/logger";
import { IShift } from "../models/shift";
import { IRouteController } from "../routes/index";
import { shiftService } from "../services/shift";

export class ShiftController {
  static find: IRouteController<{}, {}, {}, { code?: string }> = async (
    req,
    res
  ) => {
    const logger = new Log(res.locals.requestId, "ShiftController.find");
    try {
      const companyCode = res.locals.companyCode;
      const filter = {
        ...{ companyCode: companyCode },
        ...(req.query.code ? { code: req.query.code } : {}),
      };
      const data: IShift[] = await shiftService.find(filter);

      return res.status(200).json({ ack: 0, data: data });
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ ack: 1, message: e.message });
    }
  };
}
