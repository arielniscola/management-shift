import { createModel, createSchema } from ".";
import { ClientSchema, IClient } from "./client";
import { IUnitBusiness } from "./unitBusiness";

export interface IShift {
  companyCode: string;
  date: Date;
  time: string;
  state: string;
  notificated: boolean;
  description: string;
  client: IClient;
  unitBusiness: string;
}

export const ShiftSchema = createSchema<IShift>({
  companyCode: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  notificated: {
    type: Boolean,
    required: true,
    default: false,
  },
  client: {
    type: ClientSchema,
    required: false,
  },
  unitBusiness: {
    type: String,
    required: true,
  },
});

export const ShiftModel = createModel("shift", ShiftSchema);
