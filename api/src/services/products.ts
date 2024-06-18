import { Service } from ".";
import { IProduct, ProductModel } from "../models/products";

export class ProductService extends Service<IProduct> {
  constructor() {
    super(ProductModel);
  }
}

export const productService = new ProductService();
