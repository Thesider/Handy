import { useEffect, useMemo, useState } from "react";
import { WorkerDashboardShell } from "../components/layout/WorkerDashboardShell";
import { useAuth } from "../hooks/useAuth";
import { getBookingsByWorker, updateBookingStatus } from "../api/booking.api";
import { getServices } from "../api/handyman.api";
import type { Booking } from "../features/booking/booking.types";
import type { Service } from "../features/handyman/handyman.types";

export const WorkerJobsPage = () => {
    const { user } = useAuth();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    useEffect(() => {
        const workerId = user?.id;
        if (!workerId || user?.role !== "Worker") {
            setBookings([]);
            setServices([]);
            setError("Không tìm thấy mã thợ cho tài khoản này.");
            return;
        }

        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [bookingData, serviceData] = await Promise.all([
                    getBookingsByWorker(workerId),
                    getServices(),
                ]);
                if (!isMounted) return;
                setBookings(bookingData);
                setServices(serviceData);
            } catch {
                if (!isMounted) return;
                setError("Không thể tải danh sách công việc.");
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

    const serviceLookup = useMemo(() => {
        const map = new Map<number, Service>();
        services.forEach((service) => map.set(service.serviceId, service));
        return map;
    }, [services]);

    const sortedBookings = useMemo(
        () =>
            [...bookings].sort(
                (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
            ),
        [bookings]
    );

    const formatDate = (value: string) =>
        new Date(value).toLocaleString("en-US", {
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });

    const formatVnd = (value: number) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(value);

    const formatRange = (minPrice: number, maxPrice: number) => {
        if (minPrice <= 0 && maxPrice <= 0) return "TBD";
        return `${formatVnd(minPrice)} - ${formatVnd(maxPrice)}`;
    };

    const handleStatusChange = async (bookingId: number, status: "Confirmed" | "Declined") => {
        try {
            setUpdatingId(bookingId);
            await updateBookingStatus(bookingId, status);
            setBookings((previous) =>
                previous.map((booking) =>
                    booking.bookingId === bookingId ? { ...booking, status } : booking
                )
            );
        } catch {
            setError("Không thể cập nhật trạng thái công việc.");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <WorkerDashboardShell>
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Jobs</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Track upcoming and completed jobs.
                    </p>
                </div>
            </header>

            {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    {error}
                </div>
            ) : null}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {loading ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Loading jobs...</p>
                ) : sortedBookings.length ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="text-xs uppercase text-slate-400">
                                    <th className="pb-3">Service</th>
                                    <th className="pb-3">Customer</th>
                                    <th className="pb-3">Start</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Price range</th>
                                    <th className="pb-3 text-right">Amount</th>
                                    <th className="pb-3 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {sortedBookings.map((booking) => (
                                    <tr key={booking.bookingId} className="text-slate-700 dark:text-slate-200">
                                        <td className="py-3 font-medium text-slate-900 dark:text-white">
                                            {serviceLookup.get(booking.serviceId)?.serviceName ?? "Service"}
                                        </td>
                                        <td className="py-3">Customer #{booking.customerId}</td>
                                        <td className="py-3">{formatDate(booking.startAt)}</td>
                                        <td className="py-3">
                                            <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="py-3">
                                            {formatRange(booking.minPrice, booking.maxPrice)}
                                        </td>
                                        <td className="py-3 text-right font-semibold">
                                            {formatVnd(booking.amount)}
                                        </td>
                                        <td className="py-3 text-right">
                                            {booking.status === "Pending" ? (
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(booking.bookingId, "Declined")}
                                                        disabled={updatingId === booking.bookingId}
                                                        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                                                    >
                                                        Decline
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleStatusChange(booking.bookingId, "Confirmed")}
                                                        disabled={updatingId === booking.bookingId}
                                                        className="rounded-md bg-primary px-2.5 py-1 text-xs font-semibold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        Accept
                                                    </button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        No jobs available yet.
                    </p>
                )}
            </div>
        </WorkerDashboardShell>
    );
};
