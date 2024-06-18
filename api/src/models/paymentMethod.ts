import { createModel, createSchema } from ".";

export interface IPaymentMethod {
  companyCode: string;
  name: string;
  description: string;
  identificationNumber: string;
  alias: string;
}

export const PaymentMethodSchema = createSchema<IPaymentMethod>(
  {
    companyCode: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    identificationNumber: {
      type: String,
      required: false,
    },
    alias: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: false,
  }
);

export const PaymentMethodModel = createModel(
  "paymentMethod",
  PaymentMethodSchema
);
