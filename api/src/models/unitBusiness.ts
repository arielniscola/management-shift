import { createSchema } from ".";

export interface IUnitBusiness {
  companyCode: string;
  description: string;
  code: string;
  name: string;
  timetableStart: string;
  timetableEnd: string;
  shiftDuration: string;
  waitingTime: string;
}

export const UnitBusinessSchema = createSchema<IUnitBusiness>({
  code: {
    type: String,
    required: true,
  },
  companyCode: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
});
