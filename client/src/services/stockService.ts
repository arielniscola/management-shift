import { unauthorized } from ".";
import { IProduct } from "../interfaces/producto";
import { ResponseApi } from "../interfaces/responseApi";
import {
  IStockMovement,
  StockValidationResult,
} from "../interfaces/stockMovement";
import { URL_API } from "./constants";

export const getStockMovements = async (
  productId?: string,
  startDate?: string,
  endDate?: string,
  limit?: number
): Promise<IStockMovement[]> => {
  try {
    const params = new URLSearchParams();
    if (productId) params.append("productId", productId);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (limit) params.append("limit", limit.toString());

    const res = await fetch(`${URL_API}/stock/movements?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (res.status === 401) unauthorized();
    const response = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response.data as IStockMovement[];
  } catch (error) {
    throw error;
  }
};

export const getLowStockProducts = async (): Promise<IProduct[]> => {
  try {
    const res = await fetch(`${URL_API}/stock/low`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (res.status === 401) unauthorized();
    const response = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response.data as IProduct[];
  } catch (error) {
    throw error;
  }
};

export const registerStockEntry = async (
  productId: string,
  quantity: number,
  notes?: string
) => {
  try {
    const res = await fetch(`${URL_API}/stock/entry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ productId, quantity, notes }),
    });
    if (res.status === 401) unauthorized();
    const response: ResponseApi<IStockMovement> = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const adjustStock = async (
  productId: string,
  quantity: number,
  notes?: string
) => {
  try {
    const res = await fetch(`${URL_API}/stock/adjustment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ productId, quantity, notes }),
    });
    if (res.status === 401) unauthorized();
    const response: ResponseApi<IStockMovement> = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response;
  } catch (error) {
    throw error;
  }
};

export const validateStock = async (
  products: Array<{ _id: string; units: number; name?: string }>
) => {
  try {
    const res = await fetch(`${URL_API}/stock/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ products }),
    });
    if (res.status === 401) unauthorized();
    const response: ResponseApi<StockValidationResult> = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export interface PaginatedMovements {
  movements: IStockMovement[];
  total: number;
  pages: number;
}

export const getStockMovementsPaginated = async (
  page: number = 1,
  pageSize: number = 20,
  productId?: string,
  startDate?: string,
  endDate?: string
): Promise<PaginatedMovements> => {
  try {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    params.append("pageSize", pageSize.toString());
    if (productId) params.append("productId", productId);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);

    const res = await fetch(`${URL_API}/stock/movements/paginated?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (res.status === 401) unauthorized();
    const response = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response.data as PaginatedMovements;
  } catch (error) {
    throw error;
  }
};

export interface DailySaleItem {
  productId: string;
  productName: string;
  productCode: string;
  totalQuantity: number;
  movements: number;
}

export const getDailySales = async (date: string): Promise<DailySaleItem[]> => {
  try {
    const params = new URLSearchParams();
    params.append("date", date);

    const res = await fetch(`${URL_API}/stock/daily-sales?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    if (res.status === 401) unauthorized();
    const response = await res.json();
    if (!res.ok && typeof response.data == "string")
      throw new Error(response.data);
    return response.data as DailySaleItem[];
  } catch (error) {
    throw error;
  }
};
