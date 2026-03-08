import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const passwordConfirmSchema = loginSchema
  .extend({
    confirmPassword: z.string().min(6, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export const registerCustomerSchema = passwordConfirmSchema.extend({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  phoneNumber: z.string().min(6, "Phone number is required"),
});

export const registerWorkerSchema = registerCustomerSchema.extend({
  hourlyRate: z.number().min(0, "Hourly rate must be 0 or more"),
  address: z.object({
    street: z.string().min(2, "Street is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().optional(),
    postalCode: z.string().min(2, "Postal code is required"),
    country: z.string().optional(),
  }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterCustomerFormValues = z.infer<typeof registerCustomerSchema>;
export type RegisterWorkerFormValues = z.infer<typeof registerWorkerSchema>;
