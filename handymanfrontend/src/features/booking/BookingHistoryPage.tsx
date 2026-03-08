import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
    captureBookingPayment,
    completeBooking,
    customerConfirmBooking,
    getBookings,
    getBookingsByCustomer,
    getBookingsByWorker,
    startBooking,
    updateBookingStatus,
    workerAcceptBooking,
} from "../../api/booking.api";
import { getMessagesByBooking, sendBookingMessage, type BookingMessage } from "../../api/messages.api";
import { Button } from "../../components/common/Button";
import { formatDateTime } from "../../utils/validators";
import { useAuth } from "../../hooks/useAuth";
import type { Booking, BookingStatus } from "./booking.types";
import styles from "./BookingHistoryPage.module.css";
import { useToast } from "../../context/ToastContext";
import { BOOKING_STATUS_LABELS } from "../../utils/constants";
import { useRealtime } from "../../context/RealtimeContext";
import { signalRService } from "../../services/signalRService";

export const BookingHistoryPage = () => {
    const [searchParams] = useSearchParams();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<number | null>(null);
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
    const [messages, setMessages] = useState<Record<number, BookingMessage[]>>({});
    const [chatDraft, setChatDraft] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);
    const { user } = useAuth();
    const { showToast } = useToast();
    const { joinBooking, leaveBooking } = useRealtime();
    const role = user?.role ?? "Customer";

    const formatVnd = (value: number) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(value);

    const loadBookings = useCallback(async () => {
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
    }, [role, user?.id]);

    useEffect(() => {
        void loadBookings();
    }, [loadBookings]);

    useEffect(() => {
        const bookingIdFromUrl = Number(searchParams.get("bookingId"));
        if (!Number.isNaN(bookingIdFromUrl) && bookingIdFromUrl > 0) {
            setSelectedBookingId(bookingIdFromUrl);
        }
    }, [searchParams]);

    const loadBookingMessages = useCallback(async (bookingId: number) => {
        try {
            const history = await getMessagesByBooking(bookingId);
            setMessages((prev) => ({ ...prev, [bookingId]: history }));
        } catch {
            showToast("Unable to load chat history.", "error");
        }
    }, [showToast]);

    useEffect(() => {
        if (!selectedBookingId) return;
        void joinBooking(selectedBookingId);
        void loadBookingMessages(selectedBookingId);

        return () => {
            void leaveBooking(selectedBookingId);
        };
    }, [selectedBookingId, joinBooking, leaveBooking, loadBookingMessages]);

    useEffect(() => {
        const offChat = signalRService.on("ChatMessage", (payload) => {
            setMessages((prev) => {
                const existing = prev[payload.bookingId] ?? [];
                if (existing.some((m) => m.bookingMessageId === payload.message.bookingMessageId)) {
                    return prev;
                }
                return { ...prev, [payload.bookingId]: [...existing, payload.message] };
            });
        });

        const offBooking = signalRService.on("BookingEvent", (payload) => {
            setBookings((prev) => prev.map((booking) => {
                if (booking.bookingId !== payload.bookingId) return booking;
                return {
                    ...booking,
                    status: (payload.status as BookingStatus | undefined) ?? booking.status,
                    amount: payload.amount ?? booking.amount,
                    price: payload.price ?? booking.price,
                    paymentStatus: (payload.paymentStatus as Booking["paymentStatus"]) ?? booking.paymentStatus,
                };
            }));
            if (selectedBookingId === payload.bookingId) {
                void loadBookings();
            }
        });

        return () => {
            offChat();
            offBooking();
        };
    }, [loadBookings, selectedBookingId]);

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
            case "WorkerAccepted": return styles.statusConfirmed;
            case "CustomerConfirmed": return styles.statusCustomerConfirmed;
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
                        const canCancel = (booking.status === "Pending" || booking.status === "WorkerAccepted") && role === "Customer";
                        const isSelected = selectedBookingId === booking.bookingId;

                        return (
                            <div key={booking.bookingId}>
                                <article className={styles.card}>
                                    <div className={styles.cardLeft}>
                                        <div className={styles.statusWrapper}>
                                            <h3>Booking #{booking.bookingId}</h3>
                                            <span className={`${styles.badge} ${getStatusClass(booking.status)}`}>
                                                {BOOKING_STATUS_LABELS[booking.status]}
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
                                                : booking.price > 0
                                                    ? `Offer: ${formatVnd(booking.price)}`
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
                                            <button className={styles.detailBtn} onClick={() => setSelectedBookingId(booking.bookingId)}>View Details</button>
                                        </div>
                                    </div>
                                </article>
                                {isSelected ? (
                                    <section className={styles.detailPanel}>
                                        <div className={styles.detailHeader}>
                                            <h4>Booking Actions</h4>
                                            <button className={styles.detailBtn} onClick={() => setSelectedBookingId(null)}>Close</button>
                                        </div>

                                        <div className={styles.actions}>
                                            {role === "Worker" && booking.status === "Pending" ? (
                                                <button
                                                    className={styles.detailBtn}
                                                    onClick={async () => {
                                                        const previous = booking.status;
                                                        setBookings((prev) => prev.map((b) => b.bookingId === booking.bookingId ? { ...b, status: "WorkerAccepted" } : b));
                                                        try {
                                                            await workerAcceptBooking(booking.bookingId);
                                                            showToast("Booking accepted.", "success");
                                                        } catch {
                                                            setBookings((prev) => prev.map((b) => b.bookingId === booking.bookingId ? { ...b, status: previous } : b));
                                                            showToast("Failed to accept booking.", "error");
                                                        }
                                                    }}
                                                >
                                                    Accept (Worker)
                                                </button>
                                            ) : null}

                                            {role === "Customer" && booking.status === "WorkerAccepted" ? (
                                                <button
                                                    className={styles.detailBtn}
                                                    onClick={async () => {
                                                        const previous = booking.status;
                                                        setBookings((prev) => prev.map((b) => b.bookingId === booking.bookingId ? { ...b, status: "CustomerConfirmed" } : b));
                                                        try {
                                                            await customerConfirmBooking(booking.bookingId);
                                                            showToast("Booking confirmed.", "success");
                                                        } catch {
                                                            setBookings((prev) => prev.map((b) => b.bookingId === booking.bookingId ? { ...b, status: previous } : b));
                                                            showToast("Failed to confirm booking.", "error");
                                                        }
                                                    }}
                                                >
                                                    Confirm (Customer)
                                                </button>
                                            ) : null}

                                            {role === "Worker" && booking.status === "CustomerConfirmed" ? (
                                                <button
                                                    className={styles.detailBtn}
                                                    onClick={async () => {
                                                        const previous = booking.status;
                                                        setBookings((prev) => prev.map((b) => b.bookingId === booking.bookingId ? { ...b, status: "InProgress" } : b));
                                                        try {
                                                            await startBooking(booking.bookingId);
                                                            showToast("Work started.", "success");
                                                        } catch {
                                                            setBookings((prev) => prev.map((b) => b.bookingId === booking.bookingId ? { ...b, status: previous } : b));
                                                            showToast("Failed to start work.", "error");
                                                        }
                                                    }}
                                                >
                                                    Start Work
                                                </button>
                                            ) : null}

                                            {role === "Worker" && booking.status === "InProgress" ? (
                                                <button
                                                    className={styles.detailBtn}
                                                    onClick={async () => {
                                                        const previous = booking.status;
                                                        setBookings((prev) => prev.map((b) => b.bookingId === booking.bookingId ? { ...b, status: "Completed" } : b));
                                                        try {
                                                            await completeBooking(booking.bookingId);
                                                            showToast("Booking marked completed.", "success");
                                                        } catch {
                                                            setBookings((prev) => prev.map((b) => b.bookingId === booking.bookingId ? { ...b, status: previous } : b));
                                                            showToast("Failed to complete booking.", "error");
                                                        }
                                                    }}
                                                >
                                                    Complete
                                                </button>
                                            ) : null}

                                            {role === "Customer" && booking.status === "Completed" && booking.paymentStatus !== "Captured" ? (
                                                <button
                                                    className={styles.detailBtn}
                                                    onClick={async () => {
                                                        const paymentReference = window.prompt("Payment reference", `BOOK-${booking.bookingId}`);
                                                        if (!paymentReference) return;
                                                        const amount = Number(window.prompt("Final amount", String(booking.amount || booking.price || 0)));
                                                        if (Number.isNaN(amount) || amount <= 0) {
                                                            showToast("Invalid amount.", "error");
                                                            return;
                                                        }
                                                        try {
                                                            await captureBookingPayment(booking.bookingId, { paymentReference, finalAmount: amount });
                                                            showToast("Payment captured.", "success");
                                                            void loadBookings();
                                                        } catch {
                                                            showToast("Failed to capture payment.", "error");
                                                        }
                                                    }}
                                                >
                                                    Capture Payment
                                                </button>
                                            ) : null}
                                        </div>

                                        <div className={styles.chatPanel}>
                                            <h4>Chat</h4>
                                            <div className={styles.chatList}>
                                                {(messages[booking.bookingId] ?? []).map((message) => (
                                                    <div key={message.bookingMessageId} className={styles.chatMessage}>
                                                        <strong>{message.senderRole}</strong>: {message.text}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className={styles.chatComposer}>
                                                <input
                                                    value={chatDraft}
                                                    onChange={(event) => setChatDraft(event.target.value)}
                                                    placeholder="Write a message..."
                                                />
                                                <button
                                                    className={styles.detailBtn}
                                                    disabled={sendingMessage || !chatDraft.trim() || !user?.id}
                                                    onClick={async () => {
                                                        if (!user?.id || !chatDraft.trim() || role === "Admin") return;
                                                        try {
                                                            setSendingMessage(true);
                                                            await sendBookingMessage({
                                                                bookingId: booking.bookingId,
                                                                senderId: user.id,
                                                                senderRole: role as "Customer" | "Worker",
                                                                text: chatDraft.trim(),
                                                            });
                                                            setChatDraft("");
                                                        } catch {
                                                            showToast("Failed to send message.", "error");
                                                        } finally {
                                                            setSendingMessage(false);
                                                        }
                                                    }}
                                                >
                                                    Send
                                                </button>
                                            </div>
                                        </div>
                                    </section>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
