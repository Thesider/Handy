import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createBooking } from "../../api/booking.api";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { BOOKING_STATUSES } from "../../utils/constants";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import type { BookingCreatePayload } from "./booking.types";
import type { Service } from "../handyman/handyman.types";
import styles from "./BookingForm.module.css";

const bookingSchema = z.object({
    serviceId: z.number().min(1, "Select a service"),
    price: z.number().min(1000, "Price must be at least 1,000 VND"),
    startAt: z.string().min(1, "Select a start date and time"),
    endAt: z.string().min(1, "Select an end date and time"),
    notes: z.string().max(2000).optional(),
}).refine((values) => new Date(values.endAt) > new Date(values.startAt), {
    message: "End time must be after start time",
    path: ["endAt"],
});

type BookingFormValues = z.infer<typeof bookingSchema>;

type BookingFormProps = {
    workerId: number;
    services: Service[];
};

export const BookingForm = ({ workerId, services }: BookingFormProps) => {
    const { user } = useAuth();
    const { showToast } = useToast();
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
            price: 0,
        },
    });

    const onSubmit = async (values: BookingFormValues) => {
        try {
            if (!isCustomer || !customerId) {
                showToast("Please sign in as a customer to book.", "error");
                return;
            }
            const payload: BookingCreatePayload = {
                customerId,
                workerId,
                serviceId: values.serviceId,
                minPrice: values.price, // Same as maxPrice for backend compatibility
                maxPrice: values.price,
                startAt: new Date(values.startAt).toISOString(),
                endAt: new Date(values.endAt).toISOString(),
                status: "Pending",
                amount: 0,
                notes: values.notes,
            };
            await createBooking(payload);
            showToast("Booking request sent successfully!");
            reset();
        } catch (err) {
            showToast("Unable to create booking. Please try again.", "error");
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
                    className="w-full h-11 rounded-lg border border-slate-200 px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
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

            <div className={styles.field}>
                <Input
                    label="Price Offer (VND)"
                    id="price"
                    type="number"
                    placeholder="Enter your budget..."
                    error={errors.price?.message}
                    {...register("price", { valueAsNumber: true })}
                    disabled={!isCustomer || isSubmitting}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                    label="Start time"
                    type="datetime-local"
                    error={errors.startAt?.message}
                    {...register("startAt")}
                    disabled={!isCustomer || isSubmitting}
                />
                <Input
                    label="End time"
                    type="datetime-local"
                    error={errors.endAt?.message}
                    {...register("endAt")}
                    disabled={!isCustomer || isSubmitting}
                />
            </div>

            <div className={styles.field}>
                <label htmlFor="notes" className={styles.label}>
                    Notes (optional)
                </label>
                <textarea
                    id="notes"
                    rows={3}
                    className="w-full rounded-lg border border-slate-200 p-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    {...register("notes")}
                    disabled={!isCustomer || isSubmitting}
                />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl mb-4 border border-slate-100">
                <span className="text-sm font-medium text-slate-500">Initial Status:</span>
                <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                    {BOOKING_STATUSES[0]}
                </span>
            </div>

            <Button type="submit" fullWidth disabled={isSubmitting || !isCustomer}>
                {isSubmitting ? "Sending..." : "Request booking"}
            </Button>
        </form>
    );
};
