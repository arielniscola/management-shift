import { IClient } from "../interfaces/client";
import { IMovement } from "../interfaces/movement";
import { ResponseApi } from "../interfaces/responseApi";
import { URL_API } from "./constants";

export const getClients = async () => {
  try {
    const res = await fetch(`${URL_API}/clients?`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const response: ResponseApi<IClient> = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createClient = async (client: IClient) => {
  try {
    const res = await fetch(`${URL_API}/clients`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(client),
    });
    const response: ResponseApi<String> = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateClient = async (client: IClient) => {
  try {
    const res = await fetch(`${URL_API}/clients`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(client),
    });
    const response: ResponseApi<String> = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const getMovementsClient = async (id: string = "") => {
  try {
    const res = await fetch(`${URL_API}/clients/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const response: ResponseApi<IMovement> = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
