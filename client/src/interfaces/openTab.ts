import { IPaymentMethod } from "./paymentMethod";

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
  _id?: string;
  name: string;
  companyCode?: string;
  state: "open" | "dividing" | "paying" | "closed";
  createdAt: Date;
  sharedProducts: IOpenTabProduct[];
  participants: IOpenTabParticipant[];
  totalAmount: number;
  divisionType?: "equal" | "byProduct";
  generatedMovements: string[];
}
