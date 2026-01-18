import { httpClient } from "./httpClient";
import type {
  Booking,
  BookingCreatePayload,
  BookingStatus,
} from "../features/booking/booking.types.ts";

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
