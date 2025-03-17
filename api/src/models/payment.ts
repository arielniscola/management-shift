import { createModel, createSchema } from ".";
import { IPaymentMethod, PaymentMethodSchema } from "./paymentMethod";

export interface IPayment {
  date: Date;
  amount: number;
  companyCode: string;
  client: string;
  paymentMenthod: IPaymentMethod;
  movementsNumber: string[];
}

const PaymentSchema = createSchema<IPayment>({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  companyCode: { type: String, required: true },
  client: { type: String, required: true },
  paymentMenthod: { type: PaymentMethodSchema, required: true },
  movementsNumber: { type: [String], required: false },
});

PaymentSchema.index({ client: 1, companyCode: 1 }, { unique: true });

export const PaymentModel = createModel<IPayment>("payment", PaymentSchema);
