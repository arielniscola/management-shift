import { createModel, createSchema } from ".";

export interface IDailyBalance {
  companyCode: string;
  date: Date;
  closedTime: Date;
  finalBalance: number;
  state: string;
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
      required: true,
    },
    finalBalance: {
      type: Number,
      required: false,
    },
    state: {
      type: String,
      required: true,
      enum: ["pending", "closed"],
    },
  },
  {
    timestamps: false,
  }
);

DailyBalanceSchema.index({ date: 1, companyCode: 1 }, { unique: true });

export const DailyBalanceModel = createModel(
  "dailyBalance",
  DailyBalanceSchema
);
