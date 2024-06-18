import { createModel, createSchema } from ".";
import { IPaymentMethod, PaymentMethodSchema } from "./paymentMethod";
import { IProduct, ProductSchema } from "./products";

export interface IMovement {
  date: Date;
  details: IProduct[];
  totalAmount: number;
  state: string;
  paymentMethod: IPaymentMethod;
}

const MovementSchema = createSchema<IMovement>({
  date: {
    type: Date,
    required: true,
  },
  details: {
    type: [ProductSchema],
  },
  totalAmount: {
    type: Number,
    required: true,
  },
  state: {
    type: String,
    required: true,
    enum: ["paid", "debit"],
    default: "debit",
  },
  paymentMethod: {
    type: PaymentMethodSchema,
    required: false,
  },
});

export const MovementModel = createModel("movement", MovementSchema);
