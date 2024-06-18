import { createModel, createSchema } from ".";

export interface IProduct {
  code: string;
  name: string;
  description: string;
  price: number;
  units: string;
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
      type: String,
      required: false,
    },
    companyCode: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

ProductSchema.index({ code: 1, companyCode: 1 }, { unique: true });

export const ProductModel = createModel("product", ProductSchema);
