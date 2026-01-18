import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createBooking } from "../../api/booking.api";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { BOOKING_STATUSES } from "../../utils/constants";
import { useAuth } from "../../hooks/useAuth";
import type { BookingCreatePayload } from "./booking.types";
import type { Service } from "../handyman/handyman.types";
import styles from "./BookingForm.module.css";

const bookingSchema = z.object({
    serviceId: z.number().min(1, "Select a service"),
    minPrice: z.number().min(0, "Minimum price must be >= 0"),
    maxPrice: z.number().min(0, "Maximum price must be >= 0"),
    startAt: z.string().min(1, "Select a date and time"),
    notes: z.string().max(2000).optional(),
}).refine((values) => values.maxPrice >= values.minPrice, {
    message: "Maximum price must be greater than or equal to minimum price",
    path: ["maxPrice"],
});

type BookingFormValues = z.infer<typeof bookingSchema>;

type BookingFormProps = {
    workerId: number;
    services: Service[];
};

export const BookingForm = ({ workerId, services }: BookingFormProps) => {
    const [status, setStatus] = useState<"success" | "error" | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const { user } = useAuth();
    const isCustomer = user?.role === "Customer";
    const customerId = user?.id;

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<BookingFormValues>({
        resolver: zodResolver(bookingSchema),
        defaultValues: {
            minPrice: 0,
            maxPrice: 0,
        },
    });

    const onSubmit = async (values: BookingFormValues) => {
        try {
            setStatus(null);
            if (!isCustomer || !customerId) {
                setStatus("error");
                setMessage("Please sign in as a customer to book a service.");
                return;
            }
            const payload: BookingCreatePayload = {
                customerId,
                workerId,
                serviceId: values.serviceId,
                minPrice: values.minPrice,
                maxPrice: values.maxPrice,
                startAt: new Date(values.startAt).toISOString(),
                status: "Pending",
                amount: 0,
                notes: values.notes,
            };
            await createBooking(payload);
            setStatus("success");
            setMessage("Booking request sent.");
            reset();
        } catch (err) {
            setStatus("error");
            setMessage("Unable to create booking.");
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
            {!isCustomer ? (
                <div className={styles.error}>
                    Please sign in as a customer to request a booking.
                </div>
            ) : null}
            <div className={styles.field}>
                <label htmlFor="service" className={styles.label}>
                    Service
                </label>
                <select
                    id="service"
                    {...register("serviceId", { valueAsNumber: true })}
                    disabled={!isCustomer || isSubmitting}
                >
                    <option value="">Select service</option>
                    {services.map((service) => (
                        <option key={service.serviceId} value={service.serviceId}>
                            {service.serviceName}
                        </option>
                    ))}
                </select>
                {errors.serviceId ? (
                    <span className={styles.helper}>{errors.serviceId.message}</span>
                ) : null}
            </div>
            <Input
                label="Minimum price (VND)"
                id="minPrice"
                type="number"
                error={errors.minPrice?.message}
                {...register("minPrice", { valueAsNumber: true })}
                disabled={!isCustomer || isSubmitting}
            />
            <Input
                label="Maximum price (VND)"
                id="maxPrice"
                type="number"
                error={errors.maxPrice?.message}
                {...register("maxPrice", { valueAsNumber: true })}
                disabled={!isCustomer || isSubmitting}
            />
            <Input
                label="Start time"
                type="datetime-local"
                error={errors.startAt?.message}
                {...register("startAt")}
                disabled={!isCustomer || isSubmitting}
            />
            <div className={styles.field}>
                <label htmlFor="notes" className={styles.label}>
                    Notes (optional)
                </label>
                <textarea id="notes" rows={3} {...register("notes")} disabled={!isCustomer || isSubmitting} />
            </div>
            <div className={styles.statusRow}>
                <span>Default status:</span>
                <strong>{BOOKING_STATUSES[0]}</strong>
            </div>
            {message ? (
                <div
                    className={status === "success" ? styles.success : styles.error}
                >
                    {message}
                </div>
            ) : null}
            <Button type="submit" fullWidth disabled={isSubmitting || !isCustomer}>
                {isSubmitting ? "Sending..." : "Request booking"}
            </Button>
        </form>
    );
};
