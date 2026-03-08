import { useEffect, useState } from "react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import {
    createAdminCustomer,
    deleteAdminCustomer,
    getAdminCustomers,
    getModerationUsers,
    updateCustomerModeration,
    updateAdminCustomer,
} from "../api/admin.api";
import type {
    AdminUserModerationUpdatePayload,
    Customer,
    ModerationUser,
    ModerationVerificationStatus,
} from "../features/admin/admin.types";
import { AdminDashboardShell } from "../components/layout/AdminDashboardShell";
import { computeRisk } from "../features/admin/adminAnalytics";
import { useToast } from "../context/ToastContext";

const VERIFICATION_STATUSES: ModerationVerificationStatus[] = [
    "Unverified",
    "Pending",
    "Verified",
    "Rejected",
];

export const AdminCustomersPage = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
    const [moderationByCustomer, setModerationByCustomer] = useState<Record<number, ModerationUser>>({});
    const [moderationPendingId, setModerationPendingId] = useState<number | null>(null);
    const { showToast } = useToast();

    const [customerForm, setCustomerForm] = useState<Omit<Customer, "customerId">>({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
    });

    const loadCustomers = async () => {
        try {
            const [data, moderationUsers] = await Promise.all([
                getAdminCustomers(),
                getModerationUsers(),
            ]);
            setCustomers(data);

            const moderationMap: Record<number, ModerationUser> = {};
            moderationUsers.customers.forEach((customer) => {
                moderationMap[customer.id] = customer;
            });
            setModerationByCustomer(moderationMap);
        } catch {
            setError("Unable to load customers.");
        }
    };

    useEffect(() => {
        loadCustomers();
    }, []);

    const resetForm = () => {
        setEditingCustomerId(null);
        setCustomerForm({
            firstName: "",
            lastName: "",
            email: "",
            phoneNumber: "",
            password: "",
        });
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
            if (editingCustomerId) {
                await updateAdminCustomer(editingCustomerId, customerForm);
            } else {
                await createAdminCustomer(customerForm);
            }
            resetForm();
            await loadCustomers();
            showToast("Customer account saved.", "success");
        } catch {
            setError("Failed to save customer.");
            showToast("Failed to save customer account.", "error");
        }
    };

    const handleDeleteCustomer = async (customerId: number) => {
        try {
            await deleteAdminCustomer(customerId);
            await loadCustomers();
            showToast("Customer deleted.", "success");
        } catch {
            showToast("Failed to delete customer.", "error");
        }
    };

    const handleModerationUpdate = async (
        customerId: number,
        updater: (current: ModerationUser) => AdminUserModerationUpdatePayload
    ) => {
        const current = moderationByCustomer[customerId];
        if (!current) {
            return;
        }

        const nextPayload = updater(current);
        const isSensitiveAction =
            current.isBlocked !== nextPayload.isBlocked ||
            current.isApprovedByAdmin !== nextPayload.isApprovedByAdmin;

        if (isSensitiveAction) {
            const confirmed = window.confirm("Confirm moderation update for this customer?");
            if (!confirmed) {
                return;
            }
        }

        setModerationPendingId(customerId);
        try {
            await updateCustomerModeration(customerId, nextPayload);
            await loadCustomers();
            showToast("Customer moderation updated.", "success");
        } catch {
            showToast("Failed to update customer moderation.", "error");
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
                        <h1 className="text-4xl font-black text-slate-900">Customers Management</h1>
                        <p className="text-slate-500 mt-1">Manage customer profiles and account security.</p>
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
                                {editingCustomerId ? "Update Customer Account" : "Create Customer Account"}
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
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Moderation</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customers.map((customer) => (
                                <tr key={customer.customerId} className="border-b border-slate-100 last:border-none align-top hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{customer.firstName} {customer.lastName}</span>
                                            <span className="text-xs text-slate-500">ID: {customer.customerId}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{customer.email}</td>
                                    <td className="px-6 py-4 text-sm text-slate-700">{customer.phoneNumber}</td>
                                    <td className="px-6 py-4">
                                        {moderationByCustomer[customer.customerId] ? (
                                            <div className="flex min-w-44 flex-col gap-2 text-xs">
                                                <span className={`inline-flex w-fit items-center rounded-full px-2.5 py-0.5 font-bold ${getRiskPillClass(computeRisk(moderationByCustomer[customer.customerId]).riskLevel)}`}>
                                                    {computeRisk(moderationByCustomer[customer.customerId]).riskLevel} Risk
                                                </span>
                                                <div className="flex flex-wrap gap-1">
                                                    {moderationByCustomer[customer.customerId].isBlocked ? (
                                                        <span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">Blocked</span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">Active</span>
                                                    )}
                                                    {moderationByCustomer[customer.customerId].isApprovedByAdmin ? (
                                                        <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">Approved</span>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">Pending Approval</span>
                                                    )}
                                                </div>
                                                <label className="text-slate-500" htmlFor={`customer-verification-${customer.customerId}`}>
                                                    Verification
                                                </label>
                                                <select
                                                    id={`customer-verification-${customer.customerId}`}
                                                    className="rounded-lg border border-slate-300 px-2 py-1 text-xs"
                                                    value={moderationByCustomer[customer.customerId].idVerificationStatus}
                                                    disabled={moderationPendingId === customer.customerId}
                                                    onChange={(event) => {
                                                        const nextStatus = event.target.value as ModerationVerificationStatus;
                                                        void handleModerationUpdate(customer.customerId, (current) => ({
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
                                                        disabled={moderationPendingId === customer.customerId}
                                                        onClick={() => {
                                                            void handleModerationUpdate(customer.customerId, (current) => ({
                                                                isBlocked: !current.isBlocked,
                                                                isApprovedByAdmin: current.isApprovedByAdmin,
                                                                idVerificationStatus: current.idVerificationStatus,
                                                            }));
                                                        }}
                                                    >
                                                        {moderationByCustomer[customer.customerId].isBlocked ? "Unblock" : "Block"}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        disabled={moderationPendingId === customer.customerId}
                                                        onClick={() => {
                                                            void handleModerationUpdate(customer.customerId, (current) => ({
                                                                isBlocked: current.isBlocked,
                                                                isApprovedByAdmin: !current.isApprovedByAdmin,
                                                                idVerificationStatus: current.idVerificationStatus,
                                                            }));
                                                        }}
                                                    >
                                                        {moderationByCustomer[customer.customerId].isApprovedByAdmin ? "Unapprove" : "Approve"}
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
                                                onClick={() => {
                                                    void handleDeleteCustomer(customer.customerId);
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
