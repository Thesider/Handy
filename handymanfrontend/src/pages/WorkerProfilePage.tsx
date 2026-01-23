import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getBookingsByWorker, updateBookingStatus } from "../api/booking.api";
import { getServices, getWorkerById, updateWorker } from "../api/handyman.api";
import type { Booking } from "../features/booking/booking.types";
import type { Service, Worker } from "../features/handyman/handyman.types";
import { WorkerDashboardShell } from "../components/layout/WorkerDashboardShell";
import styles from "./WorkerProfilePage.module.css";

export const WorkerProfilePage = () => {
    const { user } = useAuth();
    const [worker, setWorker] = useState<Worker | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updatingBookingId, setUpdatingBookingId] = useState<number | null>(null);

    useEffect(() => {
        if (user?.role !== "Worker") {
            setWorker(null);
            setServices([]);
            setLoading(false);
            setError(null);
            return;
        }

        const workerId = user?.id;
        if (!workerId) {
            setWorker(null);
            setServices([]);
            setBookings([]);
            setLoading(false);
            setError("Không tìm thấy mã thợ cho tài khoản này.");
            return;
        }

        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [workerData, serviceData, bookingData] = await Promise.all([
                    getWorkerById(workerId),
                    getServices(),
                    getBookingsByWorker(workerId),
                ]);
                if (!isMounted) return;
                setWorker(workerData);
                setServices(serviceData);
                setBookings(bookingData);
            } catch {
                if (!isMounted) return;
                setError("Không thể tải hồ sơ thợ lúc này.");
            } finally {
                if (!isMounted) return;
                setLoading(false);
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [user?.role, user?.id]);

    const workerId = user?.id ?? null;
    const serviceLookup = useMemo(() => {
        const map = new Map<number, Service>();
        services.forEach((service) => map.set(service.serviceId, service));
        return map;
    }, [services]);

    const workerBookings = useMemo(() => {
        if (!workerId) return [];
        return bookings.filter((booking) => booking.workerId === workerId);
    }, [bookings, workerId]);

    const pendingRequests = useMemo(
        () =>
            workerBookings
                .filter((booking) => booking.status === "Pending")
                .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
                .slice(0, 3),
        [workerBookings]
    );

    const upcomingJobs = useMemo(() => {
        const now = Date.now();
        return workerBookings
            .filter(
                (booking) =>
                    (booking.status === "Confirmed" || booking.status === "InProgress") &&
                    new Date(booking.startAt).getTime() >= now
            )
            .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
            .slice(0, 3);
    }, [workerBookings]);

    const completedJobs = useMemo(
        () => workerBookings.filter((booking) => booking.status === "Completed"),
        [workerBookings]
    );

    const monthlyEarnings = useMemo(() => {
        const now = new Date();
        return completedJobs
            .filter((booking) => {
                const date = new Date(booking.endAt ?? booking.startAt);
                return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
            })
            .reduce((sum, booking) => sum + booking.amount, 0);
    }, [completedJobs]);

    const formatVnd = (value: number) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(value);

    const handleRequestUpdate = async (bookingId: number, nextStatus: "Confirmed" | "Declined") => {
        try {
            setUpdatingBookingId(bookingId);
            await updateBookingStatus(bookingId, nextStatus);
            setBookings((previous) =>
                previous.map((booking) =>
                    booking.bookingId === bookingId
                        ? { ...booking, status: nextStatus }
                        : booking
                )
            );
        } catch {
            setError("Unable to update booking status. Please try again.");
        } finally {
            setUpdatingBookingId(null);
        }
    };

    const formatTime = (value: string) =>
        new Date(value).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });

    const formatDayLabel = (value: string) => {
        const date = new Date(value);
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        if (date.toDateString() === today.toDateString()) return "Today";
        if (date.toDateString() === tomorrow.toDateString()) return "Tmrw";
        return date.toLocaleDateString("en-US", { month: "short" });
    };

    const formatDayNumber = (value: string) =>
        new Date(value).getDate().toString().padStart(2, "0");

    const handleToggleStatus = async () => {
        if (!worker) return;
        try {
            const updated = { ...worker, isAvailable: !worker.isAvailable };
            await updateWorker(worker.workerId, updated);
            setWorker(updated);
        } catch {
            setError("Cannot update status at this time.");
        }
    };

    const displayName = worker
        ? `${worker.firstName} ${worker.lastName}`
        : user?.name ?? "HandyHelper";
    const headlineName = worker?.firstName ?? displayName.split(" ")[0] ?? "HandyHelper";
    const statusOnline = worker?.isAvailable ?? false;
    const ratingValue = worker?.rating ?? 0;

    return (
        <WorkerDashboardShell>
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-black leading-tight tracking-tight text-slate-900">
                        Welcome back, {headlineName}
                    </h1>
                    <p className="text-base font-normal text-slate-500">
                        Here's what's happening with your business today.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1.5">
                        <span className={`h-2 w-2 rounded-full ${statusOnline ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
                        <span className={`text-xs font-bold uppercase tracking-wide ${statusOnline ? "text-green-700" : "text-slate-600"}`}>
                            {statusOnline ? "Online" : "Offline"}
                        </span>
                    </div>
                    <button
                        onClick={handleToggleStatus}
                        className="flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 shadow-sm transition-colors hover:bg-slate-50"
                    >
                        {statusOnline ? "Go Offline" : "Go Online"}
                    </button>
                </div>
            </header>

            {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    {error}
                </div>
            ) : null}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Earnings this Month
                        </p>
                        <span className="material-symbols-outlined text-[20px] text-primary">
                            payments
                        </span>
                    </div>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold leading-tight text-slate-900">
                            {formatVnd(monthlyEarnings)}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Jobs Completed
                        </p>
                        <span className="material-symbols-outlined text-[20px] text-primary">
                            check_circle
                        </span>
                    </div>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold leading-tight text-slate-900">
                            {completedJobs.length}
                        </p>
                    </div>
                </div>
                <div className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-slate-500">
                            Average Rating
                        </p>
                        <span className="material-symbols-outlined text-[20px] text-primary">
                            thumb_up
                        </span>
                    </div>
                    <div className="flex items-end gap-2">
                        <p className="text-2xl font-bold leading-tight text-slate-900">
                            {ratingValue.toFixed(1)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="flex flex-col gap-6 xl:col-span-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900">
                                    Earnings Trend
                                </h2>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="text-2xl font-bold text-slate-900">
                                        {formatVnd(
                                            completedJobs.reduce(
                                                (sum, booking) => sum + booking.amount,
                                                0
                                            )
                                        )}
                                    </span>
                                    <span className="text-sm text-slate-500">
                                        Total Year
                                    </span>
                                </div>
                            </div>
                            <select
                                aria-label="Earnings range"
                                className="rounded-lg border-none bg-slate-50 text-sm font-medium text-slate-600 focus:ring-2 focus:ring-primary/20"
                            >
                                <option>Last 6 Months</option>
                                <option>Last Year</option>
                            </select>
                        </div>
                        <div className="relative h-48 w-full">
                            <svg
                                className="h-full w-full overflow-visible"
                                preserveAspectRatio="none"
                                viewBox="0 0 478 150"
                            >
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#137fec" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#137fec" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path
                                    d="M0 109C18.15 109 18.15 21 36.3 21C54.46 21 54.46 41 72.6 41C90.7 41 90.7 93 108.9 93C127 93 127 33 145.2 33C163.3 33 163.3 101 181.5 101C199.6 101 199.6 61 217.8 61C236 61 236 45 254.1 45C272.3 45 272.3 121 290.4 121C308.6 121 308.6 149 326.7 149C344.9 149 344.9 1 363 1C381.2 1 381.2 81 399.3 81C417.5 81 417.5 129 435.6 129C453.8 129 453.8 25 472 25V150H0V109Z"
                                    fill="url(#chartGradient)"
                                />
                                <path
                                    d="M0 109C18.15 109 18.15 21 36.3 21C54.46 21 54.46 41 72.6 41C90.7 41 90.7 93 108.9 93C127 93 127 33 145.2 33C163.3 33 163.3 101 181.5 101C199.6 101 199.6 61 217.8 61C236 61 236 45 254.1 45C272.3 45 272.3 121 290.4 121C308.6 121 308.6 149 326.7 149C344.9 149 344.9 1 363 1C381.2 1 381.2 81 399.3 81C417.5 81 417.5 129 435.6 129C453.8 129 453.8 25 472 25"
                                    fill="none"
                                    stroke="#137fec"
                                    strokeLinecap="round"
                                    strokeWidth="3"
                                />
                            </svg>
                        </div>
                        <div className="mt-4 flex justify-between px-2">
                            <p className="text-xs font-semibold uppercase text-slate-400">Mar</p>
                            <p className="text-xs font-semibold uppercase text-slate-400">Apr</p>
                            <p className="text-xs font-semibold uppercase text-slate-400">May</p>
                            <p className="text-xs font-semibold uppercase text-slate-400">Jun</p>
                            <p className="text-xs font-semibold uppercase text-slate-400">Jul</p>
                            <p className="text-xs font-semibold uppercase text-slate-400">Aug</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-900">
                                Upcoming Schedule
                            </h2>
                            <Link
                                className="text-sm font-semibold text-primary hover:underline"
                                to="/worker/jobs"
                            >
                                View Calendar
                            </Link>
                        </div>

                        <div className="flex flex-col gap-3">
                            {loading ? (
                                <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
                                    Loading schedule...
                                </div>
                            ) : upcomingJobs.length ? (
                                upcomingJobs.map((job) => {
                                    const serviceName =
                                        serviceLookup.get(job.serviceId)?.serviceName ?? "Service";
                                    return (
                                        <div
                                            key={job.bookingId}
                                            className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                                        >
                                            <div className="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-lg border border-slate-100 bg-slate-50">
                                                <span className="text-xs font-bold uppercase text-slate-500">
                                                    {formatDayLabel(job.startAt)}
                                                </span>
                                                <span className="text-xl font-black text-slate-900">
                                                    {formatDayNumber(job.startAt)}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-base font-bold text-slate-900">
                                                            {serviceName}
                                                        </h3>
                                                        <p className="text-sm text-slate-500">
                                                            Customer #{job.customerId}
                                                        </p>
                                                    </div>
                                                    <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                                                        {formatTime(job.startAt)}
                                                    </span>
                                                </div>
                                                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                                                    <span className="material-symbols-outlined text-[16px]">
                                                        location_on
                                                    </span>
                                                    <span>Assigned job location</span>
                                                </div>
                                            </div>
                                            <button className="shrink-0 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200">
                                                Details
                                            </button>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm">
                                    No upcoming jobs yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-slate-900">
                            New Requests
                            {pendingRequests.length ? (
                                <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                                    {pendingRequests.length}
                                </span>
                            ) : null}
                        </h2>
                    </div>
                    <div className="flex h-full flex-col gap-3">
                        {loading ? (
                            <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
                                Loading requests...
                            </div>
                        ) : pendingRequests.length ? (
                            pendingRequests.map((request, index) => {
                                const serviceName =
                                    serviceLookup.get(request.serviceId)?.serviceName ?? "Service";
                                const avatarClass =
                                    index === 0
                                        ? styles.requestAvatarAlice
                                        : index === 1
                                            ? styles.requestAvatarBob
                                            : styles.requestAvatarClara;
                                return (
                                    <div
                                        key={request.bookingId}
                                        className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex gap-3">
                                                <div
                                                    className={`size-12 rounded-full border border-slate-100 bg-cover bg-center ${avatarClass}`}
                                                    aria-hidden="true"
                                                />
                                                <div>
                                                    <h3 className="text-base font-bold text-slate-900">
                                                        Customer #{request.customerId}
                                                    </h3>
                                                    <p className="text-sm text-slate-500">
                                                        {serviceName}
                                                    </p>
                                                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                                                        <span className="material-symbols-outlined text-[14px]">
                                                            schedule
                                                        </span>
                                                        <span>
                                                            {formatDayLabel(request.startAt)} • {formatTime(request.startAt)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-slate-900">
                                                    {request.minPrice || request.maxPrice
                                                        ? `${formatVnd(request.minPrice)} - ${formatVnd(request.maxPrice)}`
                                                        : formatVnd(request.amount)}
                                                </p>
                                                <p className="text-xs text-slate-500">Est.</p>
                                            </div>
                                        </div>
                                        <div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-600">
                                            {request.notes ?? "New service request awaiting your response."}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                disabled={updatingBookingId === request.bookingId}
                                                onClick={() => handleRequestUpdate(request.bookingId, "Declined")}
                                            >
                                                Decline
                                            </button>
                                            <button
                                                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                                                disabled={updatingBookingId === request.bookingId}
                                                onClick={() => handleRequestUpdate(request.bookingId, "Confirmed")}
                                            >
                                                Accept
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
                                No pending requests right now.
                            </div>
                        )}
                        <button className="mt-2 rounded-lg border border-dashed border-primary/30 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5">
                            View All Requests
                        </button>
                    </div>
                </div>
            </div>
        </WorkerDashboardShell>
    );
};
