import { httpClient } from "./httpClient";
import type { Review } from "../features/review/review.types";

export const getReviewsByWorker = (workerId: number) =>
  httpClient.get<Review[]>(`/api/reviews/by-worker/${workerId}`);
