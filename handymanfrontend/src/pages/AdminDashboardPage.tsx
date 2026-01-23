import { useEffect, useState } from "react";
import { getAdminWorkers, getAdminServices, getAdminCustomers } from "../api/admin.api";
import type { Customer } from "../features/admin/admin.types";
import type { Service, Worker } from "../features/handyman/handyman.types";
import { AdminDashboardShell } from "../components/layout/AdminDashboardShell";

export const AdminDashboardPage = () => {
    const [stats, setStats] = useState({ workers: 0, services: 0, customers: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [w, s, c] = await Promise.all([
                    getAdminWorkers(),
                    getAdminServices(),
                    getAdminCustomers(),
                ]);
                setStats({ workers: w.length, services: s.length, customers: c.length });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    return (
        <AdminDashboardShell>
            <div className="flex flex-col gap-8">
                <header>
                    <h1 className="text-4xl font-black text-slate-900">Admin Overview</h1>
                    <p className="text-slate-500 mt-1">Platform performance and statistics at a glance.</p>
                </header>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Workers</p>
                            <span className="material-symbols-outlined text-primary bg-blue-50 p-2 rounded-lg text-[24px]">engineering</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{loading ? "..." : stats.workers}</p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Services Offered</p>
                            <span className="material-symbols-outlined text-primary bg-blue-50 p-2 rounded-lg text-[24px]">handyman</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{loading ? "..." : stats.services}</p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Customers</p>
                            <span className="material-symbols-outlined text-primary bg-blue-50 p-2 rounded-lg text-[24px]">group</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{loading ? "..." : stats.customers}</p>
                    </div>
                </div>

                <section className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold text-slate-900">Recent Activity</h2>
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Type</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Details</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-100 last:border-none">
                                    <td className="px-6 py-4 text-sm font-medium text-slate-900">Approvals</td>
                                    <td className="px-6 py-4 text-sm text-slate-600">No pending worker approvals</td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-bold text-green-700">Clear</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </AdminDashboardShell>
    );
};
