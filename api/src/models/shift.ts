import { Schema } from "mongoose";
import { createModel, createSchema } from ".";
import { IClient } from "./client";

export interface IShift {
  _id?: string;
  companyCode: string;
  date: Date;
  timeStart: string;
  timeEnd: string;
  status: string;
  notificated: boolean;
  description: string;
  client: string | IClient;
  unitBusiness: string;
  permanent: boolean;
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
  timeStart: {
    type: String,
    required: true,
  },
  timeEnd: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
  notificated: {
    type: Boolean,
    required: true,
    default: false,
  },
  client: {
    type: Schema.Types.ObjectId,
    ref: "client",
    required: false,
  },
  unitBusiness: {
    type: String,
    required: true,
  },
  permanent: {
    type: Boolean,
    required: true,
    default: false,
  },
});

export const ShiftModel = createModel("shift", ShiftSchema);
