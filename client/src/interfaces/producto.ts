export interface IProduct {
  _id?: string;
  code: string;
  name: string;
  description: string;
  price: number;
  units: number;
  companyCode?: string;
  stock: number;
  minimumStock: number;
  excludeFromAccounting?: boolean;
}
