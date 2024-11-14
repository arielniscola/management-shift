import { IMovement } from "../interfaces/movement";
import { ResponseApi } from "../interfaces/responseApi";
import { URL_API } from "./constants";

export const getMovements = async (date?: string) => {
  try {
    const res = await fetch(`${URL_API}/movement?date=${date ? date : ""}`, {
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
export const getLastsMovements = async () => {
  try {
    const res = await fetch(`${URL_API}/movement/lasts`, {
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

export const createMovement = async (mov: IMovement) => {
  try {
    const res = await fetch(`${URL_API}/movement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mov),
    });
    const response: ResponseApi<String> = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateMovement = async (mov: IMovement) => {
  try {
    const res = await fetch(`${URL_API}/movement`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mov),
    });
    const response: ResponseApi<String> = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response;
  } catch (error) {
    throw error;
  }
};
export const deleteMovement = async (id: string = "") => {
  try {
    const res = await fetch(`${URL_API}/movement/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    const response: ResponseApi<String> = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response;
  } catch (error) {
    throw error;
  }
};
