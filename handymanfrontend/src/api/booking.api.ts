import { httpClient } from "./httpClient";
import type {
  Booking,
  BookingCreatePayload,
  BookingStatus,
} from "../features/booking/booking.types.ts";

export type CapturePaymentPayload = {
  paymentReference: string;
  finalAmount: number;
};

export const getBookings = () => httpClient.get<Booking[]>("/api/bookings");

export const getBookingsByCustomer = (customerId: number) =>
  httpClient.get<Booking[]>(`/api/bookings/by-customer/${customerId}`);

export const getBookingsByWorker = (workerId: number) =>
  httpClient.get<Booking[]>(`/api/bookings/by-worker/${workerId}`);

export const getBookingsByService = (serviceId: number) =>
  httpClient.get<Booking[]>(`/api/bookings/by-service/${serviceId}`);

export const createBooking = (payload: BookingCreatePayload) =>
  httpClient.post<Booking>("/api/bookings", payload);

export const updateBookingStatus = (id: number, status: BookingStatus) =>
  httpClient.put<void>(`/api/bookings/${id}/status`, status);

export const workerAcceptBooking = (id: number) =>
  httpClient.put<void>(`/api/bookings/${id}/worker-accept`, {});

export const customerConfirmBooking = (id: number) =>
  httpClient.put<void>(`/api/bookings/${id}/customer-confirm`, {});

export const startBooking = (id: number) =>
  httpClient.put<void>(`/api/bookings/${id}/start`, {});

export const completeBooking = (id: number) =>
  httpClient.put<void>(`/api/bookings/${id}/complete`, {});

export const captureBookingPayment = (id: number, payload: CapturePaymentPayload) =>
  httpClient.put<void>(`/api/bookings/${id}/capture-payment`, payload);
