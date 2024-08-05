import { IPaymentMethod } from "./paymentMethod";
import { IProduct } from "./producto";

export interface IMovement {
  _id?: string;
  date: string;
  details: IProduct[];
  totalAmount: number;
  state: string;
  paymentMethod?: IPaymentMethod;
  client: string;
}
