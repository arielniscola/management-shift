import { createModel, createSchema } from ".";

export interface IProduct {
  _id?: string;
  code: string;
  name: string;
  description: string;
  price: number;
  units: Number;
  stock: number;
  companyCode: string;
}

export const ProductSchema = createSchema<IProduct>(
  {
    code: {
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
    price: {
      type: Number,
      required: true,
    },
    units: {
      type: Number,
      required: false,
    },
    companyCode: {
      type: String,
      required: false,
    },
    stock: {
      type: Number,
      required: false,
    },
  },
  {
    timestamps: false,
  }
);

ProductSchema.index({ code: 1, companyCode: 1 });

export const ProductModel = createModel("product", ProductSchema);
