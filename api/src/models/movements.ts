import { ObjectId } from "mongoose";
import { createModel, createSchema } from ".";
import { IPaymentMethod, PaymentMethodSchema } from "./paymentMethod";
import { IProduct, ProductSchema } from "./products";

export interface IMovement {
  _id: ObjectId;
  date: Date;
  details: IProduct[];
  totalAmount: number;
  state: string;
  paymentMethod: IPaymentMethod;
  companyCode: string;
  processed: Boolean;
  client: string;
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
  companyCode: {
    type: String,
    required: true,
  },
  processed: {
    type: Boolean,
    require: true,
    default: false,
  },
  client: {
    type: String,
    required: false,
  },
});

export const MovementModel = createModel("movement", MovementSchema);
