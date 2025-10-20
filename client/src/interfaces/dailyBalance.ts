import { IMovement } from "./movement";
import { IPayment } from "./payment";
import { IWithdrawal } from "./withdrawal";

export interface DailyBalanceResponse {
  movements: IMovement[];
  dailyBalance: IDailyBalance;
}

export interface ICloseDailyBalanceResponse {
  id: number;
  balance: IDailyBalance;
  withdrawals: IWithdrawal[];
  payments: IPayment[];
}

export interface IDailyBalanceIds {
  _id?: string;
  identificationNumber: number;
  date: string;
  state: string;
}

export interface IDailyBalance {
  _id?: string;
  companyCode: string;
  date: Date;
  closedTime: Date;
  finalAmountCash: number;
  finalAmountTransfer: number;
  state: string;
  initialAmountCash: number;
  initialAmountTransfer: number;
  totalWithdrawalCash: number;
  totalWithdrawalTransfer: number;
  identificationNumber: number;
  realAmountCash: number;
  realAmountTransfer: number;
}
