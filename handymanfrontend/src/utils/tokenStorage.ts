import type { AuthUser } from "../features/auth/auth.types.ts";
import { STORAGE_KEYS } from "./constants";

export const getToken = () => localStorage.getItem(STORAGE_KEYS.token);

export const setToken = (token: string) =>
  localStorage.setItem(STORAGE_KEYS.token, token);

export const clearToken = () => localStorage.removeItem(STORAGE_KEYS.token);

export const getStoredUser = (): AuthUser | null => {
  const raw = localStorage.getItem(STORAGE_KEYS.user);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

export const setStoredUser = (user: AuthUser) =>
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user));

export const clearStoredUser = () => localStorage.removeItem(STORAGE_KEYS.user);

export const getCustomerId = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.customerId);
  return raw ? Number(raw) : null;
};

export const setCustomerId = (customerId: number) =>
  localStorage.setItem(STORAGE_KEYS.customerId, String(customerId));

export const clearCustomerId = () =>
  localStorage.removeItem(STORAGE_KEYS.customerId);
