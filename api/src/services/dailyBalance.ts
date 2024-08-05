import moment from "moment";
import { Service } from ".";
import Log from "../libs/logger";
import { DailyBalanceModel, IDailyBalance } from "../models/dailyBalance";

export class DailyBalanceService extends Service<IDailyBalance> {
  constructor() {
    super(DailyBalanceModel);
  }

  /** Procesar las ventas en un fecha */
  async processMovements(companyCode: string, logger: Log): Promise<void> {
    try {
      logger.info(`Procesando
         ventas de la compañia: ${companyCode}`);
      let dailyBalance: IDailyBalance;
      const date = moment().format("YYYY/MM/DD");
      /** Buscar ultimo cierre de la compañia */
      const balance = await dailyBalanceService.findOne(
        {
          companyCode: companyCode,
        },
        {},
        { sort: { date: -1 } }
      );
      /** Si no esta cerrado seguimos procesando */
      if (moment(balance.date).format("YYYY/MM/DD") !== date) {
        if (balance.state === "pending") {
          dailyBalance = balance;
        } else {
        }
      }
    } catch (error) {
      logger.error(error, `Error al ´procesar las ventas: ${error.message}`);
    }
  }
}

export const dailyBalanceService = new DailyBalanceService();
