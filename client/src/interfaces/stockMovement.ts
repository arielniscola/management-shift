import { IProduct } from "./producto";

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
  date: string;
  createdBy?: string;
}

export interface StockValidationWarning {
  productId: string;
  productName: string;
  requested: number;
  available: number;
  hasWarning: boolean;
}

export interface StockValidationResult {
  hasWarnings: boolean;
  warnings: StockValidationWarning[];
}
