import { IPaymentMethod } from "./paymentMethod";

export interface IPayment {
  _id?: string;
  date: Date;
  amount: number;
  companyCode?: string;
  client: string;
  paymentMenthod: IPaymentMethod;
  movementsNumber: string[];
}
