import { httpClient } from "./httpClient";
import type { Customer } from "../features/admin/admin.types";
import type { Service, Worker } from "../features/handyman/handyman.types";

export const getAdminWorkers = () => httpClient.get<Worker[]>("/api/workers");

export const getAdminWorkerById = (id: number) =>
  httpClient.get<Worker>(`/api/workers/${id}`);

export const createAdminWorker = (payload: Omit<Worker, "workerId">) =>
  httpClient.post<Worker>("/api/workers", payload);

export const updateAdminWorker = (id: number, payload: Omit<Worker, "workerId">) =>
  httpClient.put<void>(`/api/workers/${id}`, payload);

export const deleteAdminWorker = (id: number) =>
  httpClient.delete<void>(`/api/workers/${id}`);

export const getAdminServices = () => httpClient.get<Service[]>("/api/services");

export const getAdminServiceById = (id: number) =>
  httpClient.get<Service>(`/api/services/${id}`);

export const createAdminService = (payload: Omit<Service, "serviceId">) =>
  httpClient.post<Service>("/api/services", payload);

export const updateAdminService = (
  id: number,
  payload: Omit<Service, "serviceId">
) => httpClient.put<void>(`/api/services/${id}`, payload);

export const deleteAdminService = (id: number) =>
  httpClient.delete<void>(`/api/services/${id}`);

export const getAdminCustomers = () =>
  httpClient.get<Customer[]>("/api/customers");

export const getAdminCustomerById = (id: number) =>
  httpClient.get<Customer>(`/api/customers/${id}`);

export const createAdminCustomer = (payload: Omit<Customer, "customerId">) =>
  httpClient.post<Customer>("/api/customers", payload);

export const updateAdminCustomer = (
  id: number,
  payload: Omit<Customer, "customerId">
) => httpClient.put<void>(`/api/customers/${id}`, payload);

export const deleteAdminCustomer = (id: number) =>
  httpClient.delete<void>(`/api/customers/${id}`);
