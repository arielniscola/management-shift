import { createModel, createSchema } from ".";

export interface IClient {
  companyCode: string;
  firstname: string;
  lastname: string;
  phonenumber: string;
  email: string;
  address: string;
  identificationNumber: string;
}

export const ClientSchema = createSchema<IClient>({
  companyCode: {
    type: String,
    required: false,
  },
  firstname: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
  },
  lastname: {
    type: String,
    required: false,
  },
  phonenumber: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  identificationNumber: {
    type: String,
    required: false,
  },
});
export const ClientModel = createModel("client", ClientSchema);
