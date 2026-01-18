import { httpClient } from "./httpClient";
import type { Service, Worker } from "../features/handyman/handyman.types.ts";

export const getWorkers = () => httpClient.get<Worker[]>("/api/workers");

export const getWorkerById = (id: number) =>
  httpClient.get<Worker>(`/api/workers/${id}`);

export const updateWorker = (id: number, payload: Worker) =>
  httpClient.put<void>(`/api/workers/${id}`, payload);

export const getServices = () => httpClient.get<Service[]>("/api/services");
