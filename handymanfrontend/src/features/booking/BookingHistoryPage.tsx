import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getBookings, getBookingsByCustomer, getBookingsByWorker, updateBookingStatus } from "../../api/booking.api";
import { Button } from "../../components/common/Button";
import { formatDateTime } from "../../utils/validators";
import { useAuth } from "../../hooks/useAuth";
import type { Booking, BookingStatus } from "./booking.types";
import styles from "./BookingHistoryPage.module.css";
import { useToast } from "../../context/ToastContext";

export const BookingHistoryPage = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<number | null>(null);
    const { user } = useAuth();
    const { showToast } = useToast();
    const role = user?.role ?? "Customer";

    const formatVnd = (value: number) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(value);

    const loadBookings = async () => {
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

    useEffect(() => {
        loadBookings();
    }, [role, user?.id]);

    const handleCancel = async (bookingId: number) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        try {
            setCancellingId(bookingId);
            await updateBookingStatus(bookingId, "Cancelled");
            setBookings(prev => prev.map(b =>
                b.bookingId === bookingId ? { ...b, status: "Cancelled" as BookingStatus } : b
            ));
            showToast("Booking cancelled successfully!");
        } catch {
            showToast("Failed to cancel booking. Please try again.", "error");
        } finally {
            setCancellingId(null);
        }
    };

    const sorted = useMemo(() => {
        return [...bookings].sort(
            (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
        );
    }, [bookings]);

    const getStatusClass = (status: BookingStatus) => {
        switch (status) {
            case "Pending": return styles.statusPending;
            case "Confirmed": return styles.statusConfirmed;
            case "InProgress": return styles.statusInProgress;
            case "Completed": return styles.statusCompleted;
            case "Cancelled": return styles.statusCancelled;
            case "Declined": return styles.statusDeclined;
            default: return "";
        }
    };

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
        return (
            <div className={styles.container}>
                <div className={styles.error}>{error}</div>
            </div>
        );
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
                        const canCancel = (booking.status === "Pending" || booking.status === "Confirmed") && role === "Customer";

                        return (
                            <article key={booking.bookingId} className={styles.card}>
                                <div className={styles.cardLeft}>
                                    <div className={styles.statusWrapper}>
                                        <h3>Booking #{booking.bookingId}</h3>
                                        <span className={`${styles.badge} ${getStatusClass(booking.status)}`}>
                                            {booking.status}
                                        </span>
                                        {isUpcoming && booking.status !== "Cancelled" && booking.status !== "Declined" && (
                                            <span className={styles.upcomingBadge}>Upcoming</span>
                                        )}
                                    </div>
                                    <div className={styles.cardInfo}>
                                        <div className={styles.infoItem}>
                                            <span>📅</span>
                                            {formatDateTime(booking.startAt)}
                                        </div>
                                        <div className={styles.infoItem}>
                                            <span>👤</span>
                                            ID: {role === "Worker" ? `Cust ${booking.customerId}` : `Worker ${booking.workerId}`}
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.cardRight}>
                                    <div className={styles.price}>
                                        {booking.amount > 0
                                            ? formatVnd(booking.amount)
                                            : booking.maxPrice > 0
                                                ? `Offer: ${formatVnd(booking.maxPrice)}`
                                                : "TBD"}
                                    </div>
                                    <div className={styles.actions}>
                                        {canCancel && (
                                            <button
                                                className={styles.cancelBtn}
                                                onClick={() => handleCancel(booking.bookingId)}
                                                disabled={cancellingId === booking.bookingId}
                                            >
                                                {cancellingId === booking.bookingId ? "Cancelling..." : "Cancel Booking"}
                                            </button>
                                        )}
                                        <button className={styles.detailBtn}>View Details</button>
                                    </div>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
