import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getServices, getWorkers } from "../api/handyman.api";
import type { Service, Worker } from "../features/handyman/handyman.types";

const SERVICE_ICONS = ["plumbing", "electrical_services", "construction", "cleaning_services", "imagesearch_roller", "format_paint"];

export const HomePage = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState<Service[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const [serviceData, workerData] = await Promise.all([
                    getServices(),
                    getWorkers(),
                ]);
                setServices(serviceData);
                setWorkers(workerData);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const popularServices = useMemo(() => services.slice(0, 6), [services]);
    const topWorkers = useMemo(
        () => [...workers].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4),
        [workers]
    );

    const formatVnd = (value: number) =>
        new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(value);

    const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const query = searchQuery.trim();
        if (query.length === 0) {
            navigate("/handymen");
            return;
        }
        const matchedService = services.find((service) =>
            service.serviceName.toLowerCase().includes(query.toLowerCase())
        );
        if (matchedService) {
            navigate(`/handymen?serviceId=${matchedService.serviceId}`);
            return;
        }
        navigate(`/handymen?query=${encodeURIComponent(query)}`);
    };

    return (
        <main className="flex flex-col bg-background-light">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-4 py-20">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1581578731548-c64695ce6958?q=80&w=2070&auto=format&fit=crop"
                        alt="Hero Background"
                        className="w-full h-full object-cover scale-105"
                    />
                    {/* Stronger overlay at the top and left to make Navbar and text pop */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-950/80 via-blue-900/60 to-transparent" />
                </div>

                <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 text-left space-y-8 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/30 text-blue-100 border border-blue-400/30 backdrop-blur-sm text-sm font-medium">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            Nền tảng thợ số 1 Việt Nam
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold text-white leading-[1.1] font-display">
                            Mọi việc nhà, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">đã có HandyHub lo.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-blue-50/90 max-w-xl leading-relaxed">
                            Kết nối ngay với hàng ngàn chuyên gia uy tín, tận tâm. Sửa chữa, cải tạo hay bảo trì - Chúng tôi luôn sẵn sàng hỗ trợ bạn.
                        </p>

                        <form
                            className="w-full max-w-[600px] rounded-2xl bg-white p-2 shadow-2xl flex flex-col sm:flex-row gap-2"
                            onSubmit={handleSearchSubmit}
                        >
                            <div className="flex flex-1 items-center px-4">
                                <span className="material-symbols-outlined text-gray-400 mr-2">search</span>
                                <input
                                    className="w-full py-3 bg-transparent text-gray-800 placeholder:text-gray-400 focus:outline-none"
                                    placeholder="Bạn đang cần sửa gì?"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all duration-300 shadow-lg shadow-blue-500/30 active:scale-95"
                            >
                                Tìm thợ ngay
                            </button>
                        </form>

                        <div className="flex flex-wrap gap-3 pt-4">
                            <span className="text-white/60 text-sm flex items-center">Gợi ý:</span>
                            {popularServices.slice(0, 3).map((service) => (
                                <Link
                                    key={service.serviceId}
                                    className="text-xs font-semibold px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/10 backdrop-blur-sm transition-all"
                                    to={`/handymen?serviceId=${service.serviceId}`}
                                >
                                    {service.serviceName}
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="hidden lg:flex flex-1 justify-end animate-float">
                        <div className="relative w-[450px] aspect-square rounded-3xl overflow-hidden shadow-2xl border-8 border-white/10">
                            <img
                                src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2069&auto=format&fit=crop"
                                alt="Handyman working"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-white/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined">check_circle</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Yêu cầu hoàn tất!</p>
                                        <p className="text-xs text-gray-600">Thợ đang trên đường tới nhà bạn.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Popular Services Section */}
            <section className="py-24 px-4 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
                        <div className="space-y-4">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Dịch vụ đa dạng</h2>
                            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 font-display">Bạn cần giúp đỡ việc gì?</h3>
                        </div>
                        <Link to="/handymen" className="group flex items-center gap-2 text-primary font-bold hover:text-primary-700 transition-all pb-2 border-b-2 border-primary/20 hover:border-primary">
                            Khám phá tất cả <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-48 rounded-3xl bg-gray-100 animate-pulse" />
                            ))
                        ) : (
                            popularServices.map((service, index) => (
                                <Link
                                    key={service.serviceId}
                                    to={`/handymen?serviceId=${service.serviceId}`}
                                    className="group relative flex flex-col items-center justify-center p-8 rounded-3xl bg-gray-50 border border-gray-100 shadow-sm hover:shadow-premium-hover hover:-translate-y-2 transition-all duration-500"
                                >
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 bg-white text-primary group-hover:bg-primary group-hover:text-white shadow-sm`}>
                                        <span className="material-symbols-outlined text-3xl">
                                            {SERVICE_ICONS[index % SERVICE_ICONS.length]}
                                        </span>
                                    </div>
                                    <span className="font-bold text-gray-900 text-center group-hover:text-primary transition-colors">
                                        {service.serviceName}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* Featured Workers Section */}
            <section className="py-24 px-4 bg-gray-50/50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 font-display">Đội ngũ thợ xuất sắc nhất</h3>
                            <p className="text-gray-500 max-w-xl">Những chuyên gia được đánh giá cao nhất bởi cộng đồng khách hàng tại HandyHub.</p>
                        </div>
                        <Link to="/handymen" className="px-8 py-3 rounded-xl bg-white border-2 border-primary text-primary font-bold hover:bg-primary hover:text-white transition-all duration-300 shadow-sm">
                            Xem tất cả thợ
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {loading ? (
                            Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="h-80 rounded-3xl bg-gray-100 animate-pulse" />
                            ))
                        ) : (
                            topWorkers.map((worker) => (
                                <div key={worker.workerId} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-premium hover:shadow-premium-hover transition-all duration-500 flex flex-col border border-gray-100">
                                    <div className="relative h-64 overflow-hidden bg-gray-100">
                                        <img
                                            src={`https://i.pravatar.cc/300?u=${worker.workerId}`}
                                            alt={worker.firstName}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-white/90 text-xs font-bold flex items-center gap-1 shadow-sm text-gray-900">
                                            <span className="material-symbols-outlined text-[14px] text-yellow-500 fill">star</span>
                                            {(worker.rating || 0).toFixed(1)}
                                        </div>
                                    </div>
                                    <div className="p-8 space-y-4 flex-1 flex flex-col">
                                        <div className="flex-1">
                                            <h4 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">
                                                {worker.firstName} {worker.lastName}
                                            </h4>
                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                <span className="material-symbols-outlined text-sm">location_on</span>
                                                {worker.address?.city || "Việt Nam"}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-green-50 text-green-600">
                                                {worker.isAvailable ? "Available now" : "Currently busy"}
                                            </span>
                                        </div>
                                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                                            <div className="text-lg font-black text-gray-900">{formatVnd(worker.hourlyRate)}<span className="text-xs font-normal text-gray-500">/giờ</span></div>
                                            <Link to={`/handymen`} className="text-primary font-bold text-sm hover:underline">Chi tiết</Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            {/* CTA Section - Fixed with blue-600 to ensure visibility */}
            <section className="px-4 py-24 bg-white">
                <div className="max-w-7xl mx-auto rounded-[3rem] bg-blue-600 overflow-hidden relative shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800" />

                    <div className="relative z-10 px-8 md:px-20 py-20 flex flex-col md:flex-row items-center justify-between gap-12">
                        <div className="flex-1 space-y-6 text-center md:text-left">
                            <h2 className="text-4xl md:text-5xl font-bold text-white font-display leading-tight">
                                Bạn là thợ chuyên nghiệp? <br />
                                <span className="text-blue-200">Gia nhập HandyHub ngay!</span>
                            </h2>
                            <p className="text-blue-50/90 text-lg max-w-xl leading-relaxed">
                                Tăng thu nhập, linh hoạt thời gian và tiếp cận hàng ngàn khách hàng mỗi ngày.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
                                <Link to="/auth/register/worker" className="px-10 py-5 bg-white text-blue-600 font-black rounded-2xl hover:bg-gray-50 hover:scale-105 transition-all shadow-xl shadow-black/10">
                                    Bắt đầu kiếm tiền ngay
                                </Link>
                                <Link to="/auth/register" className="px-10 py-5 bg-blue-800/50 text-white font-bold rounded-2xl hover:bg-blue-800 border border-blue-400/30 transition-all">
                                    Tìm hiểu thêm
                                </Link>
                            </div>
                        </div>

                        <div className="flex-1 hidden md:block">
                            <div className="relative p-8 bg-black/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl rotate-3">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-green-500/30 rounded-2xl border border-green-400/30">
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-green-300">payments</span>
                                            <span className="text-white font-bold">Thu nhập tuần này</span>
                                        </div>
                                        <span className="text-white font-black text-xl">12.500.000đ</span>
                                    </div>
                                    <div className="p-4 bg-white/10 rounded-2xl border border-white/10">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-blue-100 text-sm">Công việc hoàn thành</span>
                                            <span className="text-white font-bold">18</span>
                                        </div>
                                        <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                                            <div className="h-full bg-green-400 w-3/4 shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};


