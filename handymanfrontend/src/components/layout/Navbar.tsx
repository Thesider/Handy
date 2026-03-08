import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const isHome = location.pathname === "/";

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isTransparent = isHome && !scrolled;

    const getLinkClass = ({ isActive }: { isActive: boolean }) =>
        [
            "flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all duration-300",
            isActive
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                : isTransparent
                    ? "text-white drop-shadow-md hover:bg-white/20 hover:text-white"
                    : "text-gray-700 hover:text-blue-600 hover:bg-blue-50",
        ].join(" ");

    const navLinks = (() => {
        if (user?.role === "Admin") {
            return [{ label: "Admin Hub", to: "/admin" }];
        }

        if (user?.role === "Worker") {
            return [
                { label: "Dashboard", to: "/profile/worker" },
                { label: "Việc làm", to: "/worker/jobs" },
                { label: "Thu nhập", to: "/worker/earnings" },
            ];
        }

        if (user?.role === "Customer") {
            return [
                { label: "Tìm thợ", to: "/handymen" },
                { label: "Lịch hẹn", to: "/bookings" },
                { label: "Hồ sơ", to: "/profile" },
            ];
        }

        return [
            { label: "Dịch vụ", to: "/handymen" },
            { label: "Trở thành thợ", to: "/auth/register/worker" },
        ];
    })();

    return (
        <header
            className={`sticky top-0 z-[100] transition-all duration-500 px-6 md:px-12 py-4 ${scrolled
                ? "bg-white/95 backdrop-blur-md shadow-premium py-3"
                : isHome
                    ? "bg-transparent border-transparent"
                    : "bg-white border-b border-gray-100"
                }`}
        >
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <NavLink to="/" className="flex items-center gap-2.5 no-underline group" aria-label="Go to home">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/30 group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined text-2xl font-bold">handyman</span>
                        </div>
                        <h2 className={`text-xl font-black tracking-tight transition-colors font-display ${isTransparent ? "text-white drop-shadow-md" : "text-gray-900"
                            }`}>
                            Handy<span className="text-blue-500">Hub</span>
                        </h2>
                    </NavLink>
                </div>

                <nav className="hidden lg:flex items-center gap-2">
                    {navLinks.map((link) => (
                        <NavLink key={link.to} to={link.to} className={getLinkClass}>
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex flex-col items-end mr-2">
                                <span className={`text-xs font-bold ${isTransparent ? "text-white drop-shadow-sm" : "text-gray-900"}`}>
                                    {user?.name}
                                </span>
                                <span className="text-[10px] text-blue-500 uppercase font-black tracking-widest">{user?.role}</span>
                            </div>
                            <button
                                onClick={logout}
                                className={`flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${isTransparent
                                    ? "bg-white/10 text-white hover:bg-red-600 hover:text-white backdrop-blur-md"
                                    : "bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-lg">logout</span>
                                <span className="hidden sm:inline">Thoát</span>
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            <NavLink
                                to="/auth/login"
                                className={`px-6 py-2.5 text-sm font-bold transition-colors ${isTransparent ? "text-white drop-shadow-md hover:text-blue-300" : "text-gray-700 hover:text-blue-600"
                                    }`}
                            >
                                Đăng nhập
                            </NavLink>
                            <NavLink
                                to="/auth/register"
                                className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 shadow-lg shadow-blue-600/30 active:scale-95"
                            >
                                Đăng ký
                            </NavLink>
                        </div>
                    )}
                </div>
            </div>
        </header>

    );
};


