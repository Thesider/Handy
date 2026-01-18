import { useEffect, useMemo, useState } from "react";
import { WorkerDashboardShell } from "../components/layout/WorkerDashboardShell";
import { useAuth } from "../hooks/useAuth";
import { getBookingsByWorker } from "../api/booking.api";
import type { Booking } from "../features/booking/booking.types";

export const WorkerEarningsPage = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const workerId = user?.id;
        if (!workerId || user?.role !== "Worker") {
            setBookings([]);
            setError("Không tìm thấy mã thợ cho tài khoản này.");
            return;
        }

        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                const bookingData = await getBookingsByWorker(workerId);
                if (!isMounted) return;
                setBookings(bookingData);
            } catch {
                if (!isMounted) return;
                setError("Không thể tải thu nhập.");
            } finally {
                if (!isMounted) return;
                setLoading(false);
            }
        };

        loadData();
        return () => {
            isMounted = false;
        };
    }, [user?.id, user?.role]);

    const completedBookings = useMemo(
        () => bookings.filter((booking) => booking.status === "Completed"),
        [bookings]
    );

    const totalEarnings = useMemo(
        () => completedBookings.reduce((sum, booking) => sum + booking.amount, 0),
        [completedBookings]
    );

    const monthlyEarnings = useMemo(() => {
        const now = new Date();
        return completedBookings
            .filter((booking) => {
                const date = new Date(booking.endAt ?? booking.startAt);
                return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
            })
            .reduce((sum, booking) => sum + booking.amount, 0);
    }, [completedBookings]);

    const formatVnd = (value: number) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(value);

    const formatDate = (value: string) =>
        new Date(value).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
        });

    return (
        <WorkerDashboardShell>
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Earnings</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Review your completed jobs and payouts.
                    </p>
                </div>
            </header>

            {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    {error}
                </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-sm text-slate-500 dark:text-slate-400">This month</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                        {formatVnd(monthlyEarnings)}
                    </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Total earned</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
                        {formatVnd(totalEarnings)}
                    </p>
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Completed jobs</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Earnings are based on completed bookings.
                </p>
                {loading ? (
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Loading earnings...</p>
                ) : completedBookings.length ? (
                    <div className="mt-4 space-y-3">
                        {completedBookings.map((booking) => (
                            <div
                                key={booking.bookingId}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
                            >
                                <div>
                                    <p className="font-semibold text-slate-900 dark:text-white">
                                        Booking #{booking.bookingId}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        {formatDate(booking.endAt ?? booking.startAt)}
                                    </p>
                                </div>
                                <span className="font-semibold text-slate-900 dark:text-white">
                                    {formatVnd(booking.amount)}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                        No completed jobs yet.
                    </p>
                )}
            </div>
        </WorkerDashboardShell>
    );
};
