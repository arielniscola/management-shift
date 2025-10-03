import { Service } from ".";
import { WithdrawalModel, IWithdrawal } from "../models/withdrawal";

export class WithdrawalService extends Service<IWithdrawal> {
  constructor() {
    super(WithdrawalModel);
  }
}

export const withdrawalService = new WithdrawalService();
