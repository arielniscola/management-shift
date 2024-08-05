import { IProduct } from "../interfaces/producto";
import { ResponseApi } from "../interfaces/responseApi";
import { URL_API } from "./constants";

export const getProducts = async (code?: string) => {
  try {
    const res = await fetch(`${URL_API}/product?code=${code ? code : ""}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    const response: ResponseApi<IProduct> = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createProduct = async (product: IProduct) => {
  try {
    const res = await fetch(`${URL_API}/product`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    const response: ResponseApi<String> = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateProduct = async (product: IProduct) => {
  try {
    const res = await fetch(`${URL_API}/product`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    const response: ResponseApi<String> = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const deleteProduct = async (id: string) => {
  try {
    const res = await fetch(`${URL_API}/product/${id}`, {
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
