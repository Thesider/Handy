import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const navItems = [
    { label: "Overview", to: "/admin/dashboard", icon: "dashboard" },
    { label: "Workers", to: "/admin/workers", icon: "engineering" },
    { label: "Services", to: "/admin/services", icon: "handyman" },
    { label: "Customers", to: "/admin/customers", icon: "group" },
];

export const AdminSidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const displayName = user?.name ?? "Admin";

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-slate-200 bg-white transition-transform sm:translate-x-0" aria-label="Sidebar">
            <div className="flex h-full flex-col justify-between px-3 py-4">
                <div className="space-y-2 font-medium">
                    <div className="mb-6 flex items-center gap-3 px-2">
                        <div className="flex size-10 items-center justify-center rounded-full bg-primary text-white">
                            <span className="material-symbols-outlined">admin_panel_settings</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">Admin Panel</span>
                            <span className="text-xs text-slate-500">{displayName}</span>
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
                                                : "text-slate-700 hover:bg-slate-100 hover:text-primary"
                                            }`}
                                    >
                                        <span className={`material-symbols-outlined transition duration-75 ${isActive ? "text-primary" : "text-slate-500 group-hover:text-primary"
                                            }`}>
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
                        className="group flex w-full items-center rounded-lg p-2 text-sm font-medium text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
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
