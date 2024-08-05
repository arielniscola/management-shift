import { IPaymentMethod } from "../interfaces/paymentMethod";
import { ResponseApi } from "../interfaces/responseApi";
import { URL_API } from "./constants";

export const getPaymentMethods = async (id?: string) => {
  try {
    const res = await fetch(`${URL_API}/paymentMethod?id=${id ? id : ""}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const response: ResponseApi<IPaymentMethod> = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createPaymentMethod = async (paymentMethod: IPaymentMethod) => {
  try {
    const res = await fetch(`${URL_API}/paymentMethod`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentMethod),
    });
    const response: ResponseApi<String> = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response;
  } catch (error) {
    throw error;
  }
};
export const updatePaymentMethod = async (paymentMethod: IPaymentMethod) => {
  try {
    const res = await fetch(`${URL_API}/paymentMethod`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentMethod),
    });
    const response: ResponseApi<String> = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deletePaymentMethod = async (id: string) => {
  try {
    const res = await fetch(`${URL_API}/paymentMethod/${id}`, {
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
