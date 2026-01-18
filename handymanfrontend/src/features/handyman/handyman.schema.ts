import { z } from "zod";

export const filterSchema = z.object({
  serviceId: z.number().optional(),
  minRating: z.number().min(0).max(5).optional(),
  availability: z.boolean().optional(),
});
