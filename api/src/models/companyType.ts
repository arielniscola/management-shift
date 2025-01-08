import { createModel, createSchema } from ".";

export interface ICompanyType {
  code: string;
  name: string;
  description: string;
}

export const CompanyTypeSchema = createSchema<ICompanyType>({
  code: {
    type: String,
    required: true,
    unique: true,
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

export const CompanyTypeModel = createModel("companyType", CompanyTypeSchema);
