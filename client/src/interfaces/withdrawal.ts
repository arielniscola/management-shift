export interface IWithdrawal {
  _id?: string;
  amount: number;
  observations: string;
  withdrawnBy: string;
  companyCode: string;
  reason?: string;
  date: Date;
  type: string;
  processed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
