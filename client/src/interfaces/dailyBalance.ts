import { IMovement } from "./movement";

export interface DailyBalanceResponse {
  movements: IMovement[];
  dailyBalance: IDailyBalance;
}

export interface IDailyBalance {
  companyCode: string;
  date: string;
  closedTime: string;
  finalBalance: number;
  state: string;
}
