export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5164";

export const BOOKING_STATUSES = [
  "Pending",
  "WorkerAccepted",
  "CustomerConfirmed",
  "InProgress",
  "Completed",
  "Cancelled",
  "Declined",
] as const;

export const BOOKING_STATUS_LABELS: Record<(typeof BOOKING_STATUSES)[number], string> = {
  Pending: "Pending",
  WorkerAccepted: "Accepted by Worker",
  CustomerConfirmed: "Confirmed by Customer",
  InProgress: "In Progress",
  Completed: "Completed",
  Cancelled: "Cancelled",
  Declined: "Declined",
};

export const METRICS_THRESHOLDS = {
  responseAcceptanceRateGood: 60,
  bookingAcceptanceRateGood: 70,
  avgResponseMinutesGood: 60,
};

export const STORAGE_KEYS = {
  token: "handyman_token",
  user: "handyman_user",
  customerId: "handyman_customer_id",
} as const;
