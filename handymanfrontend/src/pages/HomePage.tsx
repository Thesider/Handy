import { type FormEvent, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getServices, getWorkers } from "../api/handyman.api";
import type { Service, Worker } from "../features/handyman/handyman.types";

export const HomePage = () => {
    const navigate = useNavigate();
    const [services, setServices] = useState<Service[]>([]);
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [howItWorksTab, setHowItWorksTab] = useState<"customer" | "worker">(
        "customer"
    );

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
        () => [...workers].sort((a, b) => b.rating - a.rating).slice(0, 4),
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

    const howItWorksSteps = useMemo(
        () =>
            howItWorksTab === "customer"
                ? [
                    {
                        title: "1. Đăng yêu cầu",
                        icon: "post_add",
                        text: "Mô tả công việc, thời gian và khu vực bạn cần hỗ trợ.",
                    },
                    {
                        title: "2. Chọn thợ phù hợp",
                        icon: "person_search",
                        text: "So sánh báo giá, đánh giá và chọn thợ tốt nhất.",
                    },
                    {
                        title: "3. Hoàn thành & thanh toán",
                        icon: "check_circle",
                        text: "Thợ đến đúng hẹn, hoàn thành việc và thanh toán an toàn.",
                    },
                ]
                : [
                    {
                        title: "1. Tạo hồ sơ",
                        icon: "account_circle",
                        text: "Hoàn thiện hồ sơ, kỹ năng và khu vực nhận việc của bạn.",
                    },
                    {
                        title: "2. Nhận yêu cầu",
                        icon: "notifications_active",
                        text: "Xem yêu cầu phù hợp và gửi báo giá nhanh chóng.",
                    },
                    {
                        title: "3. Làm việc & tăng thu nhập",
                        icon: "paid",
                        text: "Hoàn thành dịch vụ, nhận đánh giá tốt và tăng thu nhập.",
                    },
                ],
        [howItWorksTab]
    );

    return (
        <main className="flex flex-col">
            <section className="relative flex min-h-[560px] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center">
                <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuDCa3J4Q1ygwQRh_rIha5utDmRY2XvkSyVglWEqgQ4QQwDObhZtEY4nnkFHtT0EwbwDPRM0QINciiZQPhddMnHLS40FbDkj3S8cS_qrlXkjqdURQR158G7-P4Xvd45y7tcXmbUbwnObkbqN6spbirWsTWcOJB1wESkgzWuuyMaiYHRbnL1stREJjZ8TU6ghJrMw4VDS4rHDYrAZk0yN_GVF5zczaLtIzdFBDliTK87lW-SyxhjHLC0_TCuhzJjtVFC61c6C0iG4UhK9')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-black/60" />
                <div className="relative flex w-full max-w-[800px] flex-col gap-6">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] text-white md:text-5xl lg:text-6xl">
                            Tìm thợ phù hợp cho mọi việc
                        </h1>
                        <p className="text-base font-normal leading-normal text-gray-200 md:text-lg">
                            Từ sửa chữa nhỏ đến cải tạo lớn, kết nối với chuyên gia uy tín gần bạn
                            chỉ trong vài phút.
                        </p>
                    </div>
                    <form
                        className="mx-auto w-full max-w-[640px] rounded-2xl bg-white p-2 shadow-xl"
                        onSubmit={handleSearchSubmit}
                    >
                        <div className="flex items-center">
                            <div className="flex h-12 w-12 items-center justify-center text-[#617589]">
                                <span className="material-symbols-outlined text-2xl">search</span>
                            </div>
                            <input
                                className="flex h-12 w-full min-w-0 flex-1 border-none bg-transparent px-2 text-base font-normal leading-normal text-[#111418] placeholder:text-[#617589] focus:outline-none focus:ring-0"
                                placeholder="Bạn đang cần hỗ trợ việc gì? (VD: Sửa ống nước)"
                                aria-label="Tìm kiếm dịch vụ"
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                            />
                            <button
                                type="submit"
                                className="flex h-12 min-w-[110px] items-center justify-center rounded-xl bg-primary px-6 text-base font-bold text-white transition-colors hover:bg-blue-600"
                            >
                                Tìm thợ
                            </button>
                        </div>
                    </form>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm font-medium text-white/90">
                        <span className="text-white/70">Dịch vụ phổ biến:</span>
                        {popularServices.length === 0 ? (
                            <span className="text-white/70">Đang cập nhật...</span>
                        ) : (
                            popularServices.map((service) => (
                                <Link
                                    key={service.serviceId}
                                    className="rounded-full border border-white/40 px-3 py-1 transition hover:border-white hover:bg-white/10"
                                    to={`/handymen?serviceId=${service.serviceId}`}
                                >
                                    {service.serviceName}
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <section className="bg-white px-4 py-16 md:px-10 lg:px-40">
                <div className="mx-auto max-w-[1200px]">
                    <h2 className="mb-8 px-4 text-center text-2xl font-bold leading-tight tracking-[-0.015em] text-[#111418] md:text-3xl">
                        Dịch vụ phổ biến
                    </h2>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                        {loading ? (
                            <div className="col-span-full text-center text-sm text-[#617589]">
                                Đang tải dịch vụ...
                            </div>
                        ) : popularServices.length === 0 ? (
                            <div className="col-span-full text-center text-sm text-[#617589]">
                                Chưa có dịch vụ nào.
                            </div>
                        ) : (
                            popularServices.map((service) => (
                                <Link
                                    key={service.serviceId}
                                    to="/handymen"
                                    className="group flex flex-col items-center gap-3 rounded-xl bg-background-light p-6 text-center transition-all hover:-translate-y-1 hover:bg-primary/5 hover:shadow-md"
                                >
                                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-primary group-hover:bg-primary group-hover:text-white">
                                        <span className="material-symbols-outlined text-3xl">
                                            build
                                        </span>
                                    </div>
                                    <span className="font-medium text-[#111418]">
                                        {service.serviceName}
                                    </span>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <section className="bg-background-light px-4 py-16 md:px-10 lg:px-40">
                <div className="mx-auto max-w-[1200px]">
                    <div className="mb-12 text-center">
                        <h2 className="mb-4 text-3xl font-bold text-[#111418]">Cách hoạt động</h2>
                        <div className="inline-flex rounded-lg bg-gray-200 p-1">
                            <button
                                type="button"
                                onClick={() => setHowItWorksTab("customer")}
                                aria-pressed={howItWorksTab === "customer"}
                                className={`rounded-md px-6 py-2 text-sm font-bold shadow-sm transition-colors ${howItWorksTab === "customer"
                                    ? "bg-white text-[#111418]"
                                    : "text-gray-500 hover:text-[#111418]"
                                    }`}
                            >
                                Khách hàng
                            </button>
                            <button
                                type="button"
                                onClick={() => setHowItWorksTab("worker")}
                                aria-pressed={howItWorksTab === "worker"}
                                className={`rounded-md px-6 py-2 text-sm font-bold shadow-sm transition-colors ${howItWorksTab === "worker"
                                    ? "bg-white text-[#111418]"
                                    : "text-gray-500 hover:text-[#111418]"
                                    }`}
                            >
                                Thợ chuyên nghiệp
                            </button>
                        </div>
                    </div>
                    <div className="grid gap-8 md:grid-cols-3">
                        {howItWorksSteps.map((step) => (
                            <div key={step.title} className="flex flex-col items-center text-center">
                                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md">
                                    <span className="material-symbols-outlined text-5xl text-primary">
                                        {step.icon}
                                    </span>
                                </div>
                                <h3 className="mb-2 text-xl font-bold text-[#111418]">
                                    {step.title}
                                </h3>
                                <p className="max-w-xs text-sm text-[#617589]">{step.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-white px-4 py-16 md:px-10 lg:px-40">
                <div className="mx-auto max-w-[1200px]">
                    <div className="mb-8 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-[#111418]">
                            Thợ được đánh giá cao
                        </h2>
                        <Link className="text-sm font-medium text-primary hover:underline" to="/handymen">
                            Xem tất cả
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                        {loading ? (
                            <div className="col-span-full text-center text-sm text-[#617589]">
                                Đang tải thợ nổi bật...
                            </div>
                        ) : topWorkers.length === 0 ? (
                            <div className="col-span-full text-center text-sm text-[#617589]">
                                Chưa có thợ nổi bật.
                            </div>
                        ) : (
                            topWorkers.map((pro) => (
                                <div
                                    key={pro.workerId}
                                    className="group overflow-hidden rounded-xl border border-[#f0f2f4] bg-white transition-shadow hover:shadow-lg"
                                >
                                    <div className="flex h-48 w-full items-center justify-center bg-blue-50 text-primary">
                                        <span className="material-symbols-outlined text-5xl">handyman</span>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold text-[#111418]">
                                                    {pro.firstName} {pro.lastName}
                                                </h3>
                                                <p className="text-xs font-medium text-primary">
                                                    {pro.address.city}, {pro.address.state || "Việt Nam"}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1 rounded bg-yellow-100 px-1.5 py-0.5 text-xs font-bold text-yellow-800">
                                                <span className="material-symbols-outlined text-[14px]">star</span>
                                                {pro.rating}
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center justify-between border-t border-dashed border-[#f0f2f4] pt-3">
                                            <span className="text-sm font-semibold text-[#111418]">
                                                {formatVnd(pro.hourlyRate)}/giờ
                                            </span>
                                            <Link
                                                to="/handymen"
                                                className="rounded bg-blue-100 px-3 py-1.5 text-xs font-bold text-primary transition-colors hover:bg-primary hover:text-white"
                                            >
                                                Xem hồ sơ
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden bg-primary px-4 py-20 text-white md:px-10 lg:px-40">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(30,58,138,0.85), rgba(30,58,138,0.85)), url('https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=2940&auto=format&fit=crop')",
                    }}
                />
                <div className="relative mx-auto flex max-w-[1200px] flex-col items-center justify-between gap-10 md:flex-row">
                    <div className="flex flex-1 flex-col gap-6 text-center md:text-left">
                        <div className="flex items-center justify-center gap-2 rounded-full bg-white/20 px-4 py-1 text-sm font-medium backdrop-blur-sm md:w-fit md:justify-start">
                            <span className="material-symbols-outlined text-sm">verified</span>
                            Verified Professionals Only
                        </div>
                        <h2 className="text-3xl font-bold leading-tight md:text-4xl">
                            Bạn là thợ chuyên nghiệp?
                            <br className="hidden md:block" />
                            Tăng thu nhập cùng HandyHub.
                        </h2>
                        <p className="text-lg text-blue-100">
                            Tham gia cộng đồng thợ uy tín để nhận thêm khách hàng mỗi ngày.
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row sm:jusxstify-center md:justify-start">
                            <Link
                                to="/auth/register/worker"
                                className="rounded-lg bg-white px-8 py-3 text-base font-bold text-black shadow-lg transition-transform hover:scale-105"
                            >
                                Trở thành thợ
                            </Link>
                            <Link
                                to="/auth/register"
                                className="rounded-lg border border-white/30 bg-white/10 px-8 py-3 text-base font-bold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                            >
                                Tìm hiểu thêm
                            </Link>
                        </div>
                    </div>
                    <div className="hidden flex-1 justify-end md:flex">
                        <div className="relative h-[300px] w-[400px]">
                            <div className="absolute right-0 top-0 h-full w-full rounded-2xl bg-white p-4 shadow-2xl">
                                <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-4">
                                    <img
                                        className="h-12 w-12 rounded-full object-cover"
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlGnJ-X5A_1bxkhAB8QJ6EAqxbzoXj6ICpR4VC6z8g8H7bEOkJ0PAjsLtX-JaGDi4-x5UyK6jwB_nU5f0_SxHEJb3OmetX2xGmhTCHzmMWdaFMjF9qjGnj_ek9klziBhDUdGtxFp-H2zxig7lk2hddn03f7Umah3N1_Y-defWx6Zlx4aE921yRvRWFyw5QeXUDb1wm-c15l_QS3x2vKi8fX1n01KJuYrgG0Ivfb_-_6O1VkDwxyjiok8PjUbCIHw5t00owBO_iSJdm"
                                        alt="Handyman avatar"
                                    />
                                    <div>
                                        <div className="h-4 w-32 rounded bg-gray-100" />
                                        <div className="mt-2 h-3 w-20 rounded bg-gray-100" />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div className="h-20 w-full rounded-lg bg-blue-50 p-3">
                                        <div className="mb-2 h-4 w-3/4 rounded bg-blue-100" />
                                        <div className="h-3 w-1/2 rounded bg-blue-100" />
                                    </div>
                                    <div className="h-20 w-full rounded-lg bg-gray-50 p-3">
                                        <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                                        <div className="h-3 w-1/2 rounded bg-gray-200" />
                                    </div>
                                </div>
                                <div className="absolute -left-12 bottom-8 rounded-lg bg-white p-3 shadow-lg">
                                    <div className="flex items-center gap-2 text-sm font-bold text-[#111418]">
                                        <span className="material-symbols-outlined text-green-500">
                                            monetization_on
                                        </span>
                                        <span>Kiếm được 30.000.000đ</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-background-light px-4 py-16 md:px-10 lg:px-40">
                <div className="mx-auto max-w-[1200px]">
                    <h2 className="mb-12 text-center text-2xl font-bold text-[#111418] md:text-3xl">
                        Khách hàng nói gì
                    </h2>
                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            {
                                name: "Chị Hương",
                                role: "Chủ nhà",
                                text: "Tìm thợ ống nước chỉ mất 10 phút. Thợ đến đúng hẹn và sửa rất gọn gàng.",
                                avatar:
                                    "https://lh3.googleusercontent.com/aida-public/AB6AXuCbFyNTDHN1uIZKWX5KdYxuFlCGch0qkVqiTvgMob1vg-XMlFjGrbWO0jYgu4NOb2Q51MX0OLNJIQ-tr0TODtVy4TlOryO8olL7a07CaMkeaFOjnC64OAiPUW739uDKBg6SJlvFpTBpRYCFzEBYl8woe_OYet4vYqNdj4h98LhBVZFUGUQmSQ_raCQ2Kpx-0GFmUy0jAaEc0xOvJXUWg9jpipFgIsKtX-R-kHL_XmXHPiTY8jDsgFL4gr0R6KfVwe3rbbqMWolJaztV",
                            },
                            {
                                name: "Anh Nam",
                                role: "Chủ cửa hàng",
                                text: "Thợ điện làm việc chuyên nghiệp, tư vấn rõ ràng và sạch sẽ sau khi xong.",
                                avatar:
                                    "https://lh3.googleusercontent.com/aida-public/AB6AXuB6XKiGrYfx-vzfr4y2xH2SZMzOD0PanMn2smNraKipZddiW9dwS9iaOXP6JE6wV49_lontoB8rSysfRrUn-295rKB2u1jmf8TqZk7JleEkbUywneikKMnKj8cEoGOPD1Z8I_uFnDF0T0BfcC3P-pzBSM66JEwXGzS0U6i9iRP5JDL56SnhXkV4h0yjN7cCc5ftSCkLVRiMMISNBvxAY4h-SqiH7AQmkphJWpB2MyPhCNebCqFOwgQVGr3MVzG8W0i10dxwZOt-7Uc9",
                            },
                            {
                                name: "Cô Linh",
                                role: "Chủ nhà",
                                text: "Thuê thợ sơn rất dễ, giá minh bạch và đặt lịch nhanh chóng.",
                                avatar:
                                    "https://lh3.googleusercontent.com/aida-public/AB6AXuBjroHpmBRccf_LjpD2QApKyokt7sjJPPyyDPx8DEN6gHmyn4sOiFYPJ7kUbyWQf0Cb0vVNVQRcFhHmrB_7wDSQ_kXkN71Nont_a8e5SRKxmpRf_1pbIjlxH3oTkcFZAiiOy0TXO0qjyLhWT6mu_DaAhbMuf5T_onZ3ctIQWxXxEl-dOxaSYMuYpTGrU_XqP1CtWCLV7oD_MvMCtkHAu5ukJYjVT1GcBz48qoWg2_775XHLHEvH8EOdQzS_ZBgxIhaWIdOv2BUHbPdn",
                            },
                        ].map((review) => (
                            <div key={review.name} className="flex flex-col rounded-xl bg-white p-6 shadow-sm">
                                <div className="mb-4 flex gap-1 text-yellow-400">
                                    {Array.from({ length: 5 }).map((_, index) => (
                                        <span key={index} className="material-symbols-outlined text-xl">
                                            star
                                        </span>
                                    ))}
                                </div>
                                <p className="mb-6 flex-1 text-sm leading-relaxed text-[#617589]">
                                    “{review.text}”
                                </p>
                                <div className="flex items-center gap-3">
                                    <img
                                        className="h-10 w-10 rounded-full object-cover"
                                        src={review.avatar}
                                        alt={`${review.name} avatar`}
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-[#111418]">
                                            {review.name}
                                        </p>
                                        <p className="text-xs text-[#617589]">{review.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
};
