import { Service } from ".";
import { DailyBalanceModel, IDailyBalance } from "../models/dailyBalance";

export class DailyBalanceService extends Service<IDailyBalance> {
  constructor() {
    super(DailyBalanceModel);
  }
}

export const dailyBalanceService = new DailyBalanceService();
