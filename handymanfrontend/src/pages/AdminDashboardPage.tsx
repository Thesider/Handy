import { useEffect, useMemo, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { getModerationUsers } from "../api/admin.api";
import { AdminDashboardShell } from "../components/layout/AdminDashboardShell";
import { getWorkerMetrics } from "../api/workers.api";
import type { WorkerAcceptanceMetrics } from "../features/handyman/handyman.types";
import {
    buildModerationWatchlist,
    computeAdminKpis,
    getModerationDistribution,
    getRiskDistribution,
    getRoleDistribution,
    getVerificationDistribution,
} from "../features/admin/adminAnalytics";

const PIE_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#7c3aed"];
const RISK_COLORS = ["#dc2626", "#f59e0b", "#16a34a"];

export const AdminDashboardPage = () => {
    const [roleDistribution, setRoleDistribution] = useState<Array<{ role: string; count: number }>>([]);
    const [verificationDistribution, setVerificationDistribution] = useState<Array<{ state: string; count: number }>>([]);
    const [moderationDistribution, setModerationDistribution] = useState<Array<{ status: string; count: number }>>([]);
    const [riskDistribution, setRiskDistribution] = useState<Array<{ level: string; count: number }>>([]);
    const [watchlist, setWatchlist] = useState<
        Array<{
            id: number;
            role: "Worker" | "Customer";
            name: string;
            email: string;
            riskLevel: "Low" | "Medium" | "High";
            riskScore: number;
            riskReasons: string[];
        }>
    >([]);
    const [kpis, setKpis] = useState({
        totalUsers: 0,
        totalWorkers: 0,
        totalCustomers: 0,
        blockedUsers: 0,
        approvedUsers: 0,
        pendingVerification: 0,
        verifiedUsers: 0,
        approvalCoveragePercent: 0,
    });
    const [roleModerationSnapshot, setRoleModerationSnapshot] = useState({
        workers: {
            total: 0,
            blocked: 0,
            approved: 0,
            pendingVerification: 0,
            verified: 0,
        },
        customers: {
            total: 0,
            blocked: 0,
            approved: 0,
            pendingVerification: 0,
            verified: 0,
        },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const displayWatchlist = useMemo(
        () => watchlist.filter((item) => item.riskScore > 0).slice(0, 8),
        [watchlist]
    );

    useEffect(() => {
        const loadDashboard = async () => {
            setLoading(true);
            setError(null);
            try {
                const moderationUsers = await getModerationUsers();

                const workerMetrics = await Promise.all(
                    moderationUsers.workers.map(async (worker) => {
                        try {
                            const metrics = await getWorkerMetrics(worker.id);
                            return [worker.id, metrics] as const;
                        } catch {
                            return null;
                        }
                    })
                );

                const workerMetricsById: Record<number, WorkerAcceptanceMetrics> = {};
                workerMetrics.forEach((entry) => {
                    if (entry) {
                        workerMetricsById[entry[0]] = entry[1];
                    }
                });

                const nextKpis = computeAdminKpis(moderationUsers);
                const nextWatchlist = buildModerationWatchlist(moderationUsers, workerMetricsById);

                const workerSnapshot = {
                    total: moderationUsers.workers.length,
                    blocked: moderationUsers.workers.filter((user) => user.isBlocked).length,
                    approved: moderationUsers.workers.filter((user) => user.isApprovedByAdmin).length,
                    pendingVerification: moderationUsers.workers.filter(
                        (user) => user.idVerificationStatus === "Pending"
                    ).length,
                    verified: moderationUsers.workers.filter(
                        (user) => user.idVerificationStatus === "Verified"
                    ).length,
                };

                const customerSnapshot = {
                    total: moderationUsers.customers.length,
                    blocked: moderationUsers.customers.filter((user) => user.isBlocked).length,
                    approved: moderationUsers.customers.filter((user) => user.isApprovedByAdmin).length,
                    pendingVerification: moderationUsers.customers.filter(
                        (user) => user.idVerificationStatus === "Pending"
                    ).length,
                    verified: moderationUsers.customers.filter(
                        (user) => user.idVerificationStatus === "Verified"
                    ).length,
                };

                setKpis(nextKpis);
                setRoleModerationSnapshot({
                    workers: workerSnapshot,
                    customers: customerSnapshot,
                });
                setRoleDistribution(getRoleDistribution(moderationUsers));
                setVerificationDistribution(getVerificationDistribution(moderationUsers));
                setModerationDistribution(getModerationDistribution(moderationUsers));
                setRiskDistribution(getRiskDistribution(nextWatchlist));
                setWatchlist(nextWatchlist);
            } catch {
                setError("Unable to load admin analytics right now.");
            } finally {
                setLoading(false);
            }
        };

        void loadDashboard();
    }, []);

    const getRiskPill = (riskLevel: "Low" | "Medium" | "High") => {
        if (riskLevel === "High") {
            return "bg-rose-50 text-rose-700";
        }
        if (riskLevel === "Medium") {
            return "bg-amber-50 text-amber-700";
        }
        return "bg-emerald-50 text-emerald-700";
    };

    return (
        <AdminDashboardShell>
            <div className="flex flex-col gap-8">
                <header>
                    <h1 className="text-4xl font-black text-slate-900">Admin Overview</h1>
                    <p className="mt-1 text-slate-500">Platform behavior insights, moderation control health, and risk triage.</p>
                </header>

                {error ? (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                        {error}
                    </div>
                ) : null}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
                    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Total Workers</p>
                            <span className="material-symbols-outlined text-primary bg-blue-50 p-2 rounded-lg text-[24px]">engineering</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{loading ? "..." : kpis.totalWorkers}</p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Total Customers</p>
                            <span className="material-symbols-outlined text-primary bg-blue-50 p-2 rounded-lg text-[24px]">group</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{loading ? "..." : kpis.totalCustomers}</p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Blocked Users</p>
                            <span className="material-symbols-outlined rounded-lg bg-rose-50 p-2 text-[24px] text-rose-600">gpp_bad</span>
                        </div>
                        <p className="text-3xl font-black text-rose-600">{loading ? "..." : kpis.blockedUsers}</p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Pending Verifications</p>
                            <span className="material-symbols-outlined rounded-lg bg-amber-50 p-2 text-[24px] text-amber-600">pending_actions</span>
                        </div>
                        <p className="text-3xl font-black text-amber-600">{loading ? "..." : kpis.pendingVerification}</p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold uppercase tracking-wider text-slate-500">Approval Coverage</p>
                            <span className="material-symbols-outlined text-primary bg-blue-50 p-2 rounded-lg text-[24px]">handyman</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">
                            {loading ? "..." : `${kpis.approvalCoveragePercent.toFixed(1)}%`}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <h2 className="text-lg font-bold text-slate-900">Role Distribution</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={roleDistribution}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="role" stroke="#64748b" />
                                    <YAxis stroke="#64748b" allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <h2 className="text-lg font-bold text-slate-900">Verification State</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={verificationDistribution}
                                        dataKey="count"
                                        nameKey="state"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={88}
                                        label
                                    >
                                        {verificationDistribution.map((entry, index) => (
                                            <Cell key={`${entry.state}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Legend />
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <h2 className="text-lg font-bold text-slate-900">Risk Segments</h2>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={riskDistribution} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis type="number" stroke="#64748b" allowDecimals={false} />
                                    <YAxis type="category" dataKey="level" stroke="#64748b" />
                                    <Tooltip />
                                    <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                                        {riskDistribution.map((entry, index) => (
                                            <Cell key={`${entry.level}-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold text-slate-900">Moderation Watchlist</h2>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">User</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Risk</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Primary Reason</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayWatchlist.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-6 text-sm text-slate-500">
                                            {loading ? "Loading watchlist..." : "No at-risk users currently detected."}
                                        </td>
                                    </tr>
                                ) : (
                                    displayWatchlist.map((item) => (
                                        <tr key={`${item.role}-${item.id}`} className="border-b border-slate-100 last:border-none">
                                            <td className="px-6 py-4 text-sm font-medium text-slate-900">
                                                <div className="flex flex-col">
                                                    <span>{item.name}</span>
                                                    <span className="text-xs text-slate-500">{item.email}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-700">{item.role}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${getRiskPill(item.riskLevel)}`}>
                                                    {item.riskLevel} ({item.riskScore})
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                {item.riskReasons[0] ?? "General moderation review"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">Moderation Snapshot</h2>
                    <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <h3 className="text-lg font-bold text-slate-900">Workers</h3>
                            <div className="mt-3 grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-white p-3">
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Total</p>
                                    <p className="text-xl font-black text-slate-900">{roleModerationSnapshot.workers.total}</p>
                                </div>
                                <div className="rounded-lg bg-white p-3">
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Blocked</p>
                                    <p className="text-xl font-black text-rose-600">{roleModerationSnapshot.workers.blocked}</p>
                                </div>
                                <div className="rounded-lg bg-white p-3">
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Approved</p>
                                    <p className="text-xl font-black text-emerald-600">{roleModerationSnapshot.workers.approved}</p>
                                </div>
                                <div className="rounded-lg bg-white p-3">
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pending Verification</p>
                                    <p className="text-xl font-black text-amber-600">{roleModerationSnapshot.workers.pendingVerification}</p>
                                </div>
                                <div className="rounded-lg bg-white p-3 col-span-2">
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Verified</p>
                                    <p className="text-xl font-black text-slate-900">{roleModerationSnapshot.workers.verified}</p>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <h3 className="text-lg font-bold text-slate-900">Customers</h3>
                            <div className="mt-3 grid grid-cols-2 gap-3">
                                <div className="rounded-lg bg-white p-3">
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Total</p>
                                    <p className="text-xl font-black text-slate-900">{roleModerationSnapshot.customers.total}</p>
                                </div>
                                <div className="rounded-lg bg-white p-3">
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Blocked</p>
                                    <p className="text-xl font-black text-rose-600">{roleModerationSnapshot.customers.blocked}</p>
                                </div>
                                <div className="rounded-lg bg-white p-3">
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Approved</p>
                                    <p className="text-xl font-black text-emerald-600">{roleModerationSnapshot.customers.approved}</p>
                                </div>
                                <div className="rounded-lg bg-white p-3">
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Pending Verification</p>
                                    <p className="text-xl font-black text-amber-600">{roleModerationSnapshot.customers.pendingVerification}</p>
                                </div>
                                <div className="rounded-lg bg-white p-3 col-span-2">
                                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Verified</p>
                                    <p className="text-xl font-black text-slate-900">{roleModerationSnapshot.customers.verified}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-900">Moderation Status Mix</h2>
                    <div className="mt-3 h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={moderationDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="status" stroke="#64748b" />
                                <YAxis stroke="#64748b" allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#0f766e" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </section>
            </div>
        </AdminDashboardShell>
    );
};
