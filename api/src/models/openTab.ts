import { ObjectId, Schema } from "mongoose";
import { createModel, createSchema } from ".";
import { IProduct, ProductSchema } from "./products";
import { IPaymentMethod, PaymentMethodSchema } from "./paymentMethod";

export interface IOpenTabProduct {
  _id?: string;
  productId?: string;  // ID real del producto en la BD para stock
  code: string;
  name: string;
  price: number;
  units: number;
}

export interface IOpenTabPayment {
  _id?: string;
  date: Date;
  amount: number;
  paymentMethod: IPaymentMethod;
}

export interface IOpenTabParticipant {
  _id?: string;
  clientId?: string;
  clientName: string;
  products: IOpenTabProduct[];
  subtotal: number;
  isPaid: boolean;
  payments: IOpenTabPayment[];
}

export interface IOpenTab {
  _id?: ObjectId;
  name: string;
  companyCode: string;
  state: "open" | "dividing" | "paying" | "closed";
  createdAt: Date;
  sharedProducts: IOpenTabProduct[];
  participants: IOpenTabParticipant[];
  totalAmount: number;
  divisionType?: "equal" | "byProduct";
  generatedMovements: string[];
}

const OpenTabProductSchema = createSchema<IOpenTabProduct>(
  {
    productId: { type: String, required: false },  // ID real del producto
    code: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    units: { type: Number, required: true, default: 1 },
  },
  { timestamps: false, versionKey: false }
);

const OpenTabPaymentSchema = createSchema<IOpenTabPayment>(
  {
    date: { type: Date, required: true },
    amount: { type: Number, required: true },
    paymentMethod: { type: PaymentMethodSchema, required: true },
  },
  { timestamps: false, versionKey: false }
);

const OpenTabParticipantSchema = createSchema<IOpenTabParticipant>(
  {
    clientId: { type: String, required: false },
    clientName: { type: String, required: true },
    products: { type: [OpenTabProductSchema], default: [] },
    subtotal: { type: Number, required: true, default: 0 },
    isPaid: { type: Boolean, required: true, default: false },
    payments: { type: [OpenTabPaymentSchema], default: [] },
  },
  { timestamps: false, versionKey: false }
);

const OpenTabSchema = createSchema<IOpenTab>({
  name: { type: String, required: true },
  companyCode: { type: String, required: true },
  state: {
    type: String,
    required: true,
    enum: ["open", "dividing", "paying", "closed"],
    default: "open",
  },
  createdAt: { type: Date, required: true, default: Date.now },
  sharedProducts: { type: [OpenTabProductSchema], default: [] },
  participants: { type: [OpenTabParticipantSchema], default: [] },
  totalAmount: { type: Number, required: true, default: 0 },
  divisionType: {
    type: String,
    enum: ["equal", "byProduct"],
    required: false,
  },
  generatedMovements: { type: [String], default: [] },
});

OpenTabSchema.index({ companyCode: 1, state: 1 });

export const OpenTabModel = createModel<IOpenTab>("openTab", OpenTabSchema);
