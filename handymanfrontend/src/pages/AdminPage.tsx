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
import { CustomerCrudSection } from "./admin/CustomerCrudSection";
import { ServiceCrudSection } from "./admin/ServiceCrudSection";
import { UserManagementSection } from "./admin/UserManagementSection";
import { WorkerCrudSection } from "./admin/WorkerCrudSection";
import type { RoleFilter, StatusFilter, UserRow } from "./admin/adminPage.types";

export const AdminPage = () => {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
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
            setLoading(true);
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
            setLoading(false);
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
        setWorkerError(null);
        const errors = validateWorkerForm();
        if (Object.keys(errors).length) {
            setWorkerFieldErrors(errors);
            setWorkerError("Please fix the highlighted fields.");
            return;
        }
        setWorkerSubmitting(true);
        setWorkerFieldErrors({});
        try {
            if (editingWorkerId) {
                await updateAdminWorker(editingWorkerId, workerForm);
            } else {
                await createAdminWorker(workerForm);
            }
            resetWorkerForm();
            loadAll();
        } catch (err) {
            setWorkerError(extractErrorMessage(err, "Unable to save worker."));
        } finally {
            setWorkerSubmitting(false);
        }
    };

    const handleServiceSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setServiceError(null);
        const errors = validateServiceForm();
        if (Object.keys(errors).length) {
            setServiceFieldErrors(errors);
            setServiceError("Please fix the highlighted fields.");
            return;
        }
        setServiceSubmitting(true);
        setServiceFieldErrors({});
        try {
            if (editingServiceId) {
                await updateAdminService(editingServiceId, serviceForm);
            } else {
                await createAdminService(serviceForm);
            }
            resetServiceForm();
            loadAll();
        } catch (err) {
            setServiceError(extractErrorMessage(err, "Unable to save service."));
        } finally {
            setServiceSubmitting(false);
        }
    };

    const handleCustomerSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setCustomerError(null);
        const errors = validateCustomerForm();
        if (Object.keys(errors).length) {
            setCustomerFieldErrors(errors);
            setCustomerError("Please fix the highlighted fields.");
            return;
        }
        setCustomerSubmitting(true);
        setCustomerFieldErrors({});
        try {
            const { password, ...rest } = customerForm;
            const customerPayload: Omit<Customer, "customerId"> =
                editingCustomerId && !(password ?? "").trim()
                    ? (rest as Omit<Customer, "customerId">)
                    : { ...rest, password: password ?? "" };
            if (editingCustomerId) {
                await updateAdminCustomer(editingCustomerId, customerPayload);
            } else {
                await createAdminCustomer(customerPayload);
            }
            resetCustomerForm();
            loadAll();
        } catch (err) {
            setCustomerError(extractErrorMessage(err, "Unable to save customer."));
        } finally {
            setCustomerSubmitting(false);
        }
    };

    const userRows = useMemo(() => {
        const workerRows = workers.map((worker) => ({
            id: worker.workerId,
            name: `${worker.firstName} ${worker.lastName}`.trim(),
            email: worker.email,
            role: "Worker" as const,
            status: worker.isAvailable ? "Active" : "Pending",
            joined: "—",
            kind: "worker" as const,
        }));
        const customerRows = customers.map((customer) => ({
            id: customer.customerId,
            name: `${customer.firstName} ${customer.lastName}`.trim(),
            email: customer.email,
            role: "Customer" as const,
            status: "Active",
            joined: "—",
            kind: "customer" as const,
        }));
        return [...workerRows, ...customerRows];
    }, [workers, customers]);

    const filteredRows = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        return userRows.filter((row) => {
            if (roleFilter === "Workers" && row.role !== "Worker") return false;
            if (roleFilter === "Customers" && row.role !== "Customer") return false;
            if (statusFilter !== "All Status" && row.status !== statusFilter) return false;
            if (!normalizedSearch) return true;
            return (
                row.name.toLowerCase().includes(normalizedSearch) ||
                row.email.toLowerCase().includes(normalizedSearch) ||
                row.id.toString().includes(normalizedSearch)
            );
        });
    }, [userRows, roleFilter, statusFilter, searchTerm]);

    const pendingCount = userRows.filter((row) => row.status === "Pending").length;
    const activeWorkers = workers.filter((worker) => worker.isAvailable).length;

    const handleEditWorkerById = async (workerId: number) => {
        setWorkerError(null);
        setWorkerFieldErrors({});
        try {
            const worker = await getAdminWorkerById(workerId);
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
        } catch (err) {
            setWorkerError(extractErrorMessage(err, "Unable to load worker details."));
        }
    };

    const handleEditCustomerById = async (customerId: number) => {
        setCustomerError(null);
        setCustomerFieldErrors({});
        try {
            const customer = await getAdminCustomerById(customerId);
            setEditingCustomerId(customer.customerId);
            setCustomerForm({
                firstName: customer.firstName,
                lastName: customer.lastName,
                email: customer.email,
                phoneNumber: customer.phoneNumber,
                password: "",
            });
        } catch (err) {
            setCustomerError(extractErrorMessage(err, "Unable to load customer details."));
        }
    };

    const handleEditServiceById = async (serviceId: number) => {
        setServiceError(null);
        setServiceFieldErrors({});
        try {
            const service = await getAdminServiceById(serviceId);
            setEditingServiceId(service.serviceId);
            setServiceForm({
                serviceName: service.serviceName,
                serviceFee: service.serviceFee,
                minPrice: service.minPrice,
                maxPrice: service.maxPrice,
                totalJobs: service.totalJobs,
            });
        } catch (err) {
            setServiceError(extractErrorMessage(err, "Unable to load service details."));
        }
    };

    const handleEditUser = (row: UserRow) => {
        if (row.kind === "worker") {
            handleEditWorkerById(row.id);
        }
        if (row.kind === "customer") {
            handleEditCustomerById(row.id);
        }
    };

    const handleDeleteUser = async (row: UserRow) => {
        if (row.kind === "worker") {
            await deleteAdminWorker(row.id);
        } else {
            await deleteAdminCustomer(row.id);
        }
        loadAll();
    };

    return (
        <div className="min-h-screen bg-background-light text-[#111418] dark:bg-background-dark dark:text-white">
            <div className="flex h-screen overflow-hidden">
                <aside className="hidden w-72 flex-shrink-0 border-r border-[#dbe0e6] bg-white dark:border-gray-800 dark:bg-[#111418] lg:flex">
                    <div className="flex h-full w-full flex-col justify-between p-4">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-3 px-2 py-2">
                                <div className="size-10 rounded-full bg-primary/20" />
                                <div className="flex flex-col">
                                    <h1 className="text-base font-bold">HandyAdmin</h1>
                                    <p className="text-sm text-[#617589] dark:text-gray-400">Platform Manager</p>
                                </div>
                            </div>
                            <div className="mt-4 flex flex-col gap-1">
                                <button className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#111418] transition-colors hover:bg-background-light dark:text-gray-200 dark:hover:bg-gray-800">
                                    <span className="material-symbols-outlined text-[#617589]">bar_chart</span>
                                    Dashboard
                                </button>
                                <button className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-3 text-sm font-bold text-primary">
                                    <span className="material-symbols-outlined fill">group</span>
                                    Users
                                </button>
                                <button className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#111418] transition-colors hover:bg-background-light dark:text-gray-200 dark:hover:bg-gray-800">
                                    <span className="material-symbols-outlined text-[#617589]">work</span>
                                    Jobs
                                </button>
                                <button className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#111418] transition-colors hover:bg-background-light dark:text-gray-200 dark:hover:bg-gray-800">
                                    <span className="material-symbols-outlined text-[#617589]">payments</span>
                                    Payments
                                </button>
                                <button className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#111418] transition-colors hover:bg-background-light dark:text-gray-200 dark:hover:bg-gray-800">
                                    <span className="material-symbols-outlined text-[#617589]">settings</span>
                                    Settings
                                </button>
                            </div>
                        </div>
                        <button className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#111418] transition-colors hover:bg-red-50 dark:text-gray-200 dark:hover:bg-red-900/10">
                            <span className="material-symbols-outlined text-[#617589]">logout</span>
                            Log Out
                        </button>
                    </div>
                </aside>

                <main className="flex flex-1 flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto">
                        <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-6 py-8">
                            <UserManagementSection
                                loading={loading}
                                error={error}
                                userRows={userRows}
                                filteredRows={filteredRows}
                                pendingCount={pendingCount}
                                activeWorkers={activeWorkers}
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                roleFilter={roleFilter}
                                setRoleFilter={setRoleFilter}
                                statusFilter={statusFilter}
                                setStatusFilter={setStatusFilter}
                                onEditUser={handleEditUser}
                                onDeleteUser={handleDeleteUser}
                            />

                            <section id="manage-users" className="grid gap-6">
                                <WorkerCrudSection
                                    workerForm={workerForm}
                                    setWorkerForm={setWorkerForm}
                                    workerFieldErrors={workerFieldErrors}
                                    workerSubmitting={workerSubmitting}
                                    workerError={workerError}
                                    editingWorkerId={editingWorkerId}
                                    onSubmit={handleWorkerSubmit}
                                    onReset={resetWorkerForm}
                                />

                                <ServiceCrudSection
                                    serviceForm={serviceForm}
                                    setServiceForm={setServiceForm}
                                    serviceFieldErrors={serviceFieldErrors}
                                    serviceSubmitting={serviceSubmitting}
                                    serviceError={serviceError}
                                    editingServiceId={editingServiceId}
                                    services={services}
                                    onSubmit={handleServiceSubmit}
                                    onReset={resetServiceForm}
                                    onEditService={handleEditServiceById}
                                    onDeleteService={(serviceId) => deleteAdminService(serviceId).then(loadAll)}
                                />

                                <CustomerCrudSection
                                    customerForm={customerForm}
                                    setCustomerForm={setCustomerForm}
                                    customerFieldErrors={customerFieldErrors}
                                    customerSubmitting={customerSubmitting}
                                    customerError={customerError}
                                    editingCustomerId={editingCustomerId}
                                    customers={customers}
                                    onSubmit={handleCustomerSubmit}
                                    onReset={resetCustomerForm}
                                    onEditCustomer={handleEditCustomerById}
                                    onDeleteCustomer={(customerId) => deleteAdminCustomer(customerId).then(loadAll)}
                                />
                            </section>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
