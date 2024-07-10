import Log from "../libs/logger";
import { IRouteController } from "../routes";

export class MovementController {
  static find: IRouteController = (req, res) => {
    const logger = new Log(res.locals.requestId, "MovementController.find");
    try {
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ message: e.message });
    }
  };

  static create: IRouteController = (req, res) => {
    const logger = new Log(res.locals.requestId, "MovementController.create");
    try {
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ message: e.message });
    }
  };

  static update: IRouteController = (req, res) => {
    const logger = new Log(res.locals.requestId, "MovementController.update");
    try {
    } catch (e) {
      logger.error(e);
      return res.status(400).json({ message: e.message });
    }
  };
}
