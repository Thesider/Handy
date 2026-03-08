import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getServices } from "../../api/handyman.api";
import { searchWorkers } from "../../api/workers.api";
import type { Service, Worker } from "./handyman.types";

const parseLatLng = (value: string): { latitude: number; longitude: number } | null => {
    const parts = value.split(",").map((p) => p.trim());
    if (parts.length !== 2) return null;
    const latitude = Number(parts[0]);
    const longitude = Number(parts[1]);
    if (Number.isNaN(latitude) || Number.isNaN(longitude)) return null;
    return { latitude, longitude };
};

export const HandymanListPage = () => {
    const [searchParams] = useSearchParams();
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [availability, setAvailability] = useState(false);
    const [minRating, setMinRating] = useState(0);
    const [serviceId, setServiceId] = useState<number | "">("");
    const [searchTerm, setSearchTerm] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [locationInput, setLocationInput] = useState("");
    const [radiusKm, setRadiusKm] = useState(10);
    const [geoCoords, setGeoCoords] = useState<{ latitude: number; longitude: number } | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 6;

    const searchCoords = useMemo(() => geoCoords ?? parseLatLng(locationInput), [geoCoords, locationInput]);
    const hasLocationSearch = Boolean(searchCoords);

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
        const loadServices = async () => {
            try {
                const serviceData = await getServices();
                setServices(serviceData);
            } catch {
                // Non-blocking for worker search experience
            }
        };

        void loadServices();
    }, []);

    useEffect(() => {
        const loadWorkers = async () => {
            try {
                setLoading(true);
                const minPriceNumber = minPrice ? Number(minPrice) : undefined;
                const maxPriceNumber = maxPrice ? Number(maxPrice) : undefined;
                const workersData = await searchWorkers({
                    minRating: minRating > 0 ? minRating : undefined,
                    minPrice: Number.isFinite(minPriceNumber as number) ? minPriceNumber : undefined,
                    maxPrice: Number.isFinite(maxPriceNumber as number) ? maxPriceNumber : undefined,
                    latitude: searchCoords?.latitude,
                    longitude: searchCoords?.longitude,
                    maxDistanceKm: hasLocationSearch ? radiusKm : undefined,
                });
                setWorkers(workersData);
                setError(null);
            } catch {
                setError("Cannot load workers right now. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        void loadWorkers();
    }, [minRating, minPrice, maxPrice, hasLocationSearch, radiusKm, searchCoords]);

    const filteredWorkers = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();

        const byService = serviceId
            ? workers.filter((worker) => worker.workerProfileId === Number(serviceId) || worker.skillsCsv?.toLowerCase().includes(String(serviceId)))
            : workers;

        return byService
            .filter((worker) => {
                if (availability && !worker.isAvailable) return false;
                if (!normalizedSearch) return true;

                const fullName = `${worker.firstName} ${worker.lastName}`.toLowerCase();
                const location = `${worker.address.city} ${worker.address.state}`.toLowerCase();
                return fullName.includes(normalizedSearch) || location.includes(normalizedSearch);
            })
            .sort((a, b) => {
                if (!hasLocationSearch) {
                    return b.rating - a.rating;
                }
                const da = a.distanceKm ?? Number.MAX_VALUE;
                const db = b.distanceKm ?? Number.MAX_VALUE;
                if (da !== db) return da - db;
                return b.rating - a.rating;
            });
    }, [workers, availability, searchTerm, serviceId, hasLocationSearch]);

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

    useEffect(() => {
        setCurrentPage(1);
    }, [availability, minRating, serviceId, searchTerm, minPrice, maxPrice, locationInput, radiusKm, geoCoords]);

    const clearFilters = () => {
        setAvailability(false);
        setMinRating(0);
        setServiceId("");
        setSearchTerm("");
        setMinPrice("");
        setMaxPrice("");
        setLocationInput("");
        setGeoCoords(null);
        setRadiusKm(10);
    };

    const requestCurrentLocation = () => {
        if (!navigator.geolocation) {
            setError("Location is not supported on this device. Showing rating-sorted results.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setGeoCoords({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLocationInput(`${position.coords.latitude.toFixed(5)}, ${position.coords.longitude.toFixed(5)}`);
            },
            () => {
                setError("Location permission unavailable. Showing rating-sorted results.");
                setGeoCoords(null);
            }
        );
    };

    if (loading) {
        return <div className="min-h-screen p-8 text-slate-500">Loading workers...</div>;
    }

    return (
        <div className="min-h-screen bg-background-light px-4 py-6 md:px-10 lg:px-40">
            <div className="mx-auto max-w-[1200px]">
                <div className="mb-6">
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Find Workers</h1>
                    <p className="text-sm text-slate-500">Showing {filteredWorkers.length} matching professionals</p>
                </div>

                {error ? (
                    <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>
                ) : null}

                {!hasLocationSearch ? (
                    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
                        Location is not active. Results are sorted by rating.
                    </div>
                ) : null}

                <div className="flex flex-col gap-8 lg:flex-row">
                    <aside className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:w-80">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-900">Filters</h3>
                            <button type="button" onClick={clearFilters} className="text-sm font-medium text-primary">Clear</button>
                        </div>

                        <div className="mt-4 flex flex-col gap-4">
                            <label className="text-sm font-medium text-slate-900">Service</label>
                            <select
                                value={serviceId}
                                onChange={(event) => setServiceId(event.target.value ? Number(event.target.value) : "")}
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                title="Service filter"
                                aria-label="Service filter"
                            >
                                <option value="">All Services</option>
                                {services.map((service) => (
                                    <option key={service.serviceId} value={service.serviceId}>{service.serviceName}</option>
                                ))}
                            </select>

                            <label className="text-sm font-medium text-slate-900">Minimum Rating: {minRating.toFixed(1)}</label>
                            <input
                                type="range"
                                min={0}
                                max={5}
                                step={0.5}
                                value={minRating}
                                onChange={(event) => setMinRating(Number(event.target.value))}
                                className="accent-primary"
                                title="Minimum rating"
                                aria-label="Minimum rating"
                            />

                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    value={minPrice}
                                    onChange={(event) => setMinPrice(event.target.value)}
                                    placeholder="Min price"
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                                <input
                                    type="number"
                                    value={maxPrice}
                                    onChange={(event) => setMaxPrice(event.target.value)}
                                    placeholder="Max price"
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                            </div>

                            <input
                                type="text"
                                value={locationInput}
                                onChange={(event) => {
                                    setGeoCoords(null);
                                    setLocationInput(event.target.value);
                                }}
                                placeholder="Location (lat,lng) or use current"
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                title="Location coordinates"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="number"
                                    value={radiusKm}
                                    onChange={(event) => setRadiusKm(Math.max(1, Number(event.target.value) || 1))}
                                    placeholder="Radius km"
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                />
                                <button type="button" onClick={requestCurrentLocation} className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200">
                                    Use My Location
                                </button>
                            </div>

                            <label className="flex items-center gap-2 text-sm text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={availability}
                                    onChange={(event) => setAvailability(event.target.checked)}
                                />
                                Available now
                            </label>

                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                placeholder="Search by name/city"
                                className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                            />
                        </div>
                    </aside>

                    <main className="flex-1 flex flex-col gap-4">
                        {pagedWorkers.map((worker) => (
                            <div key={worker.workerId} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900">{worker.firstName} {worker.lastName}</h3>
                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                            <span>{worker.address.city}</span>
                                            <span>•</span>
                                            <span>{worker.rating.toFixed(1)}★</span>
                                            {hasLocationSearch && worker.distanceKm != null ? (
                                                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                                    {worker.distanceKm.toFixed(1)} km
                                                </span>
                                            ) : null}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-slate-900">{formatVnd(worker.hourlyRate)}</p>
                                        <p className="text-xs text-slate-500">per hour</p>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between">
                                    <span className={`text-sm font-medium ${worker.isAvailable ? "text-emerald-600" : "text-slate-400"}`}>
                                        {worker.isAvailable ? "Available" : "Busy"}
                                    </span>
                                    <Link to={`/handymen/${worker.workerId}`} className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-primary">
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                        ))}

                        {filteredWorkers.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
                                No workers found for the current filters.
                            </div>
                        ) : null}

                        {totalPages > 1 ? (
                            <div className="flex items-center justify-center gap-2 py-4">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                >
                                    Prev
                                </button>
                                <span className="text-sm text-slate-500">{currentPage} / {totalPages}</span>
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                                >
                                    Next
                                </button>
                            </div>
                        ) : null}
                    </main>
                </div>
            </div>
        </div>
    );
};
