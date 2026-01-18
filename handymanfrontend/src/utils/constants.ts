export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5164";

export const BOOKING_STATUSES = [
  "Pending",
  "Confirmed",
  "InProgress",
  "Completed",
  "Cancelled",
  "Declined",
] as const;

export const STORAGE_KEYS = {
  token: "handyman_token",
  user: "handyman_user",
  customerId: "handyman_customer_id",
} as const;
