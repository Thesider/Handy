import { useEffect, useState } from "react";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import {
    createAdminCustomer,
    deleteAdminCustomer,
    getAdminCustomers,
    updateAdminCustomer,
} from "../api/admin.api";
import type { Customer } from "../features/admin/admin.types";
import { AdminDashboardShell } from "../components/layout/AdminDashboardShell";

export const AdminCustomersPage = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);

    const [customerForm, setCustomerForm] = useState<Omit<Customer, "customerId">>({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
    });

    const loadCustomers = async () => {
        try {
            const data = await getAdminCustomers();
            setCustomers(data);
        } catch {
            setError("Unable to load customers.");
        } finally {
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
            loadCustomers();
        } catch (e) {
            setError("Failed to save customer.");
        }
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
                                                onClick={() => deleteAdminCustomer(customer.customerId).then(loadCustomers)}
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
