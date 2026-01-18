import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBookings, getBookingsByCustomer, getBookingsByWorker } from "../../api/booking.api";
import { Button } from "../../components/common/Button";
import { formatDateTime } from "../../utils/validators";
import { useAuth } from "../../hooks/useAuth";
import type { Booking } from "./booking.types";
import styles from "./BookingHistoryPage.module.css";

export const BookingHistoryPage = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const role = user?.role ?? "Customer";

    const formatVnd = (value: number) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(value);

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                if (!user?.id) {
                    setBookings([]);
                    setError(null);
                    return;
                }

                const data = role === "Worker"
                    ? await getBookingsByWorker(user.id)
                    : role === "Admin"
                        ? await getBookings()
                        : await getBookingsByCustomer(user.id);
                setBookings(data ?? []);
                setError(null);
            } catch {
                setError("Unable to load bookings.");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [role, user?.id]);

    const sorted = useMemo(() => {
        return [...bookings].sort(
            (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
        );
    }, [bookings]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.header}>
                    <h1>Booking history</h1>
                    <p>Track upcoming and past bookings.</p>
                </div>
                <div className={styles.list}>
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className={`${styles.card} ${styles.skeleton}`} />
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>Booking history</h1>
                <p>Track your previous and upcoming bookings.</p>
            </div>

            {!user?.id ? (
                <div className={styles.notice}>
                    <p>Please sign in to view your bookings.</p>
                    <Link to="/login">
                        <Button variant="secondary">Go to login</Button>
                    </Link>
                </div>
            ) : sorted.length === 0 ? (
                <div className={styles.notice}>
                    <p>No bookings yet. Browse pros to get started.</p>
                    <Link to="/handymen">
                        <Button variant="secondary">Browse handymen</Button>
                    </Link>
                </div>
            ) : (
                <div className={styles.list}>
                    {sorted.map((booking) => {
                        const isUpcoming = new Date(booking.startAt) > new Date();
                        return (
                            <article key={booking.bookingId} className={styles.card}>
                                <div>
                                    <h3>Booking #{booking.bookingId}</h3>
                                    <p>{formatDateTime(booking.startAt)}</p>
                                    <span
                                        className={
                                            isUpcoming ? styles.upcoming : styles.past
                                        }
                                    >
                                        {isUpcoming ? "Upcoming" : "Past"}
                                    </span>
                                </div>
                                <div>
                                    <p>Status: {booking.status}</p>
                                    <p>Worker ID: {booking.workerId}</p>
                                    {booking.minPrice || booking.maxPrice ? (
                                        <p>
                                            Price range: {formatVnd(booking.minPrice)} - {formatVnd(booking.maxPrice)}
                                        </p>
                                    ) : (
                                        <p>Price range: TBD</p>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
