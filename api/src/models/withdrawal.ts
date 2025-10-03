import { createModel, createSchema } from ".";

export interface IWithdrawal {
  amount: number;
  observations: string;
  withdrawnBy: string;
  companyCode: string;
  reason?: string;
  date: Date;
  processed: boolean;
  type: string;
  createdAt: Date;
  updatedAt: Date;
}

const WithdrawalSchema = createSchema<IWithdrawal>(
  {
    amount: { type: Number, required: true },
    companyCode: { type: String, required: true },
    observations: { type: String, required: false },
    withdrawnBy: { type: String, required: false },
    date: { type: Date, required: true, default: Date.now },
    processed: { type: Boolean, required: true, default: false },
    type: { type: String, required: true },
    reason: { type: String, required: false },
  },
  { timestamps: true }
);

export const WithdrawalModel = createModel<IWithdrawal>(
  "Withdrawal",
  WithdrawalSchema
);
