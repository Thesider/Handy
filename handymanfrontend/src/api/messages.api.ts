import { httpClient } from "./httpClient";

export type BookingMessage = {
  bookingMessageId: number;
  bookingId: number;
  senderRole: "Customer" | "Worker";
  senderId: number;
  text: string;
  sentAt: string;
};

export type SendBookingMessagePayload = {
  bookingId: number;
  senderRole: "Customer" | "Worker";
  senderId: number;
  text: string;
};

export const getMessagesByBooking = (bookingId: number) =>
  httpClient.get<BookingMessage[]>(`/api/messages/booking/${bookingId}`);

export const sendBookingMessage = (payload: SendBookingMessagePayload) =>
  httpClient.post<BookingMessage>("/api/messages", payload);
