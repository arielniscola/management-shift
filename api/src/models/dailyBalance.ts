import { createModel, createSchema } from ".";

export interface IDailyBalance {
  _id?: string;
  companyCode: string;
  date: Date;
  closedTime: Date;
  finalAmountCash: number;
  finalAmountTransfer: number;
  state: string;
  initialAmountCash: number;
  initialAmountTransfer: number;
  totalWithdrawalCash: number;
  totalWithdrawalTransfer: number;
  identificationNumber: number;
  realAmountCash?: number;
  realAmountTransfer?: number;
}

const DailyBalanceSchema = createSchema<IDailyBalance>(
  {
    companyCode: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    closedTime: {
      type: Date,
      required: false,
    },
    finalAmountCash: {
      type: Number,
      required: false,
    },
    initialAmountCash: {
      type: Number,
      required: false,
    },
    initialAmountTransfer: {
      type: Number,
      required: false,
    },
    totalWithdrawalCash: {
      type: Number,
      required: false,
    },
    totalWithdrawalTransfer: {
      type: Number,
      required: false,
    },
    state: {
      type: String,
      required: true,
      enum: ["pending", "closed"],
    },
    identificationNumber: {
      type: Number,
      required: true,
    },
    realAmountCash: {
      type: Number,
      required: false,
      default: 0,
    },
    realAmountTransfer: {
      type: Number,
      required: false,
      default: 0,
    },
    finalAmountTransfer: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: false,
  }
);

export const DailyBalanceModel = createModel(
  "dailyBalance",
  DailyBalanceSchema
);
