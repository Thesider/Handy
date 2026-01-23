import { useEffect, useState } from "react";
import { WorkerDashboardShell } from "../components/layout/WorkerDashboardShell";
import { useAuth } from "../hooks/useAuth";
import { getWorkerById, updateWorker } from "../api/handyman.api";
import type { Worker } from "../features/handyman/handyman.types";

const emptyWorker: Worker = {
    workerId: 0,
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
};

export const WorkerProfileSettingsPage = () => {
    const { user } = useAuth();
    const [form, setForm] = useState<Worker>(emptyWorker);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        const workerId = user?.id;
        if (!workerId || user?.role !== "Worker") {
            setError("Không tìm thấy mã thợ cho tài khoản này.");
            return;
        }

        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                const workerData = await getWorkerById(workerId);
                if (!isMounted) return;
                setForm(workerData);
            } catch {
                if (!isMounted) return;
                setError("Không thể tải hồ sơ thợ.");
            } finally {
                if (!isMounted) return;
                setLoading(false);
            }
        };

        loadData();
        return () => {
            isMounted = false;
        };
    }, [user?.id, user?.role]);

    const handleChange = (field: keyof Worker, value: string | number | boolean) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddressChange = (field: keyof Worker["address"], value: string) => {
        setForm((prev) => ({
            ...prev,
            address: {
                ...prev.address,
                [field]: value,
            },
        }));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!form.workerId) return;

        try {
            setSaving(true);
            setMessage(null);
            await updateWorker(form.workerId, form);
            setMessage("Profile updated successfully.");
        } catch {
            setMessage(null);
            setError("Unable to save profile changes.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <WorkerDashboardShell>
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Settings</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Update your contact details and availability.
                    </p>
                </div>
            </header>

            {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    {error}
                </div>
            ) : null}

            <form
                onSubmit={handleSubmit}
                className="grid gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:grid-cols-2"
            >
                {loading ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Loading profile...</p>
                ) : (
                    <>
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            First name
                            <input
                                type="text"
                                value={form.firstName}
                                onChange={(event) => handleChange("firstName", event.target.value)}
                                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            Last name
                            <input
                                type="text"
                                value={form.lastName}
                                onChange={(event) => handleChange("lastName", event.target.value)}
                                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            Email
                            <input
                                type="email"
                                value={form.email}
                                onChange={(event) => handleChange("email", event.target.value)}
                                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            Phone number
                            <input
                                type="tel"
                                value={form.phoneNumber}
                                onChange={(event) => handleChange("phoneNumber", event.target.value)}
                                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            Hourly rate
                            <input
                                type="number"
                                value={form.hourlyRate}
                                onChange={(event) =>
                                    handleChange("hourlyRate", Number(event.target.value))
                                }
                                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            Availability
                            <select
                                value={form.isAvailable ? "true" : "false"}
                                onChange={(event) =>
                                    handleChange("isAvailable", event.target.value === "true")
                                }
                                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            >
                                <option value="true">Online</option>
                                <option value="false">Offline</option>
                            </select>
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 md:col-span-2">
                            Street address
                            <input
                                type="text"
                                value={form.address.street}
                                onChange={(event) => handleAddressChange("street", event.target.value)}
                                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            City
                            <input
                                type="text"
                                value={form.address.city}
                                onChange={(event) => handleAddressChange("city", event.target.value)}
                                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            State
                            <input
                                type="text"
                                value={form.address.state ?? ""}
                                onChange={(event) => handleAddressChange("state", event.target.value)}
                                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            Postal code
                            <input
                                type="text"
                                value={form.address.postalCode}
                                onChange={(event) => handleAddressChange("postalCode", event.target.value)}
                                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </label>
                        <label className="flex flex-col gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                            Country
                            <input
                                type="text"
                                value={form.address.country ?? ""}
                                onChange={(event) => handleAddressChange("country", event.target.value)}
                                className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                            />
                        </label>
                        <div className="flex items-center justify-between gap-3 md:col-span-2">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Changes will update your worker profile.
                            </p>
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {saving ? "Saving..." : "Save changes"}
                            </button>
                        </div>
                        {message ? (
                            <p className="text-sm text-emerald-600 md:col-span-2">{message}</p>
                        ) : null}
                    </>
                )}
            </form>
        </WorkerDashboardShell>
    );
};
