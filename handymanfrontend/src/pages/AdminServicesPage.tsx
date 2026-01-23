import { useEffect, useState } from "react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import {
    createAdminService,
    deleteAdminService,
    getAdminServices,
    updateAdminService,
} from "../api/admin.api";
import type { Service } from "../features/handyman/handyman.types";
import { AdminDashboardShell } from "../components/layout/AdminDashboardShell";

export const AdminServicesPage = () => {
    const [services, setServices] = useState<Service[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);

    const [serviceForm, setServiceForm] = useState<Omit<Service, "serviceId">>({
        serviceName: "",
        serviceFee: 0,
        totalJobs: 0,
    });

    const loadServices = async () => {
        try {
            const data = await getAdminServices();
            setServices(data);
        } catch {
            setError("Unable to load services.");
        } finally {
        }
    };

    useEffect(() => {
        loadServices();
    }, []);

    const resetForm = () => {
        setEditingServiceId(null);
        setServiceForm({
            serviceName: "",
            serviceFee: 0,
            totalJobs: 0,
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            if (editingServiceId) {
                await updateAdminService(editingServiceId, serviceForm);
            } else {
                await createAdminService(serviceForm);
            }
            resetForm();
            loadServices();
        } catch (e) {
            setError("Failed to save service.");
        }
    };

    return (
        <AdminDashboardShell>
            <div className="flex flex-col gap-8">
                <header className="flex items-end justify-between">
                    <div>
                        <h1 className="text-4xl font-black text-slate-900">Services Management</h1>
                        <p className="text-slate-500 mt-1">Manage service categories, base fees, and usage stats.</p>
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
                                label="Service Name"
                                value={serviceForm.serviceName}
                                onChange={(event) => setServiceForm({ ...serviceForm, serviceName: event.target.value })}
                            />
                            <Input
                                label="Service Fee (VND)"
                                type="number"
                                value={serviceForm.serviceFee}
                                onChange={(event) => setServiceForm({ ...serviceForm, serviceFee: Number(event.target.value) })}
                            />
                            <Input
                                label="Total Jobs"
                                type="number"
                                value={serviceForm.totalJobs}
                                onChange={(event) => setServiceForm({ ...serviceForm, totalJobs: Number(event.target.value) })}
                            />
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit">
                                {editingServiceId ? "Update Service" : "Create Service"}
                            </Button>
                        </div>
                    </form>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Service Name</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Base Fee</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Total Jobs</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service) => (
                                <tr key={service.serviceId} className="border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-900">{service.serviceName}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{service.serviceFee.toLocaleString()} VND</td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{service.totalJobs}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    setEditingServiceId(service.serviceId);
                                                    setServiceForm({
                                                        serviceName: service.serviceName,
                                                        serviceFee: service.serviceFee,
                                                        totalJobs: service.totalJobs,
                                                    });
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="text-rose-500 hover:bg-rose-50"
                                                onClick={() => deleteAdminService(service.serviceId).then(loadServices)}
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
