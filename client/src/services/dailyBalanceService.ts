import { DailyBalanceResponse } from "../interfaces/dailyBalance";
import { ResponseApi } from "../interfaces/responseApi";
import { URL_API } from "./constants";

export const getDailyBalance = async (date?: string) => {
  try {
    const res = await fetch(
      `${URL_API}/daily-balance?date=${date ? date : ""}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    const response: ResponseApi<DailyBalanceResponse> = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};
