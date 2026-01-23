import { useEffect, useMemo, useState } from "react";
import { WorkerDashboardShell } from "../components/layout/WorkerDashboardShell";
import { useAuth } from "../hooks/useAuth";
import { getBookingsByWorker, updateBookingStatus } from "../api/booking.api";
import { getServices } from "../api/handyman.api";
import type { Booking, BookingStatus } from "../features/booking/booking.types";
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
            setError("Worker ID not found for this account.");
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
                setError("Unable to load jobs.");
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
            weekday: "short"
        });

    const formatVnd = (value: number) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(value);

    const handleStatusChange = async (bookingId: number, status: BookingStatus) => {
        const confirmMsg = status === "Declined" ? "Are you sure you want to decline this job?" :
            status === "Confirmed" ? "Accept this booking request?" :
                status === "Completed" ? "Mark this job as completed?" : null;

        if (confirmMsg && !window.confirm(confirmMsg)) return;

        try {
            setUpdatingId(bookingId);
            await updateBookingStatus(bookingId, status);
            setBookings((previous) =>
                previous.map((booking) =>
                    booking.bookingId === bookingId ? { ...booking, status } : booking
                )
            );
        } catch {
            setError("Failed to update job status.");
        } finally {
            setUpdatingId(null);
        }
    };

    const getStatusStyles = (status: BookingStatus) => {
        switch (status) {
            case "Pending": return "bg-amber-100 text-amber-700 border-amber-200";
            case "Confirmed": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "InProgress": return "bg-blue-100 text-blue-700 border-blue-200";
            case "Completed": return "bg-slate-100 text-slate-600 border-slate-200";
            case "Cancelled": return "bg-rose-100 text-rose-700 border-rose-200";
            case "Declined": return "bg-gray-100 text-gray-500 border-gray-200";
            default: return "bg-slate-100 text-slate-700";
        }
    };

    return (
        <WorkerDashboardShell>
            <div className="max-w-6xl mx-auto space-y-8 py-6">
                <header className="flex flex-col gap-2">
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Jobs</h1>
                    <p className="text-slate-500 font-medium">
                        Manage your incoming requests and ongoing projects.
                    </p>
                </header>

                {error && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center gap-3">
                        <span className="material-symbols-outlined text-rose-500">error</span>
                        {error}
                    </div>
                )}

                <div className="grid gap-6">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : sortedBookings.length ? (
                        sortedBookings.map((booking) => (
                            <div key={booking.bookingId} className="group relative bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
                                <div className="p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyles(booking.status)}`}>
                                                {booking.status}
                                            </span>
                                            <span className="text-sm text-slate-400 font-medium tracking-wide">
                                                JOB #{booking.bookingId}
                                            </span>
                                        </div>

                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900">
                                                {serviceLookup.get(booking.serviceId)?.serviceName ?? "General Service"}
                                            </h3>
                                            <p className="text-slate-600 font-medium flex items-center gap-2 mt-1">
                                                <span className="material-symbols-outlined text-sm">person</span>
                                                Customer #{booking.customerId}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-6 text-sm">
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <span className="material-symbols-outlined text-lg">calendar_today</span>
                                                <span className="font-semibold">{formatDate(booking.startAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500">
                                                <span className="material-symbols-outlined text-lg">payments</span>
                                                <span className="font-bold text-slate-900">
                                                    {booking.amount > 0 ? formatVnd(booking.amount) : "Quote Required"}
                                                </span>
                                            </div>
                                        </div>

                                        {booking.notes && (
                                            <div className="text-sm text-slate-500 italic bg-slate-50 p-3 rounded-lg border-l-4 border-slate-200">
                                                "{booking.notes}"
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-3 min-w-[160px]">
                                        {booking.status === "Pending" ? (
                                            <>
                                                <button
                                                    onClick={() => handleStatusChange(booking.bookingId, "Confirmed")}
                                                    disabled={updatingId === booking.bookingId}
                                                    className="w-full py-2.5 px-4 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                                >
                                                    Accept Job
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(booking.bookingId, "Declined")}
                                                    disabled={updatingId === booking.bookingId}
                                                    className="w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-50"
                                                >
                                                    Decline
                                                </button>
                                            </>
                                        ) : booking.status === "Confirmed" ? (
                                            <button
                                                onClick={() => handleStatusChange(booking.bookingId, "InProgress")}
                                                disabled={updatingId === booking.bookingId}
                                                className="w-full py-2.5 px-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
                                            >
                                                Start Work
                                            </button>
                                        ) : booking.status === "InProgress" ? (
                                            <button
                                                onClick={() => handleStatusChange(booking.bookingId, "Completed")}
                                                disabled={updatingId === booking.bookingId}
                                                className="w-full py-2.5 px-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                                            >
                                                Mark Completed
                                            </button>
                                        ) : (
                                            <div className="text-center py-2 text-slate-400 text-sm font-medium">
                                                No actions available
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                            <span className="material-symbols-outlined text-5xl text-slate-300">work_off</span>
                            <p className="mt-4 text-slate-500 font-medium">No jobs found. Your schedule is clear!</p>
                        </div>
                    )}
                </div>
            </div>
        </WorkerDashboardShell>
    );
};
