export type BookingStatus =
  | "Pending"
  | "Confirmed"
  | "InProgress"
  | "Completed"
  | "Cancelled"
  | "Declined";

export type Booking = {
  bookingId: number;
  customerId: number;
  workerId: number;
  serviceId: number;
  minPrice: number;
  maxPrice: number;
  startAt: string;
  endAt?: string | null;
  status: BookingStatus;
  amount: number;
  notes?: string | null;
};

export type BookingCreatePayload = {
  customerId: number;
  workerId: number;
  serviceId: number;
  minPrice: number;
  maxPrice: number;
  startAt: string;
  endAt?: string | null;
  status: BookingStatus;
  amount: number;
  notes?: string | null;
};
