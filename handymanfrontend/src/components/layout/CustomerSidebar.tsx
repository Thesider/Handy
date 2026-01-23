import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const navItems = [
    { label: "Dashboard", to: "/profile", icon: "dashboard" },
    { label: "Find Pro", to: "/handymen", icon: "search" },
    { label: "Job Gigs", to: "/customer/gigs", icon: "work_history" },
    { label: "Bookings", to: "/bookings", icon: "calendar_month" },
    { label: "Messages", to: "/messages", icon: "chat_bubble" },
    { label: "Settings", to: "/settings", icon: "settings" },
];

export const CustomerSidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const displayName = user?.name ?? "Customer";

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white transition-transform sm:translate-x-0" aria-label="Sidebar">
            <div className="flex h-full flex-col justify-between px-3 py-4">
                <div className="space-y-2 font-medium">
                    <div className="mb-6 flex items-center gap-3 px-2">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary text-white">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">{displayName}</span>
                            <span className="text-xs text-slate-500">Customer Account</span>
                        </div>
                    </div>
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.to;
                            return (
                                <li key={item.label}>
                                    <Link
                                        to={item.to}
                                        className={`group flex items-center rounded-lg p-2 text-sm font-medium transition-colors ${isActive
                                            ? "bg-blue-50 text-primary"
                                            : "text-slate-700 hover:bg-slate-100"
                                            }`}
                                    >
                                        <span className={`material-symbols-outlined ${isActive ? "text-primary" : "text-slate-500"}`}>
                                            {item.icon}
                                        </span>
                                        <span className="ms-3">{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
                <div className="border-t border-slate-100 pt-4">
                    <button
                        onClick={logout}
                        className="group flex w-full items-center rounded-lg p-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600"
                    >
                        <span className="material-symbols-outlined text-slate-500 group-hover:text-red-600">
                            logout
                        </span>
                        <span className="ms-3">Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};
