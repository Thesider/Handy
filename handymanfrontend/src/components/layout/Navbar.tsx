import { NavLink } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const Navbar = () => {
    const { isAuthenticated, logout, user } = useAuth();
    const getLinkClass = ({ isActive }: { isActive: boolean }) =>
        [
            "text-sm font-medium leading-normal text-[#111418] hover:text-primary",
            isActive ? "text-primary" : "",
        ].join(" ");

    const navLinks = (() => {
        if (user?.role === "Admin") {
            return [{ label: "Admin", to: "/admin" }];
        }

        if (user?.role === "Worker") {
            return [
                { label: "Dashboard", to: "/profile/worker" },
                { label: "Jobs", to: "/worker/jobs" },
                { label: "Earnings", to: "/worker/earnings" },
                { label: "Reviews", to: "/worker/reviews" },
                { label: "Settings", to: "/worker/settings" },
            ];
        }

        if (user?.role === "Customer") {
            return [
                { label: "Find Tasks", to: "/handymen" },
                { label: "Bookings", to: "/bookings" },
                { label: "Profile", to: "/profile" },
            ];
        }

        return [
            { label: "Find Tasks", to: "/handymen" },
            { label: "Become a worker", to: "/auth/register/worker" },
            { label: "Log In", to: "/auth/login" },
        ];
    })();

    return (
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#f0f2f4] bg-white px-10 py-3">
            <div className="flex items-center gap-4">
                <NavLink to="/" className="flex items-center gap-2 no-underline" aria-label="Go to home">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <span className="material-symbols-outlined text-2xl">handyman</span>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-[#111418]">
                        HandyHub
                    </h2>
                </NavLink>
            </div>
            <div className="flex flex-1 justify-end gap-8">
                <div className="hidden items-center gap-9 md:flex">
                    {navLinks.map((link) => (
                        <NavLink key={link.to} to={link.to} className={getLinkClass}>
                            {link.label}
                        </NavLink>
                    ))}
                </div>
                {isAuthenticated ? (
                    <button
                        onClick={logout}
                        className="flex min-w-[84px] items-center justify-center rounded-lg border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-bold text-[#111418] transition-colors hover:bg-[#f3f4f6]"
                    >
                        Sign Out
                    </button>
                ) : (
                    <NavLink
                        to="/auth/register"
                        className="flex min-w-[84px] items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-blue-600"
                    >
                        Sign Up
                    </NavLink>
                )}
            </div>
        </header>
    );
};
