import { httpClient } from "./httpClient";
import type { Customer, AdminUser, AdminUpdatePayload } from "../features/admin/admin.types";
import type { Worker } from "../features/handyman/handyman.types";

export const getCustomerProfile = (id: number) =>
  httpClient.get<Customer>(`/api/customers/${id}`);

export const updateCustomerProfile = (
  id: number,
  payload: Omit<Customer, "customerId">
) => httpClient.put<void>(`/api/customers/${id}`, payload);

export const getWorkerProfile = (id: number) =>
  httpClient.get<Worker>(`/api/workers/${id}`);

export const updateWorkerProfile = (
  id: number,
  payload: Omit<Worker, "workerId">
) => httpClient.put<void>(`/api/workers/${id}`, payload);

export const getAdminProfile = (id: number) =>
  httpClient.get<AdminUser>(`/api/admins/${id}`);

export const updateAdminProfile = (id: number, payload: AdminUpdatePayload) =>
  httpClient.put<void>(`/api/admins/${id}`, payload);
