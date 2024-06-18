import { Service } from ".";
import { CompanyModel, ICompany } from "../models/company";

export class CompanyService extends Service<ICompany> {
  constructor() {
    super(CompanyModel);
  }
}

export const companyService = new CompanyService();
