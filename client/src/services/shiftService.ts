import { addDays, format, startOfWeek } from "date-fns";
import { ResponseApi } from "../interfaces/responseApi";
import { IShift } from "../interfaces/shift";
import { URL_API } from "./constants";

export const getShifts = async (date: string, unitBusiness: string) => {
  try {
    /** Configurar fecha como principio de semana */
    const newDate = new Date(date);
    const startWeek = addDays(startOfWeek(newDate), 1);

    const res = await fetch(
      `${URL_API}/shifts?date=${format(
        startWeek,
        "yyyy-MM-dd"
      )}&unitBusiness=${unitBusiness}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    const response: ResponseApi<IShift> = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createShift = async (shift: Partial<IShift>) => {
  try {
    const res = await fetch(`${URL_API}/shifts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shift),
    });
    const response: ResponseApi<String> = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const updateShift = async (shift: Partial<IShift>) => {
  try {
    const res = await fetch(`${URL_API}/shifts`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shift),
    });
    const response: ResponseApi<String> = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response;
  } catch (error) {
    throw error;
  }
};
export const deleteShift = async (id: string = "") => {
  try {
    const res = await fetch(`${URL_API}/shifts/${id}`, {
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