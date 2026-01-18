import { useEffect, useState } from "react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import {
    createAdminCustomer,
    createAdminService,
    createAdminWorker,
    deleteAdminCustomer,
    deleteAdminService,
    deleteAdminWorker,
    getAdminCustomers,
    getAdminServices,
    getAdminWorkers,
    updateAdminCustomer,
    updateAdminService,
    updateAdminWorker,
} from "../api/admin.api";
import type { Customer } from "../features/admin/admin.types";
import type { Service, Worker } from "../features/handyman/handyman.types";
import styles from "./AdminPage.module.css";

export const AdminPage = () => {
    const [workers, setWorkers] = useState<Worker[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [editingWorkerId, setEditingWorkerId] = useState<number | null>(null);
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
    const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);

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

    const [serviceForm, setServiceForm] = useState<Omit<Service, "serviceId">>({
        serviceName: "",
        serviceFee: 0,
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

    const resetServiceForm = () => {
        setEditingServiceId(null);
        setServiceForm({
            serviceName: "",
            serviceFee: 0,
            totalJobs: 0,
        });
    };

    const resetCustomerForm = () => {
        setEditingCustomerId(null);
        setCustomerForm({
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            password: "",
        });
    };

    const handleWorkerSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (editingWorkerId) {
            await updateAdminWorker(editingWorkerId, workerForm);
        } else {
            await createAdminWorker(workerForm);
        }
        resetWorkerForm();
        loadAll();
    };

    const handleServiceSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (editingServiceId) {
            await updateAdminService(editingServiceId, serviceForm);
        } else {
            await createAdminService(serviceForm);
        }
        resetServiceForm();
        loadAll();
    };

    const handleCustomerSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (editingCustomerId) {
            await updateAdminCustomer(editingCustomerId, customerForm);
        } else {
            await createAdminCustomer(customerForm);
        }
        resetCustomerForm();
        loadAll();
    };

    return (
        <div className={styles.container}>
            <h1>Admin dashboard</h1>
            <p>Manage workers, services, and customer accounts in one place.</p>
            {error ? <div className={styles.notice}>{error}</div> : null}
            <a href="#activity">
                <Button>Review latest activity</Button>
            </a>
            <div className={styles.grid}>
                <div className={styles.card}>
                    <h3>Overview</h3>
                    <p>Track new bookings, users, and worker approvals.</p>
                </div>
                <div className={styles.card}>
                    <h3>Workers</h3>
                    <p>Approve profiles, monitor ratings, and update availability.</p>
                </div>
                <div className={styles.card}>
                    <h3>Customers</h3>
                    <p>Resolve support issues and monitor recent feedback.</p>
                </div>
            </div>

            <section id="activity" className={styles.section}>
                <h2>Activity</h2>
                <div className={styles.table}>
                    <div className={styles.tableRow}>
                        <strong>Type</strong>
                        <strong>Details</strong>
                        <strong>Status</strong>
                    </div>
                    <div className={styles.tableRow}>
                        <span>Approvals</span>
                        <span>No pending worker approvals</span>
                        <span>Clear</span>
                    </div>
                </div>
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h2>Workers</h2>
                        <p>Update worker profiles and availability.</p>
                    </div>
                    <Button variant="ghost" onClick={resetWorkerForm}>
                        Clear form
                    </Button>
                </div>
                <form className={styles.form} onSubmit={handleWorkerSubmit}>
                    <div className={styles.formRow}>
                        <Input
                            label="First name"
                            value={workerForm.firstName}
                            onChange={(event) =>
                                setWorkerForm({ ...workerForm, firstName: event.target.value })
                            }
                        />
                        <Input
                            label="Last name"
                            value={workerForm.lastName}
                            onChange={(event) =>
                                setWorkerForm({ ...workerForm, lastName: event.target.value })
                            }
                        />
                    </div>
                    <div className={styles.formRow}>
                        <Input
                            label="Email"
                            type="email"
                            value={workerForm.email}
                            onChange={(event) =>
                                setWorkerForm({ ...workerForm, email: event.target.value })
                            }
                        />
                        <Input
                            label="Phone"
                            value={workerForm.phoneNumber}
                            onChange={(event) =>
                                setWorkerForm({ ...workerForm, phoneNumber: event.target.value })
                            }
                        />
                    </div>
                    <div className={styles.formRow}>
                        <Input
                            label="Years of experience"
                            type="number"
                            value={workerForm.yearsOfExperience}
                            onChange={(event) =>
                                setWorkerForm({
                                    ...workerForm,
                                    yearsOfExperience: Number(event.target.value),
                                })
                            }
                        />
                        <Input
                            label="Hourly rate"
                            type="number"
                            value={workerForm.hourlyRate}
                            onChange={(event) =>
                                setWorkerForm({
                                    ...workerForm,
                                    hourlyRate: Number(event.target.value),
                                })
                            }
                        />
                    </div>
                    <div className={styles.formRow}>
                        <Input
                            label="Rating"
                            type="number"
                            value={workerForm.rating}
                            onChange={(event) =>
                                setWorkerForm({
                                    ...workerForm,
                                    rating: Number(event.target.value),
                                })
                            }
                        />
                        <label className={styles.checkbox}>
                            <input
                                type="checkbox"
                                checked={workerForm.isAvailable}
                                onChange={(event) =>
                                    setWorkerForm({
                                        ...workerForm,
                                        isAvailable: event.target.checked,
                                    })
                                }
                            />
                            Available
                        </label>
                    </div>
                    <Input
                        label="Street"
                        value={workerForm.address.street}
                        onChange={(event) =>
                            setWorkerForm({
                                ...workerForm,
                                address: { ...workerForm.address, street: event.target.value },
                            })
                        }
                    />
                    <div className={styles.formRow}>
                        <Input
                            label="City"
                            value={workerForm.address.city}
                            onChange={(event) =>
                                setWorkerForm({
                                    ...workerForm,
                                    address: { ...workerForm.address, city: event.target.value },
                                })
                            }
                        />
                        <Input
                            label="State"
                            value={workerForm.address.state ?? ""}
                            onChange={(event) =>
                                setWorkerForm({
                                    ...workerForm,
                                    address: { ...workerForm.address, state: event.target.value },
                                })
                            }
                        />
                    </div>
                    <div className={styles.formRow}>
                        <Input
                            label="Postal code"
                            value={workerForm.address.postalCode}
                            onChange={(event) =>
                                setWorkerForm({
                                    ...workerForm,
                                    address: {
                                        ...workerForm.address,
                                        postalCode: event.target.value,
                                    },
                                })
                            }
                        />
                        <Input
                            label="Country"
                            value={workerForm.address.country ?? ""}
                            onChange={(event) =>
                                setWorkerForm({
                                    ...workerForm,
                                    address: { ...workerForm.address, country: event.target.value },
                                })
                            }
                        />
                    </div>
                    <div className={styles.formActions}>
                        <Button type="submit">
                            {editingWorkerId ? "Update worker" : "Create worker"}
                        </Button>
                    </div>
                </form>
                {loading ? (
                    <p className={styles.notice}>Loading workers...</p>
                ) : (
                    <div className={styles.table}>
                        <div className={styles.tableRow}>
                            <strong>Name</strong>
                            <strong>Email</strong>
                            <strong>Status</strong>
                        </div>
                        {workers.map((worker) => (
                            <div key={worker.workerId} className={styles.tableRow}>
                                <span>
                                    {worker.firstName} {worker.lastName}
                                </span>
                                <span>{worker.email}</span>
                                <span className={worker.isAvailable ? styles.success : styles.muted}>
                                    {worker.isAvailable ? "Available" : "Unavailable"}
                                </span>
                                <div className={styles.rowActions}>
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
                                        onClick={() => deleteAdminWorker(worker.workerId).then(loadAll)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h2>Services</h2>
                        <p>Keep pricing and job counts up to date.</p>
                    </div>
                    <Button variant="ghost" onClick={resetServiceForm}>
                        Clear form
                    </Button>
                </div>
                <form className={styles.form} onSubmit={handleServiceSubmit}>
                    <div className={styles.formRow}>
                        <Input
                            label="Service name"
                            value={serviceForm.serviceName}
                            onChange={(event) =>
                                setServiceForm({ ...serviceForm, serviceName: event.target.value })
                            }
                        />
                        <Input
                            label="Service fee"
                            type="number"
                            value={serviceForm.serviceFee}
                            onChange={(event) =>
                                setServiceForm({
                                    ...serviceForm,
                                    serviceFee: Number(event.target.value),
                                })
                            }
                        />
                    </div>
                    <Input
                        label="Total jobs"
                        type="number"
                        value={serviceForm.totalJobs}
                        onChange={(event) =>
                            setServiceForm({
                                ...serviceForm,
                                totalJobs: Number(event.target.value),
                            })
                        }
                    />
                    <div className={styles.formActions}>
                        <Button type="submit">
                            {editingServiceId ? "Update service" : "Create service"}
                        </Button>
                    </div>
                </form>
                {loading ? (
                    <p className={styles.notice}>Loading services...</p>
                ) : (
                    <div className={styles.table}>
                        <div className={styles.tableRow}>
                            <strong>Name</strong>
                            <strong>Fee</strong>
                            <strong>Jobs</strong>
                        </div>
                        {services.map((service) => (
                            <div key={service.serviceId} className={styles.tableRow}>
                                <span>{service.serviceName}</span>
                                <span>{service.serviceFee}</span>
                                <span>{service.totalJobs}</span>
                                <div className={styles.rowActions}>
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
                                        onClick={() => deleteAdminService(service.serviceId).then(loadAll)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section className={styles.section}>
                <div className={styles.sectionHeader}>
                    <div>
                        <h2>Customers</h2>
                        <p>Manage customer contact details.</p>
                    </div>
                    <Button variant="ghost" onClick={resetCustomerForm}>
                        Clear form
                    </Button>
                </div>
                <form className={styles.form} onSubmit={handleCustomerSubmit}>
                    <div className={styles.formRow}>
                        <Input
                            label="First name"
                            value={customerForm.firstName}
                            onChange={(event) =>
                                setCustomerForm({ ...customerForm, firstName: event.target.value })
                            }
                        />
                        <Input
                            label="Last name"
                            value={customerForm.lastName}
                            onChange={(event) =>
                                setCustomerForm({ ...customerForm, lastName: event.target.value })
                            }
                        />
                    </div>
                    <div className={styles.formRow}>
                        <Input
                            label="Email"
                            type="email"
                            value={customerForm.email}
                            onChange={(event) =>
                                setCustomerForm({ ...customerForm, email: event.target.value })
                            }
                        />
                        <Input
                            label="Phone"
                            value={customerForm.phoneNumber}
                            onChange={(event) =>
                                setCustomerForm({
                                    ...customerForm,
                                    phoneNumber: event.target.value,
                                })
                            }
                        />
                    </div>
                    <Input
                        label={editingCustomerId ? "Password (optional)" : "Password"}
                        type="password"
                        value={customerForm.password ?? ""}
                        onChange={(event) =>
                            setCustomerForm({ ...customerForm, password: event.target.value })
                        }
                    />
                    <div className={styles.formActions}>
                        <Button type="submit">
                            {editingCustomerId ? "Update customer" : "Create customer"}
                        </Button>
                    </div>
                </form>
                {loading ? (
                    <p className={styles.notice}>Loading customers...</p>
                ) : (
                    <div className={styles.table}>
                        <div className={styles.tableRow}>
                            <strong>Name</strong>
                            <strong>Email</strong>
                            <strong>Phone</strong>
                        </div>
                        {customers.map((customer) => (
                            <div key={customer.customerId} className={styles.tableRow}>
                                <span>
                                    {customer.firstName} {customer.lastName}
                                </span>
                                <span>{customer.email}</span>
                                <span>{customer.phoneNumber}</span>
                                <div className={styles.rowActions}>
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
                                        onClick={() => deleteAdminCustomer(customer.customerId).then(loadAll)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};
