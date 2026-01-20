import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getServices, getWorkers } from "../../api/handyman.api";
import { getBookingsByService } from "../../api/booking.api";
import type { Service, Worker } from "./handyman.types";

export const HandymanListPage = () => {
    const [searchParams] = useSearchParams();
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [availability, setAvailability] = useState(false);
    const [minRating, setMinRating] = useState(0);
    const [serviceId, setServiceId] = useState<number | "">("");
    const [serviceWorkerIds, setServiceWorkerIds] = useState<number[] | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [maxPrice, setMaxPrice] = useState(0);
    const [minExperience, setMinExperience] = useState(0);
    const [viewMode, setViewMode] = useState<"list" | "map">("list");
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    const maxHourlyRate = useMemo(
        () => (workers.length ? Math.max(...workers.map((w) => w.hourlyRate)) : 0),
        [workers]
    );
    const maxExperience = useMemo(
        () =>
            workers.length ? Math.max(...workers.map((w) => w.yearsOfExperience)) : 0,
        [workers]
    );

    const hasActiveFilters =
        availability ||
        minRating > 0 ||
        serviceId !== "" ||
        searchTerm.trim().length > 0 ||
        minExperience > 0 ||
        (maxHourlyRate > 0 && maxPrice < maxHourlyRate);

    useEffect(() => {
        if (maxHourlyRate > 0 && (maxPrice === 0 || maxPrice > maxHourlyRate)) {
            setMaxPrice(maxHourlyRate);
        }
    }, [maxHourlyRate, maxPrice]);

    const handleClearFilters = () => {
        setAvailability(false);
        setMinRating(0);
        setServiceId("");
        setMinExperience(0);
        setSearchTerm("");
        setMaxPrice(maxHourlyRate);
    };

    const skeletonCards = Array.from({ length: 4 });

    useEffect(() => {
        const serviceIdParam = searchParams.get("serviceId");
        const queryParam = searchParams.get("query");
        if (serviceIdParam) {
            const parsed = Number(serviceIdParam);
            setServiceId(Number.isNaN(parsed) ? "" : parsed);
        }
        if (queryParam) {
            setSearchTerm(queryParam);
        }
    }, [searchParams]);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const [workersData, servicesData] = await Promise.all([
                    getWorkers(),
                    getServices(),
                ]);
                setWorkers(workersData);
                setServices(servicesData);
                setError(null);
            } catch {
                setError("Không thể tải danh sách thợ. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        const loadServiceBookings = async () => {
            if (!serviceId) {
                setServiceWorkerIds(null);
                return;
            }
            try {
                const bookings = await getBookingsByService(Number(serviceId));
                const ids = [...new Set(bookings.map((booking) => booking.workerId))];
                setServiceWorkerIds(ids);
            } catch {
                setServiceWorkerIds(null);
            }
        };

        loadServiceBookings();
    }, [serviceId]);

    const filteredWorkers = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        return workers.filter((worker) => {
            if (availability && !worker.isAvailable) return false;
            if (worker.rating < minRating) return false;
            if (serviceWorkerIds && !serviceWorkerIds.includes(worker.workerId)) {
                return false;
            }
            if (maxPrice > 0 && worker.hourlyRate > maxPrice) return false;
            if (minExperience > 0 && worker.yearsOfExperience < minExperience) return false;

            if (normalizedSearch) {
                const fullName = `${worker.firstName} ${worker.lastName}`.toLowerCase();
                const location = `${worker.address.city} ${worker.address.state}`.toLowerCase();
                if (!fullName.includes(normalizedSearch) && !location.includes(normalizedSearch)) {
                    return false;
                }
            }
            return true;
        });
    }, [
        workers,
        availability,
        minRating,
        serviceWorkerIds,
        maxPrice,
        minExperience,
        searchTerm,
    ]);

    const totalPages = Math.max(1, Math.ceil(filteredWorkers.length / pageSize));
    const pagedWorkers = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredWorkers.slice(start, start + pageSize);
    }, [filteredWorkers, currentPage]);

    const formatVnd = (value: number) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(value);

    const locationLabel = useMemo(() => {
        const first = workers.find((w) => w.address?.city);
        if (!first) return "Việt Nam";
        return `${first.address.city}${first.address.state ? `, ${first.address.state}` : ""}`;
    }, [workers]);

    useEffect(() => {
        setCurrentPage(1);
    }, [availability, minRating, serviceId, searchTerm, maxPrice, minExperience]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background-light px-4 py-6 md:px-10 lg:px-40">
                <div className="mx-auto max-w-[1200px]">
                    <div className="mb-6 space-y-2">
                        <div className="h-7 w-2/3 rounded bg-slate-200" />
                        <div className="h-4 w-1/2 rounded bg-slate-100" />
                    </div>
                    <div className="flex flex-col gap-6 lg:flex-row">
                        <aside className="h-80 w-full rounded-xl bg-white p-5 shadow-sm lg:w-72" />
                        <main className="grid w-full gap-4">
                            {skeletonCards.map((_, index) => (
                                <div
                                    key={index}
                                    className="h-40 rounded-xl bg-white p-5 shadow-sm"
                                />
                            ))}
                        </main>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background-light px-4 py-6 md:px-10 lg:px-40">
                <div className="mx-auto max-w-[1200px] rounded-xl bg-white p-6 text-center text-sm text-red-600">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light px-4 py-6 md:px-10 lg:px-40">
            <div className="mx-auto max-w-[1200px]">
                <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">
                            Dịch vụ sửa chữa tại {locationLabel}
                        </h1>
                        <p className="text-sm text-slate-500">
                            Hiển thị {filteredWorkers.length} thợ phù hợp
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                            <button
                                type="button"
                                onClick={() => setViewMode("list")}
                                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${viewMode === "list"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">
                                    view_list
                                </span>
                                <span className="hidden sm:inline">Danh sách</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode("map")}
                                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all ${viewMode === "map"
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-500"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[20px]">map</span>
                                <span className="hidden sm:inline">Bản đồ</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col gap-8 lg:flex-row">
                    <aside className="w-full flex-shrink-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:w-72 lg:sticky lg:top-24">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Bộ lọc</h3>
                            <button
                                type="button"
                                onClick={handleClearFilters}
                                disabled={!hasActiveFilters}
                                className="text-sm font-medium text-primary disabled:text-slate-300"
                            >
                                Xoá tất cả
                            </button>
                        </div>

                        <div className="mt-4 flex flex-col gap-4">
                            <div>
                                <label className="text-sm font-medium text-slate-900" htmlFor="service">
                                    Loại dịch vụ
                                </label>
                                <select
                                    id="service"
                                    value={serviceId}
                                    onChange={(event) =>
                                        setServiceId(event.target.value ? Number(event.target.value) : "")
                                    }
                                    className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                                >
                                    <option value="">Tất cả dịch vụ</option>
                                    {services.map((service) => (
                                        <option key={service.serviceId} value={service.serviceId}>
                                            {service.serviceName}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <p className="text-sm font-medium text-slate-900">Giá theo giờ</p>
                                <input
                                    type="range"
                                    min={0}
                                    max={maxHourlyRate || 1}
                                    value={maxPrice}
                                    onChange={(event) => setMaxPrice(Number(event.target.value))}
                                    className="mt-3 w-full accent-primary"
                                />
                                <div className="mt-2 flex justify-between text-xs text-slate-500">
                                    <span>0đ</span>
                                    <span>{formatVnd(maxHourlyRate || 0)}</span>
                                </div>
                            </div>

                            <hr className="border-slate-100" />

                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium text-slate-900">Tình trạng</p>
                                <label className="flex items-center gap-3 text-sm text-slate-600">
                                    <input
                                        type="checkbox"
                                        className="size-4 rounded border-slate-300 text-primary focus:ring-primary/20"
                                        checked={availability}
                                        onChange={(event) => setAvailability(event.target.checked)}
                                    />
                                    Có thể nhận việc ngay
                                </label>
                            </div>

                            <hr className="border-slate-100" />

                            <div className="flex flex-col gap-2">
                                <p className="text-sm font-medium text-slate-900">Đánh giá</p>
                                {[4.5, 4.0, 0].map((value) => (
                                    <label
                                        key={value}
                                        className="flex items-center gap-3 rounded-lg border border-slate-200 p-2.5 text-sm text-slate-700"
                                    >
                                        <input
                                            type="radio"
                                            name="rating_filter"
                                            className="size-4 text-primary"
                                            checked={minRating === value}
                                            onChange={() => setMinRating(value)}
                                        />
                                        <span>{value === 0 ? "Mọi đánh giá" : `${value}★ trở lên`}</span>
                                    </label>
                                ))}
                            </div>

                            <hr className="border-slate-100" />

                            <div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-slate-900">Kinh nghiệm</p>
                                    <span className="text-xs text-slate-500">{minExperience} năm</span>
                                </div>
                                <input
                                    type="range"
                                    min={0}
                                    max={maxExperience || 1}
                                    value={minExperience}
                                    onChange={(event) => setMinExperience(Number(event.target.value))}
                                    className="mt-3 w-full accent-primary"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-slate-900" htmlFor="search">
                                    Tìm theo tên/khu vực
                                </label>
                                <input
                                    id="search"
                                    type="text"
                                    value={searchTerm}
                                    onChange={(event) => setSearchTerm(event.target.value)}
                                    placeholder="VD: Nguyễn Văn A, Hà Nội"
                                    className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                            </div>
                        </div>
                    </aside>

                    <main className="flex-1 w-full flex flex-col gap-4">
                        {filteredWorkers.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Không có thợ phù hợp
                                </h3>
                                <p className="mt-2 text-sm text-slate-600">
                                    Hãy điều chỉnh bộ lọc để mở rộng kết quả.
                                </p>
                                <button
                                    type="button"
                                    onClick={handleClearFilters}
                                    className="mt-4 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white"
                                >
                                    Xoá bộ lọc
                                </button>
                            </div>
                        ) : viewMode === "map" ? (
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <div className="mb-4 flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg font-semibold text-slate-900">
                                            Bản đồ khu vực
                                        </h2>
                                        <p className="text-sm text-slate-500">
                                            Hiển thị khu vực {locationLabel}
                                        </p>
                                    </div>
                                    <span className="text-sm text-slate-500">
                                        {filteredWorkers.length} thợ
                                    </span>
                                </div>
                                <div className="overflow-hidden rounded-xl border border-slate-200">
                                    <iframe
                                        title="Bản đồ thợ"
                                        className="h-[420px] w-full"
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        src={`https://www.google.com/maps?q=${encodeURIComponent(
                                            locationLabel
                                        )}&output=embed`}
                                    />
                                </div>
                                <div className="mt-4 grid gap-3 md:grid-cols-2">
                                    {pagedWorkers.map((worker) => (
                                        <div
                                            key={worker.workerId}
                                            className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
                                        >
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">
                                                    {worker.firstName} {worker.lastName}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {worker.address.city}, {worker.address.state}
                                                </p>
                                            </div>
                                            <Link
                                                to={`/handymen/${worker.workerId}`}
                                                className="text-sm font-medium text-primary hover:underline"
                                            >
                                                Xem hồ sơ
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <>
                                {pagedWorkers.map((worker) => (
                                    <div
                                        key={worker.workerId}
                                        className="group relative flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 sm:flex-row"
                                    >
                                        <div className="relative flex-shrink-0">
                                            <div className="flex size-24 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 text-primary transition-transform duration-300 group-hover:scale-105 sm:size-32">
                                                <span className="material-symbols-outlined text-4xl sm:text-5xl">
                                                    face
                                                </span>
                                            </div>
                                            <div className="absolute -bottom-2 -right-2 rounded-full border border-white bg-white p-1 shadow-sm">
                                                <div className="flex size-6 items-center justify-center rounded-full bg-blue-100 text-blue-600" title="Verified Pro">
                                                    <span className="material-symbols-outlined text-[16px]">
                                                        verified
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-1 flex-col justify-between gap-3">
                                            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h3 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-primary">
                                                            {worker.firstName} {worker.lastName}
                                                        </h3>
                                                        {worker.isAvailable && (
                                                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                                                                Sẵn sàng
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                                                        <span className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1">
                                                            <span className="material-symbols-outlined text-amber-400 text-[18px] filled">
                                                                star
                                                            </span>
                                                            <span className="font-semibold text-slate-700">{worker.rating}</span>
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[18px]">work_history</span>
                                                            {worker.yearsOfExperience} năm exp
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[18px]">location_on</span>
                                                            {worker.address.city}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="text-left sm:text-right">
                                                    <p className="text-2xl font-black text-slate-900">
                                                        {formatVnd(worker.hourlyRate)}
                                                    </p>
                                                    <p className="text-xs font-medium text-slate-500">Giá / giờ</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end gap-3 pt-2">
                                                <span
                                                    className={`text-sm font-medium transition-opacity ${worker.isAvailable
                                                        ? "text-emerald-600 opacity-0 group-hover:opacity-100"
                                                        : "text-slate-400"
                                                        }`}
                                                >
                                                    {worker.isAvailable ? "Có thể đặt ngay" : "Đang bận"}
                                                </span>
                                                <Link
                                                    to={`/handymen/${worker.workerId}`}
                                                    className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary hover:shadow-lg hover:shadow-primary/20 active:scale-95"
                                                >
                                                    Xem hồ sơ
                                                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {totalPages > 1 ? (
                                    <div className="flex items-center justify-center gap-2 py-4">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentPage((prev) => Math.max(1, prev - 1))
                                            }
                                            className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                            aria-label="Trang trước"
                                        >
                                            <span className="material-symbols-outlined">chevron_left</span>
                                        </button>
                                        {Array.from({ length: totalPages }).map((_, index) => {
                                            const page = index + 1;
                                            return (
                                                <button
                                                    key={page}
                                                    type="button"
                                                    onClick={() => setCurrentPage(page)}
                                                    className={`flex size-9 items-center justify-center rounded-lg border text-sm font-medium ${page === currentPage
                                                        ? "border-primary bg-primary text-white"
                                                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        })}
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                                            }
                                            className="flex size-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                            aria-label="Trang sau"
                                        >
                                            <span className="material-symbols-outlined">chevron_right</span>
                                        </button>
                                    </div>
                                ) : null}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};
