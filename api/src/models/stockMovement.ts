import { Schema } from "mongoose";
import { createModel, createSchema } from ".";
import { IProduct } from "./products";

export interface IStockMovement {
  _id?: string;
  product: string | IProduct;
  type: "sale" | "entry" | "adjustment";
  quantity: number;
  previousStock: number;
  newStock: number;
  reference?: string;
  notes?: string;
  companyCode: string;
  date: Date;
  createdBy?: string;
}

export const StockMovementSchema = createSchema<IStockMovement>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    type: {
      type: String,
      enum: ["sale", "entry", "adjustment"],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    previousStock: {
      type: Number,
      required: true,
    },
    newStock: {
      type: Number,
      required: true,
    },
    reference: {
      type: String,
      required: false,
    },
    notes: {
      type: String,
      required: false,
    },
    companyCode: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
    createdBy: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

StockMovementSchema.index({ product: 1, companyCode: 1 });
StockMovementSchema.index({ date: -1 });
StockMovementSchema.index({ type: 1 });

export const StockMovementModel = createModel(
  "stockMovement",
  StockMovementSchema
);
