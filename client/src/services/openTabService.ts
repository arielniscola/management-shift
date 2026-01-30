import { unauthorized } from ".";
import { IOpenTab, IOpenTabProduct } from "../interfaces/openTab";
import { IPaymentMethod } from "../interfaces/paymentMethod";
import { ResponseApi } from "../interfaces/responseApi";
import { URL_API } from "./constants";

const getAuthHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const getOpenTabs = async (includeAll: boolean = false): Promise<IOpenTab[]> => {
  try {
    const res = await fetch(
      `${URL_API}/open-tab?includeAll=${includeAll}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      }
    );
    if (res.status === 401) unauthorized();
    const response: ResponseApi<IOpenTab[]> = await res.json();
    if (!res.ok) throw new Error(response.message || "Error al obtener cuentas");
    return response.data as IOpenTab[];
  } catch (error) {
    throw error;
  }
};

export const getOpenTab = async (id: string): Promise<IOpenTab> => {
  try {
    const res = await fetch(`${URL_API}/open-tab/${id}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (res.status === 401) unauthorized();
    const response: ResponseApi<IOpenTab> = await res.json();
    if (!res.ok) throw new Error(response.message || "Error al obtener cuenta");
    return response.data as IOpenTab;
  } catch (error) {
    throw error;
  }
};

export const createOpenTab = async (name: string): Promise<IOpenTab> => {
  try {
    const res = await fetch(`${URL_API}/open-tab`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    if (res.status === 401) unauthorized();
    const response: ResponseApi<IOpenTab> = await res.json();
    if (!res.ok) throw new Error(response.message || "Error al crear cuenta");
    return response.data as IOpenTab;
  } catch (error) {
    throw error;
  }
};

export const addProductToTab = async (
  tabId: string,
  product: IOpenTabProduct
): Promise<IOpenTab> => {
  try {
    const res = await fetch(`${URL_API}/open-tab/${tabId}/product`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ product }),
    });
    if (res.status === 401) unauthorized();
    const response: ResponseApi<IOpenTab> = await res.json();
    if (!res.ok) throw new Error(response.message || "Error al agregar producto");
    return response.data as IOpenTab;
  } catch (error) {
    throw error;
  }
};

export const removeProductFromTab = async (
  tabId: string,
  productIndex: number
): Promise<IOpenTab> => {
  try {
    const res = await fetch(`${URL_API}/open-tab/${tabId}/product/${productIndex}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.status === 401) unauthorized();
    const response: ResponseApi<IOpenTab> = await res.json();
    if (!res.ok) throw new Error(response.message || "Error al eliminar producto");
    return response.data as IOpenTab;
  } catch (error) {
    throw error;
  }
};

export const updateProductUnits = async (
  tabId: string,
  productIndex: number,
  units: number
): Promise<IOpenTab> => {
  try {
    const res = await fetch(`${URL_API}/open-tab/${tabId}/product/${productIndex}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({ units }),
    });
    if (res.status === 401) unauthorized();
    const response: ResponseApi<IOpenTab> = await res.json();
    if (!res.ok) throw new Error(response.message || "Error al actualizar producto");
    return response.data as IOpenTab;
  } catch (error) {
    throw error;
  }
};

export const divideTabEqual = async (
  tabId: string,
  participants: { clientId?: string; clientName: string }[]
): Promise<IOpenTab> => {
  try {
    const res = await fetch(`${URL_API}/open-tab/${tabId}/divide/equal`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ participants }),
    });
    if (res.status === 401) unauthorized();
    const response: ResponseApi<IOpenTab> = await res.json();
    if (!res.ok) throw new Error(response.message || "Error al dividir cuenta");
    return response.data as IOpenTab;
  } catch (error) {
    throw error;
  }
};

export const divideTabByProducts = async (
  tabId: string,
  assignments: {
    clientId?: string;
    clientName: string;
    productIndices: number[];
  }[]
): Promise<IOpenTab> => {
  try {
    const res = await fetch(`${URL_API}/open-tab/${tabId}/divide/by-products`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ assignments }),
    });
    if (res.status === 401) unauthorized();
    const response: ResponseApi<IOpenTab> = await res.json();
    if (!res.ok) throw new Error(response.message || "Error al dividir cuenta");
    return response.data as IOpenTab;
  } catch (error) {
    throw error;
  }
};

export const addProductToParticipant = async (
  tabId: string,
  participantId: string,
  product: IOpenTabProduct
): Promise<IOpenTab> => {
  try {
    const res = await fetch(
      `${URL_API}/open-tab/${tabId}/participant/${participantId}/product`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ product }),
      }
    );
    if (res.status === 401) unauthorized();
    const response: ResponseApi<IOpenTab> = await res.json();
    if (!res.ok) throw new Error(response.message || "Error al agregar producto");
    return response.data as IOpenTab;
  } catch (error) {
    throw error;
  }
};

export const removeProductFromParticipant = async (
  tabId: string,
  participantId: string,
  productIndex: number
): Promise<IOpenTab> => {
  try {
    const res = await fetch(
      `${URL_API}/open-tab/${tabId}/participant/${participantId}/product/${productIndex}`,
      {
        method: "DELETE",
        headers: getAuthHeaders(),
      }
    );
    if (res.status === 401) unauthorized();
    const response: ResponseApi<IOpenTab> = await res.json();
    if (!res.ok) throw new Error(response.message || "Error al eliminar producto");
    return response.data as IOpenTab;
  } catch (error) {
    throw error;
  }
};

export const transferProduct = async (
  tabId: string,
  fromParticipantId: string,
  toParticipantId: string,
  productIndex: number,
  units: number
): Promise<IOpenTab> => {
  try {
    const res = await fetch(`${URL_API}/open-tab/${tabId}/transfer`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify({
        fromParticipantId,
        toParticipantId,
        productIndex,
        units,
      }),
    });
    if (res.status === 401) unauthorized();
    const response: ResponseApi<IOpenTab> = await res.json();
    if (!res.ok) throw new Error(response.message || "Error al transferir producto");
    return response.data as IOpenTab;
  } catch (error) {
    throw error;
  }
};

export const registerParticipantPayment = async (
  tabId: string,
  participantId: string,
  payments: { amount: number; paymentMethod: IPaymentMethod }[]
): Promise<IOpenTab> => {
  try {
    const res = await fetch(`${URL_API}/open-tab/${tabId}/pay/${participantId}`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ payments }),
    });
    if (res.status === 401) unauthorized();
    const response: ResponseApi<IOpenTab> = await res.json();
    if (!res.ok) throw new Error(response.message || "Error al registrar pago");
    return response.data as IOpenTab;
  } catch (error) {
    throw error;
  }
};

export const closeOpenTab = async (tabId: string): Promise<IOpenTab> => {
  try {
    const res = await fetch(`${URL_API}/open-tab/${tabId}/close`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    if (res.status === 401) unauthorized();
    const response: ResponseApi<IOpenTab> = await res.json();
    if (!res.ok) throw new Error(response.message || "Error al cerrar cuenta");
    return response.data as IOpenTab;
  } catch (error) {
    throw error;
  }
};

export const cancelOpenTab = async (tabId: string): Promise<void> => {
  try {
    const res = await fetch(`${URL_API}/open-tab/${tabId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (res.status === 401) unauthorized();
    const response: ResponseApi<void> = await res.json();
    if (!res.ok) throw new Error(response.message || "Error al cancelar cuenta");
  } catch (error) {
    throw error;
  }
};
