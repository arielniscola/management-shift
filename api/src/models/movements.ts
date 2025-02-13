import { ObjectId, Schema } from "mongoose";
import { createModel, createSchema } from ".";
import { IPaymentMethod, PaymentMethodSchema } from "./paymentMethod";
import { IProduct, ProductSchema } from "./products";
import { IClient } from "./client";
import { cli } from "winston/lib/winston/config";

export interface IMovement {
  _id: ObjectId;
  date: Date;
  details: IProduct[];
  totalAmount: number;
  state: string;
  paymentMethod: IPaymentMethod;
  companyCode: string;
  processed: Boolean;
  client: string | IClient;
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
    type: Schema.Types.ObjectId,
    ref: "client",
    required: false,
  },
});

//create index
MovementSchema.index({ companyCode: 1, state: 1, client: 1 });

export const MovementModel = createModel("movement", MovementSchema);
