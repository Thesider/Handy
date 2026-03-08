import { httpClient } from "./httpClient";
import type { Worker, WorkerAcceptanceMetrics } from "../features/handyman/handyman.types";

export type WorkerSearchQuery = {
  latitude?: number;
  longitude?: number;
  maxDistanceKm?: number;
  minRating?: number;
  minPrice?: number;
  maxPrice?: number;
};

const toQueryString = (query: WorkerSearchQuery) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  const suffix = params.toString();
  return suffix ? `?${suffix}` : "";
};

export const searchWorkers = (query: WorkerSearchQuery = {}) =>
  httpClient.get<Worker[]>(`/api/workers/search${toQueryString(query)}`);

export const getWorkerMetrics = (workerId: number) =>
  httpClient.get<WorkerAcceptanceMetrics>(`/api/workers/${workerId}/metrics`);
