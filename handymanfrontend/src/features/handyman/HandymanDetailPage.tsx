import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getServices, getWorkerById } from "../../api/handyman.api";
import { BookingForm } from "../booking/BookingForm";
import { formatCurrency } from "../../utils/validators";
import type { Service, Worker } from "./handyman.types";

export const HandymanDetailPage = () => {
    const { id } = useParams();
    const [worker, setWorker] = useState<Worker | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const [workerData, serviceData] = await Promise.all([
                    getWorkerById(Number(id)),
                    getServices(),
                ]);
                setWorker(workerData);
                setServices(serviceData);
                setError(null);
            } catch (err) {
                setError("Unable to load this handyman profile.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    const availableServices = useMemo(() => services.slice(0, 6), [services]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8 lg:px-20">
                <div className="mx-auto max-w-5xl space-y-6">
                    <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                        <div className="col-span-2 space-y-6">
                            <div className="h-64 animate-pulse rounded-2xl bg-white shadow-sm" />
                            <div className="h-40 animate-pulse rounded-2xl bg-white shadow-sm" />
                        </div>
                        <div className="h-96 animate-pulse rounded-2xl bg-white shadow-sm" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !worker) {
        return (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
                <div className="rounded-full bg-red-50 p-4 text-red-500">
                    <span className="material-symbols-outlined text-4xl">error</span>
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                    {error ?? "Handyman not found"}
                </h2>
                <Link
                    to="/handymen"
                    className="flex items-center gap-2 rounded-lg font-medium text-primary hover:underline"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Back to list
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8 lg:px-20">
            <div className="mx-auto max-w-6xl">
                {/* Breadcrumb / Back Navigation */}
                <Link
                    to="/handymen"
                    className="mb-6 flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
                >
                    <span className="material-symbols-outlined text-lg">arrow_back</span>
                    Quay lại danh sách
                </Link>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Left Column: Profile Info */}
                    <div className="space-y-6 lg:col-span-8">
                        {/* Profile Header Card */}
                        <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 sm:p-8">
                            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                                {/* Avatar */}
                                <div className="group relative">
                                    <div className="flex size-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-primary shadow-inner sm:size-32">
                                        <span className="material-symbols-outlined text-[3.5rem] leading-none sm:text-[4.5rem]">
                                            face
                                        </span>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2 rounded-full ring-4 ring-white">
                                        <div
                                            className={`flex size-8 items-center justify-center rounded-full ${worker.isAvailable ? "bg-emerald-500" : "bg-slate-400"
                                                } text-white shadow-sm`}
                                            title={worker.isAvailable ? "Available" : "Unavailable"}
                                        >
                                            <span className="material-symbols-outlined text-lg">
                                                {worker.isAvailable ? "check" : "block"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                                        <div>
                                            <h1 className="text-3xl font-black tracking-tight text-slate-900">
                                                {worker.firstName} {worker.lastName}
                                            </h1>
                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-600">
                                                <span className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-lg text-slate-400">
                                                        location_on
                                                    </span>
                                                    {worker.address.city}, {worker.address.state}
                                                </span>
                                                <span className="flex items-center gap-1.5">
                                                    <span className="material-symbols-outlined text-lg text-slate-400">
                                                        mail
                                                    </span>
                                                    {worker.email}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="rounded-xl bg-slate-50 px-4 py-2 text-center sm:text-right">
                                            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                                                Giá tham khảo
                                            </p>
                                            <div className="flex items-baseline justify-center gap-1 sm:justify-end">
                                                <span className="text-2xl font-black text-slate-900">
                                                    {formatCurrency(worker.hourlyRate)}
                                                </span>
                                                <span className="text-sm font-medium text-slate-500">
                                                    /giờ
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="mt-6 grid grid-cols-3 divide-x divide-slate-100 rounded-xl border border-slate-100 bg-white shadow-sm">
                                        <div className="p-4 text-center">
                                            <div className="flex items-center justify-center gap-1 font-bold text-slate-900">
                                                <span className="material-symbols-outlined filled text-amber-400 mb-0.5 text-xl">
                                                    star
                                                </span>
                                                {worker.rating}
                                            </div>
                                            <div className="mt-0.5 text-xs font-medium text-slate-500">
                                                Đánh giá
                                            </div>
                                        </div>
                                        <div className="p-4 text-center">
                                            <div className="font-bold text-slate-900">
                                                {worker.yearsOfExperience}+
                                            </div>
                                            <div className="mt-0.5 text-xs font-medium text-slate-500">
                                                Năm kinh nghiệm
                                            </div>
                                        </div>
                                        <div className="p-4 text-center">
                                            <div className="font-bold text-emerald-600">100%</div>
                                            <div className="mt-0.5 text-xs font-medium text-slate-500">
                                                Hoàn thành
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* About / Services Section */}
                        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5 md:p-8">
                            <h2 className="flex items-center gap-2 text-xl font-bold text-slate-900">
                                <span className="material-symbols-outlined text-primary">
                                    handyman
                                </span>
                                Dịch vụ cung cấp
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                Các dịch vụ phổ biến mà thợ này có thể thực hiện chuyên nghiệp.
                            </p>

                            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                                {availableServices.map((service) => (
                                    <div
                                        key={service.serviceId}
                                        className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-colors hover:border-primary/20 hover:bg-primary/5"
                                    >
                                        <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-900/5 group-hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined">
                                                construction
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                                            {service.serviceName}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Booking Widget */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-24 space-y-4">
                            <div className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-900/5">
                                <div className="bg-primary px-6 py-4">
                                    <h3 className="text-lg font-bold text-white">Đặt lịch ngay</h3>
                                    <p className="text-primary-100 text-sm opacity-90">
                                        Điền thông tin bên dưới để gửi yêu cầu
                                    </p>
                                </div>
                                <div className="p-6">
                                    <BookingForm workerId={worker.workerId} services={services} />
                                </div>
                                <div className="border-t border-slate-100 bg-slate-50 px-6 py-4 text-center">
                                    <p className="text-xs text-slate-500">
                                        <span className="material-symbols-outlined align-middle text-sm text-slate-400">
                                            lock
                                        </span>{" "}
                                        Thông tin của bạn được bảo mật
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
