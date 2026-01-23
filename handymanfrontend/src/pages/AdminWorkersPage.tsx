import { useEffect, useState } from "react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import {
    createAdminWorker,
    deleteAdminWorker,
    getAdminWorkers,
    updateAdminWorker,
} from "../api/admin.api";
import type { Worker } from "../features/handyman/handyman.types";
import { AdminDashboardShell } from "../components/layout/AdminDashboardShell";

export const AdminWorkersPage = () => {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [editingWorkerId, setEditingWorkerId] = useState<number | null>(null);

    const [workerForm, setWorkerForm] = useState<Omit<Worker, "workerId">>({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        yearsOfExperience: 0,
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
            const data = await getAdminWorkers();
            setWorkers(data);
        } catch {
            setError("Unable to load workers.");
        } finally {
        }
    };

    useEffect(() => {
        loadWorkers();
    }, []);

    const resetForm = () => {
        setEditingWorkerId(null);
        setWorkerForm({
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            yearsOfExperience: 0,
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
            loadWorkers();
        } catch (e) {
            setError("Failed to save worker.");
        }
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
                                label="Experience (Years)"
                                type="number"
                                value={workerForm.yearsOfExperience}
                                onChange={(event) => setWorkerForm({ ...workerForm, yearsOfExperience: Number(event.target.value) })}
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
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {workers.map((worker) => (
                                <tr key={worker.workerId} className="border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{worker.firstName} {worker.lastName}</span>
                                            <span className="text-xs text-slate-500">{worker.yearsOfExperience} years exp.</span>
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
                                                        yearsOfExperience: worker.yearsOfExperience,
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
                                                onClick={() => deleteAdminWorker(worker.workerId).then(loadWorkers)}
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
