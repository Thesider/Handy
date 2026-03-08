export type BookingStatus =
  | "Pending"
  | "WorkerAccepted"
  | "CustomerConfirmed"
  | "InProgress"
  | "Completed"
  | "Cancelled"
  | "Declined";

export type Booking = {
  bookingId: number;
  customerId: number;
  workerId: number;
  serviceId: number;
  price: number;
  startAt: string;
  endAt?: string | null;
  status: BookingStatus;
  amount: number;
  notes?: string | null;
  paymentStatus?: "NotCaptured" | "Captured" | "Refunded";
  paymentCapturedAt?: string | null;
  paymentReference?: string | null;
};

export type BookingCreatePayload = {
  customerId: number;
  workerId: number;
  serviceId: number;
  price: number;
  startAt: string;
  endAt?: string | null;
  status: BookingStatus;
  amount: number;
  notes?: string | null;
};
