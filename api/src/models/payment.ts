import { createModel, createSchema } from ".";
import { IPaymentMethod, PaymentMethodSchema } from "./paymentMethod";

export interface IPayment {
  _id?: string;
  date: Date;
  amount: number;
  companyCode: string;
  client: string;
  paymentMenthod: IPaymentMethod;
  movementsNumber: string[];
  processed?: boolean;
}

const PaymentSchema = createSchema<IPayment>({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  companyCode: { type: String, required: true },
  client: { type: String, required: true },
  paymentMenthod: { type: PaymentMethodSchema, required: true },
  movementsNumber: { type: [String], required: false },
  processed: { type: Boolean, required: true, default: false },
});

export const PaymentModel = createModel<IPayment>("payment", PaymentSchema);
