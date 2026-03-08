import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import {
    createAdminWorker,
    deleteAdminWorker,
    getAdminWorkers,
    getModerationUsers,
    updateWorkerModeration,
    updateAdminWorker,
} from "../api/admin.api";
import type { Worker } from "../features/handyman/handyman.types";
import { AdminDashboardShell } from "../components/layout/AdminDashboardShell";
import { getWorkerMetrics } from "../api/workers.api";
import type { WorkerAcceptanceMetrics } from "../features/handyman/handyman.types";
import { METRICS_THRESHOLDS } from "../utils/constants";
import type {
    AdminUserModerationUpdatePayload,
    ModerationUser,
    ModerationVerificationStatus,
} from "../features/admin/admin.types";
import { computeRisk } from "../features/admin/adminAnalytics";
import { useToast } from "../context/ToastContext";

const VERIFICATION_STATUSES: ModerationVerificationStatus[] = [
    "Unverified",
    "Pending",
    "Verified",
    "Rejected",
];

export const AdminWorkersPage = () => {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [editingWorkerId, setEditingWorkerId] = useState<number | null>(null);
    const [metricsByWorker, setMetricsByWorker] = useState<Record<number, WorkerAcceptanceMetrics>>({});
    const [moderationByWorker, setModerationByWorker] = useState<Record<number, ModerationUser>>({});
    const [moderationPendingId, setModerationPendingId] = useState<number | null>(null);
    const { showToast } = useToast();

    const [workerForm, setWorkerForm] = useState<Omit<Worker, "workerId">>({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        hourlyRate: 0,
        rating: 0,
        isAvailable: false,
        address: {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
        },
        workerProfileId: null,
    });

    const loadWorkers = async () => {
        try {
            const [data, moderationUsers] = await Promise.all([
                getAdminWorkers(),
                getModerationUsers(),
            ]);
            setWorkers(data);

            const moderationMap: Record<number, ModerationUser> = {};
            moderationUsers.workers.forEach((worker) => {
                moderationMap[worker.id] = worker;
            });
            setModerationByWorker(moderationMap);
        } catch {
            setError("Unable to load workers.");
        }
    };

    useEffect(() => {
        loadWorkers();
    }, []);

    useEffect(() => {
        const loadMetrics = async () => {
            const entries = await Promise.all(
                workers.map(async (worker) => {
                    try {
                        const metrics = await getWorkerMetrics(worker.workerId);
                        return [worker.workerId, metrics] as const;
                    } catch {
                        return null;
                    }
                })
            );

            setMetricsByWorker((prev) => {
                const next = { ...prev };
                entries.forEach((entry) => {
                    if (entry) {
                        next[entry[0]] = entry[1];
                    }
                });
                return next;
            });
        };

        if (workers.length > 0) {
            void loadMetrics();
        }
    }, [workers]);

    const resetForm = () => {
        setEditingWorkerId(null);
        setWorkerForm({
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            hourlyRate: 0,
            rating: 0,
            isAvailable: false,
            address: {
                street: "",
                city: "",
                state: "",
                postalCode: "",
                country: "",
            },
            workerProfileId: null,
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            if (editingWorkerId) {
                await updateAdminWorker(editingWorkerId, workerForm);
            } else {
                await createAdminWorker(workerForm);
            }
            resetForm();
            await loadWorkers();
            showToast("Worker profile saved.", "success");
        } catch {
            setError("Failed to save worker.");
            showToast("Failed to save worker profile.", "error");
        }
    };

    const handleDeleteWorker = async (workerId: number) => {
        try {
            await deleteAdminWorker(workerId);
            await loadWorkers();
            showToast("Worker deleted.", "success");
        } catch {
            showToast("Failed to delete worker.", "error");
        }
    };

    const handleModerationUpdate = async (
        workerId: number,
        updater: (current: ModerationUser) => AdminUserModerationUpdatePayload
    ) => {
        const current = moderationByWorker[workerId];
        if (!current) {
            return;
        }

        const nextPayload = updater(current);
        const isSensitiveAction =
            current.isBlocked !== nextPayload.isBlocked ||
            current.isApprovedByAdmin !== nextPayload.isApprovedByAdmin;

        if (isSensitiveAction) {
            const confirmed = window.confirm("Confirm moderation update for this worker?");
            if (!confirmed) {
                return;
            }
        }

        setModerationPendingId(workerId);
        try {
            await updateWorkerModeration(workerId, nextPayload);
            await loadWorkers();
            showToast("Worker moderation updated.", "success");
        } catch {
            showToast("Failed to update worker moderation.", "error");
        } finally {
            setModerationPendingId(null);
        }
    };

    const getRiskPillClass = (riskLevel: "Low" | "Medium" | "High") => {
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
                <header className="flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900">Workers Management</h1>
                        <p className="text-slate-500 mt-1">Add, edit, or remove professional service provider profiles.</p>
                    </div>
                    <Button variant="ghost" onClick={resetForm}>Clear Form</Button>
                </header>

                {error && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                        {error}
                    </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                    <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <Input
                                label="First name"
                                value={workerForm.firstName}
                                onChange={(event) => setWorkerForm({ ...workerForm, firstName: event.target.value })}
                            />
                            <Input
                                label="Last name"
                                value={workerForm.lastName}
                                onChange={(event) => setWorkerForm({ ...workerForm, lastName: event.target.value })}
                            />
                            <Input
                                label="Email"
                                type="email"
                                value={workerForm.email}
                                onChange={(event) => setWorkerForm({ ...workerForm, email: event.target.value })}
                            />
                            <Input
                                label="Phone"
                                value={workerForm.phoneNumber}
                                onChange={(event) => setWorkerForm({ ...workerForm, phoneNumber: event.target.value })}
                            />

                            <Input
                                label="Hourly Rate (VND)"
                                type="number"
                                value={workerForm.hourlyRate}
                                onChange={(event) => setWorkerForm({ ...workerForm, hourlyRate: Number(event.target.value) })}
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            <label className="flex items-center gap-3 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    className="size-5 rounded border-slate-300 text-primary focus:ring-primary/20"
                                    checked={workerForm.isAvailable}
                                    onChange={(event) => setWorkerForm({ ...workerForm, isAvailable: event.target.checked })}
                                />
                                <span className="text-sm font-bold text-slate-700">Mark as Available</span>
                            </label>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit">
                                {editingWorkerId ? "Update Worker Profile" : "Create New Worker"}
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Worker</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Contact</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Metrics</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Moderation</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workers.map((worker) => (
                                <tr key={worker.workerId} className="border-b border-slate-100 last:border-none align-top hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{worker.firstName} {worker.lastName}</span>
                                            <span className="text-xs text-slate-500">ID: {worker.workerId}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm text-slate-700">{worker.email}</span>
                                            <span className="text-xs text-slate-500">{worker.phoneNumber}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${worker.isAvailable ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-600"}`}>
                                            {worker.isAvailable ? "Online" : "Offline"}
                                        </span>
                                        {moderationByWorker[worker.workerId] ? (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {moderationByWorker[worker.workerId].isBlocked ? (
                                                    <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">Blocked</span>
                                                ) : null}
                                                {moderationByWorker[worker.workerId].isApprovedByAdmin ? (
                                                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Approved</span>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Awaiting Approval</span>
                                                )}
                                            </div>
                                        ) : null}
                                    </td>
                                    <td className="px-6 py-4">
                                        {metricsByWorker[worker.workerId] ? (
                                            <div className="space-y-2 text-xs text-slate-600">
                                                <div className={metricsByWorker[worker.workerId].responseAcceptanceRatePercent >= METRICS_THRESHOLDS.responseAcceptanceRateGood ? "text-emerald-600" : "text-rose-600"}>
                                                    Response Accept: {metricsByWorker[worker.workerId].responseAcceptanceRatePercent.toFixed(1)}%
                                                </div>
                                                <div className={metricsByWorker[worker.workerId].averageResponseTimeMinutes <= METRICS_THRESHOLDS.avgResponseMinutesGood ? "text-emerald-600" : "text-rose-600"}>
                                                    Avg Time: {metricsByWorker[worker.workerId].averageResponseTimeMinutes.toFixed(1)}m
                                                </div>
                                                <div className="h-20 min-w-40">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <BarChart
                                                            data={[
                                                                {
                                                                    name: "Resp",
                                                                    value: Number(metricsByWorker[worker.workerId].responseAcceptanceRatePercent.toFixed(1)),
                                                                },
                                                                {
                                                                    name: "Book",
                                                                    value: Number(metricsByWorker[worker.workerId].bookingAcceptanceRatePercent.toFixed(1)),
                                                                },
                                                            ]}
                                                        >
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                                            <XAxis dataKey="name" stroke="#64748b" />
                                                            <YAxis stroke="#64748b" domain={[0, 100]} />
                                                            <Tooltip />
                                                            <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400">Loading...</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {moderationByWorker[worker.workerId] ? (
                                            <div className="flex min-w-44 flex-col gap-2 text-xs">
                                                <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 font-bold ${getRiskPillClass(computeRisk(moderationByWorker[worker.workerId], metricsByWorker[worker.workerId]).riskLevel)}`}>
                                                    {computeRisk(moderationByWorker[worker.workerId], metricsByWorker[worker.workerId]).riskLevel} Risk
                                                </span>
                                                <label className="text-slate-500" htmlFor={`worker-verification-${worker.workerId}`}>
                                                    Verification
                                                </label>
                                                <select
                                                    id={`worker-verification-${worker.workerId}`}
                                                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                                                    value={moderationByWorker[worker.workerId].idVerificationStatus}
                                                    disabled={moderationPendingId === worker.workerId}
                                                    onChange={(event) => {
                                                        const nextStatus = event.target.value as ModerationVerificationStatus;
                                                        void handleModerationUpdate(worker.workerId, (current) => ({
                                                            isBlocked: current.isBlocked,
                                                            isApprovedByAdmin: current.isApprovedByAdmin,
                                                            idVerificationStatus: nextStatus,
                                                        }));
                                                    }}
                                                >
                                                    {VERIFICATION_STATUSES.map((status) => (
                                                        <option key={status} value={status}>
                                                            {status}
                                                        </option>
                                                    ))}
                                                </select>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        disabled={moderationPendingId === worker.workerId}
                                                        onClick={() => {
                                                            void handleModerationUpdate(worker.workerId, (current) => ({
                                                                isBlocked: !current.isBlocked,
                                                                isApprovedByAdmin: current.isApprovedByAdmin,
                                                                idVerificationStatus: current.idVerificationStatus,
                                                            }));
                                                        }}
                                                    >
                                                        {moderationByWorker[worker.workerId].isBlocked ? "Unblock" : "Block"}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        disabled={moderationPendingId === worker.workerId}
                                                        onClick={() => {
                                                            void handleModerationUpdate(worker.workerId, (current) => ({
                                                                isBlocked: current.isBlocked,
                                                                isApprovedByAdmin: !current.isApprovedByAdmin,
                                                                idVerificationStatus: current.idVerificationStatus,
                                                            }));
                                                        }}
                                                    >
                                                        {moderationByWorker[worker.workerId].isApprovedByAdmin ? "Unapprove" : "Approve"}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-400">No moderation data</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    setEditingWorkerId(worker.workerId);
                                                    setWorkerForm({
                                                        firstName: worker.firstName,
                                                        lastName: worker.lastName,
                                                        email: worker.email,
                                                        phoneNumber: worker.phoneNumber,
                                                        hourlyRate: worker.hourlyRate,
                                                        rating: worker.rating,
                                                        isAvailable: worker.isAvailable,
                                                        address: worker.address,
                                                        workerProfileId: worker.workerProfileId ?? null,
                                                    });
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="text-rose-500 hover:bg-rose-50"
                                                onClick={() => {
                                                    void handleDeleteWorker(worker.workerId);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminDashboardShell>
    );
};
