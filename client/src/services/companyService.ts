import { unauthorized } from ".";
import { URL_API } from "./constants";

export const validateSuperAdminPassword = async (password: string) => {
  try {
    const res = await fetch(`${URL_API}/company/validate-superadmin`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ password }),
    });
    if (res.status === 401) unauthorized();
    const response = await res.json();
    return response;
  } catch (error) {
    throw error;
  }
};

export const setSuperAdminPassword = async (password: string) => {
  try {
    const res = await fetch(`${URL_API}/company/set-superadmin-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ password }),
    });
    if (res.status === 401) unauthorized();
    const response = await res.json();
    return response;
  } catch (error) {
    throw error;
  }
};
