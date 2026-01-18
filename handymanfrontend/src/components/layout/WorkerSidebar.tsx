import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import styles from "./WorkerSidebar.module.css";

const navItems = [
    { label: "Dashboard", to: "/profile/worker", icon: "dashboard" },
    { label: "Jobs", to: "/worker/jobs", icon: "work" },
    { label: "Earnings", to: "/worker/earnings", icon: "attach_money" },
    { label: "Profile Settings", to: "/worker/settings", icon: "person" },
    { label: "Reviews", to: "/worker/reviews", icon: "star" },
];

export const WorkerSidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const displayName = user?.name ?? "HandyHelper";

    return (
        <aside className="flex w-64 flex-col border-r border-slate-200 bg-white transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex h-full flex-col justify-between p-4">
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3 px-2 py-2">
                        <div
                            className={`aspect-square size-10 rounded-full border border-slate-200 bg-cover bg-center dark:border-slate-700 ${styles.profileAvatar}`}
                            aria-hidden="true"
                        />
                        <div className="flex flex-col">
                            <h1 className="text-base font-bold leading-normal text-slate-900 dark:text-white">
                                HandyHelper
                            </h1>
                            <p className="text-xs font-medium leading-normal text-slate-500 dark:text-slate-400">
                                {displayName} • Pro
                            </p>
                        </div>
                    </div>

                    <nav className="flex flex-col gap-2">
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.to;
                            return (
                                <Link
                                    key={item.to}
                                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                                        }`}
                                    to={item.to}
                                >
                                    <span className="material-symbols-outlined text-[24px]">
                                        {item.icon}
                                    </span>
                                    <span className="text-sm font-medium leading-normal">
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="flex flex-col gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                    <button
                        className="flex w-full items-center gap-3 px-3 py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                        onClick={logout}
                        type="button"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <span className="text-sm font-medium">Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
};
