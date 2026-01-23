import { useEffect, useMemo, useState } from "react";
import { HttpError } from "../api/httpClient";
import {
    createAdminCustomer,
    createAdminService,
    createAdminWorker,
    deleteAdminCustomer,
    deleteAdminService,
    deleteAdminWorker,
    getAdminCustomerById,
    getAdminCustomers,
    getAdminServiceById,
    getAdminServices,
    getAdminWorkerById,
    getAdminWorkers,
    updateAdminCustomer,
    updateAdminService,
    updateAdminWorker,
} from "../api/admin.api";
import type { Customer } from "../features/admin/admin.types";
import type { Service, Worker } from "../features/handyman/handyman.types";
import { AdminDashboardShell } from "../components/layout/AdminDashboardShell";

export const AdminPage = () => {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("All Roles");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("All Status");

    const [editingWorkerId, setEditingWorkerId] = useState<number | null>(null);
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
    const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);

    const [workerSubmitting, setWorkerSubmitting] = useState(false);
    const [serviceSubmitting, setServiceSubmitting] = useState(false);
    const [customerSubmitting, setCustomerSubmitting] = useState(false);

    const [workerError, setWorkerError] = useState<string | null>(null);
    const [serviceError, setServiceError] = useState<string | null>(null);
    const [customerError, setCustomerError] = useState<string | null>(null);

    const [workerFieldErrors, setWorkerFieldErrors] = useState<Record<string, string>>({});
    const [serviceFieldErrors, setServiceFieldErrors] = useState<Record<string, string>>({});
    const [customerFieldErrors, setCustomerFieldErrors] = useState<Record<string, string>>({});

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

    const [serviceForm, setServiceForm] = useState<Omit<Service, "serviceId">>({
        serviceName: "",
        serviceFee: 0,
        minPrice: 0,
        maxPrice: 0,
        totalJobs: 0,
    });

    const [customerForm, setCustomerForm] = useState<Omit<Customer, "customerId">>({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
    });

    const loadAll = async () => {
        try {
            const [workersData, servicesData, customersData] = await Promise.all([
                getAdminWorkers(),
                getAdminServices(),
                getAdminCustomers(),
            ]);
            setWorkers(workersData);
            setServices(servicesData);
            setCustomers(customersData);
            setError(null);
        } catch {
            setError("Unable to load admin data.");
        } finally {
        }
    };

    useEffect(() => {
        loadAll();
    }, []);

    const resetWorkerForm = () => {
        setEditingWorkerId(null);
        setWorkerError(null);
        setWorkerFieldErrors({});
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

    const resetServiceForm = () => {
        setEditingServiceId(null);
        setServiceError(null);
        setServiceFieldErrors({});
        setServiceForm({
            serviceName: "",
            serviceFee: 0,
            minPrice: 0,
            maxPrice: 0,
            totalJobs: 0,
        });
    };

    const resetCustomerForm = () => {
        setEditingCustomerId(null);
        setCustomerError(null);
        setCustomerFieldErrors({});
        setCustomerForm({
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            password: "",
        });
    };

    const extractErrorMessage = (err: unknown, fallback: string) => {
        if (err instanceof HttpError) {
            const data = err.data as { errors?: string[]; message?: string } | null;
            if (data?.errors?.length) {
                return data.errors.join(" ");
            }
            if (data?.message) {
                return data.message;
            }
        }
        if (err instanceof Error) {
            return err.message;
        }
        return fallback;
    };

    const validateWorkerForm = () => {
        const errors: Record<string, string> = {};
        if (!workerForm.firstName.trim()) errors.firstName = "First name is required.";
        if (!workerForm.lastName.trim()) errors.lastName = "Last name is required.";
        if (!workerForm.email.trim()) {
            errors.email = "Email is required.";
        } else if (!/^\S+@\S+\.\S+$/.test(workerForm.email)) {
            errors.email = "Enter a valid email address.";
        }
        if (!workerForm.phoneNumber.trim()) errors.phoneNumber = "Phone number is required.";
        if (workerForm.hourlyRate < 0) errors.hourlyRate = "Hourly rate must be >= 0.";
        if (workerForm.rating < 0 || workerForm.rating > 5) errors.rating = "Rating must be 0 - 5.";
        if (!workerForm.address.street.trim()) errors["address.street"] = "Street is required.";
        if (!workerForm.address.city.trim()) errors["address.city"] = "City is required.";
        if (!workerForm.address.postalCode.trim()) errors["address.postalCode"] = "Postal code is required.";
        return errors;
    };

    const validateServiceForm = () => {
        const errors: Record<string, string> = {};
        if (!serviceForm.serviceName.trim()) errors.serviceName = "Service name is required.";
        if (serviceForm.serviceFee < 0) errors.serviceFee = "Service fee must be >= 0.";
        if (serviceForm.minPrice < 0) errors.minPrice = "Min price must be >= 0.";
        if (serviceForm.maxPrice < 0) errors.maxPrice = "Max price must be >= 0.";
        if (serviceForm.maxPrice > 0 && serviceForm.minPrice > serviceForm.maxPrice) {
            errors.maxPrice = "Max price must be >= min price.";
        }
        if (serviceForm.totalJobs < 0) errors.totalJobs = "Total jobs must be >= 0.";
        return errors;
    };

    const validateCustomerForm = () => {
        const errors: Record<string, string> = {};
        if (!customerForm.firstName.trim()) errors.firstName = "First name is required.";
        if (!customerForm.lastName.trim()) errors.lastName = "Last name is required.";
        if (!customerForm.email.trim()) {
            errors.email = "Email is required.";
        } else if (!/^\S+@\S+\.\S+$/.test(customerForm.email)) {
            errors.email = "Enter a valid email address.";
        }
        if (!customerForm.phoneNumber.trim()) errors.phoneNumber = "Phone number is required.";
        if (!editingCustomerId && !(customerForm.password ?? "").trim()) {
            errors.password = "Password is required for new customers.";
        }
        return errors;
    };

    const handleWorkerSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            if (editingWorkerId) {
                await updateAdminWorker(editingWorkerId, workerForm);
            } else {
                await createAdminWorker(workerForm);
            }
            resetWorkerForm();
            loadAll();
        } catch (e) {
            setError("Failed to save worker.");
        }
    };

    const handleServiceSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            if (editingServiceId) {
                await updateAdminService(editingServiceId, serviceForm);
            } else {
                await createAdminService(serviceForm);
            }
            resetServiceForm();
            loadAll();
        } catch (e) {
            setError("Failed to save service.");
        }
    };

    const handleCustomerSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            if (editingCustomerId) {
                await updateAdminCustomer(editingCustomerId, customerForm);
            } else {
                await createAdminCustomer(customerForm);
            }
            resetCustomerForm();
            loadAll();
        } catch (e) {
            setError("Failed to save customer.");
        }
    };

    return (
        <AdminDashboardShell>
            <div id="overview" className="flex flex-col gap-8">
                <header>
                    <h1 className="text-4xl font-black text-slate-900">Admin Dashboard</h1>
                    <p className="text-slate-500 mt-1">Manage workers, services, and customer accounts in one place.</p>
                </header>

                {error && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Workers</p>
                            <span className="material-symbols-outlined text-primary bg-blue-50 p-2 rounded-lg text-[24px]">engineering</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{workers.length}</p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Services Offered</p>
                            <span className="material-symbols-outlined text-primary bg-blue-50 p-2 rounded-lg text-[24px]">handyman</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{services.length}</p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Customers</p>
                            <span className="material-symbols-outlined text-primary bg-blue-50 p-2 rounded-lg text-[24px]">group</span>
                        </div>
                        <p className="text-3xl font-black text-slate-900">{customers.length}</p>
                    </div>
                </div>

                <section id="activity" className="flex flex-col gap-4">
                    <h2 className="text-2xl font-bold text-slate-900">Latest Activity</h2>
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

                <section id="workers" className="flex flex-col gap-6 pt-8">
                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Workers Management</h2>
                            <p className="text-slate-500">Add or edit worker profiles and availability.</p>
                        </div>
                        <Button variant="ghost" onClick={resetWorkerForm}>Clear Form</Button>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <form className="flex flex-col gap-6" onSubmit={handleWorkerSubmit}>
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
                                                    onClick={() => deleteAdminWorker(worker.workerId).then(loadAll)}
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
                </section>

                <section id="services" className="flex flex-col gap-6 pt-8">
                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Services Management</h2>
                            <p className="text-slate-500">Manage service types, fees, and stats.</p>
                        </div>
                        <Button variant="ghost" onClick={resetServiceForm}>Clear Form</Button>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <form className="flex flex-col gap-6" onSubmit={handleServiceSubmit}>
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
                                                    onClick={() => deleteAdminService(service.serviceId).then(loadAll)}
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
                </section>

                <section id="customers" className="flex flex-col gap-6 pt-8">
                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Customers Management</h2>
                            <p className="text-slate-500">Manage customer accounts and contact info.</p>
                        </div>
                        <Button variant="ghost" onClick={resetCustomerForm}>Clear Form</Button>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                        <form className="flex flex-col gap-6" onSubmit={handleCustomerSubmit}>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <Input
                                    label="First Name"
                                    value={customerForm.firstName}
                                    onChange={(event) => setCustomerForm({ ...customerForm, firstName: event.target.value })}
                                />
                                <Input
                                    label="Last Name"
                                    value={customerForm.lastName}
                                    onChange={(event) => setCustomerForm({ ...customerForm, lastName: event.target.value })}
                                />
                                <Input
                                    label="Email"
                                    type="email"
                                    value={customerForm.email}
                                    onChange={(event) => setCustomerForm({ ...customerForm, email: event.target.value })}
                                />
                                <Input
                                    label="Phone"
                                    value={customerForm.phoneNumber}
                                    onChange={(event) => setCustomerForm({ ...customerForm, phoneNumber: event.target.value })}
                                />
                                <Input
                                    label={editingCustomerId ? "Password (optional)" : "Password"}
                                    type="password"
                                    value={customerForm.password ?? ""}
                                    onChange={(event) => setCustomerForm({ ...customerForm, password: event.target.value })}
                                />
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit">
                                    {editingCustomerId ? "Update Customer" : "Create Customer"}
                                </Button>
                            </div>
                        </form>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Customer</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Email</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Phone</th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr key={customer.customerId} className="border-b border-slate-100 last:border-none hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">{customer.firstName} {customer.lastName}</td>
                                        <td className="px-6 py-4 text-sm text-slate-700">{customer.email}</td>
                                        <td className="px-6 py-4 text-sm text-slate-700">{customer.phoneNumber}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    onClick={() => {
                                                        setEditingCustomerId(customer.customerId);
                                                        setCustomerForm({
                                                            firstName: customer.firstName,
                                                            lastName: customer.lastName,
                                                            email: customer.email,
                                                            phoneNumber: customer.phoneNumber,
                                                            password: "",
                                                        });
                                                    }}
                                                >
                                                    Edit
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    className="text-rose-500 hover:bg-rose-50"
                                                    onClick={() => deleteAdminCustomer(customer.customerId).then(loadAll)}
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
                </section>
            </div>
        </AdminDashboardShell>
    );
};
