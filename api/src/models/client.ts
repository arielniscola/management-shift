import { createModel, createSchema } from ".";

export interface IClient {
  _id?: string;
  companyCode: string;
  firstname: string;
  lastname: string;
  phonenumber: string;
  email: string;
  address: string;
  identificationNumber: string;
  debt?: boolean;
}

export const ClientSchema = createSchema<IClient>({
  companyCode: {
    type: String,
    required: false,
  },
  firstname: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: false,
  },
  lastname: {
    type: String,
    required: true,
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
