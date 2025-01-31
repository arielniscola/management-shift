import { IClient } from "./client";

export interface IShift {
  _id: string;
  timeStart: string;
  timeEnd: string;
  status: string;
  client: string | IClient;
  unitBusiness: string;
  notificated?: boolean;
  companyCode?: string;
  permanet?: boolean;
  date: string;
  description?: string;
}
