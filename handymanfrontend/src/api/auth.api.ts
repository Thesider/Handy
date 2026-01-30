import { httpClient } from "./httpClient";
import type {
  AuthResponse,
  LoginPayload,
  RegisterCustomerPayload,
  RegisterWorkerPayload,
} from "../features/auth/auth.types.ts";

export const login = (payload: LoginPayload) =>
  httpClient.post<AuthResponse>("/auth/login", payload);

export const registerCustomer = (payload: RegisterCustomerPayload) =>
  httpClient.post<AuthResponse>("/auth/register/customer", {
    email: payload.email,
    password: payload.password,
    firstName: payload.firstName,
    lastName: payload.lastName,
    phoneNumber: payload.phoneNumber,
  });

export const registerWorker = (payload: RegisterWorkerPayload) =>
  httpClient.post<AuthResponse>("/auth/register/worker", {
    email: payload.email,
    password: payload.password,
    firstName: payload.firstName,
    lastName: payload.lastName,
    phoneNumber: payload.phoneNumber,
    yearsOfExperience: payload.yearsOfExperience,
    hourlyRate: payload.hourlyRate,
    address: payload.address,
  });
