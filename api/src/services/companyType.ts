import { Service } from ".";
import { CompanyTypeModel, ICompanyType } from "../models/companyType";

export class CompanyTypeService extends Service<ICompanyType> {
  constructor() {
    super(CompanyTypeModel);
  }
}

export const companyTypeService = new CompanyTypeService();
