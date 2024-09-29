import { Service } from ".";
import { ClientModel, IClient } from "../models/client";

export class ClientService extends Service<IClient> {
  constructor() {
    super(ClientModel);
  }
}

export const clientService = new ClientService();
