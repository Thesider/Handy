import type { ChangeEvent, FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import * as profileApi from "../api/profile.api";
import type { AdminUser, AdminUpdatePayload, Customer } from "../features/admin/admin.types";
import type { Worker } from "../features/handyman/handyman.types";
import styles from "./ProfilePage.module.css";

export const ProfilePage = () => {
    const { user, logout, updateUser } = useAuth();
    const role = user?.role ?? "Customer";
    const [form, setForm] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        address: {
            street: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
        },
    });
    const [workerSnapshot, setWorkerSnapshot] = useState<Worker | null>(null);
    const [adminSnapshot, setAdminSnapshot] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const name = useMemo(() => {
        const fullName = `${form.firstName} ${form.lastName}`.trim();
        return fullName || user?.name || "Customer";
    }, [form.firstName, form.lastName, user?.name]);
    const greetingName = name.split(" ")[0] || "Customer";

    useEffect(() => {
        let isActive = true;

        const loadProfile = async () => {
            if (!user?.id) {
                setIsLoading(false);
                setError("Missing account id. Please sign in again.");
                return;
            }

            setIsLoading(true);
            setError(null);
            setSuccess(null);

            try {
                if (role === "Worker") {
                    const worker = await profileApi.getWorkerProfile(user.id);
                    if (!isActive) return;
                    setWorkerSnapshot(worker);
                    setForm({
                        firstName: worker.firstName ?? "",
                        lastName: worker.lastName ?? "",
                        email: worker.email ?? "",
                        phoneNumber: worker.phoneNumber ?? "",
                        password: "",
                        address: {
                            street: worker.address?.street ?? "",
                            city: worker.address?.city ?? "",
                            state: worker.address?.state ?? "",
                            postalCode: worker.address?.postalCode ?? "",
                            country: worker.address?.country ?? "",
                        },
                    });
                } else if (role === "Admin") {
                    const admin = await profileApi.getAdminProfile(user.id);
                    if (!isActive) return;
                    setAdminSnapshot(admin);
                    setForm((previous) => ({
                        ...previous,
                        firstName: admin.firstName ?? "",
                        lastName: admin.lastName ?? "",
                        email: admin.email ?? "",
                        phoneNumber: "",
                        password: "",
                    }));
                } else {
                    const customer = await profileApi.getCustomerProfile(user.id);
                    if (!isActive) return;
                    setForm((previous) => ({
                        ...previous,
                        firstName: customer.firstName ?? "",
                        lastName: customer.lastName ?? "",
                        email: customer.email ?? "",
                        phoneNumber: customer.phoneNumber ?? "",
                        password: "",
                    }));
                }
            } catch (loadError) {
                if (!isActive) return;
                setError("Unable to load profile details. Please try again.");
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        loadProfile();

        return () => {
            isActive = false;
        };
    }, [role, user?.id]);

    const handleChange = (field: keyof typeof form) => (event: ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleAddressChange = (field: keyof typeof form.address) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            const value = event.target.value;
            setForm((previous) => ({
                ...previous,
                address: {
                    ...previous.address,
                    [field]: value,
                },
            }));
        };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!user?.id) {
            setError("Missing account id. Please sign in again.");
            return;
        }
        if (!user) {
            setError("Missing account details. Please sign in again.");
            return;
        }

        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
            if (role === "Worker") {
                if (!workerSnapshot) {
                    throw new Error("Missing worker profile");
                }
                const updatedWorker: Worker = {
                    ...workerSnapshot,
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    email: form.email.trim(),
                    phoneNumber: form.phoneNumber.trim(),
                    address: {
                        street: form.address.street.trim(),
                        city: form.address.city.trim(),
                        state: form.address.state.trim(),
                        postalCode: form.address.postalCode.trim(),
                        country: form.address.country.trim(),
                    },
                };
                const { workerId, ...payload } = updatedWorker;
                await profileApi.updateWorkerProfile(user.id, payload);
                setWorkerSnapshot(updatedWorker);
            } else if (role === "Admin") {
                const payload: AdminUpdatePayload = {
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    email: form.email.trim(),
                    password: form.password.trim() ? form.password.trim() : undefined,
                };
                await profileApi.updateAdminProfile(user.id, payload);
                if (adminSnapshot) {
                    setAdminSnapshot({
                        ...adminSnapshot,
                        firstName: payload.firstName,
                        lastName: payload.lastName,
                        email: payload.email,
                    });
                }
            } else {
                const payload: Omit<Customer, "customerId"> = {
                    firstName: form.firstName.trim(),
                    lastName: form.lastName.trim(),
                    email: form.email.trim(),
                    phoneNumber: form.phoneNumber.trim(),
                    password: form.password.trim() ? form.password.trim() : undefined,
                };
                await profileApi.updateCustomerProfile(user.id, payload);
            }

            updateUser({
                ...user,
                name: `${form.firstName} ${form.lastName}`.trim(),
                email: form.email.trim(),
            });
            setForm((previous) => ({
                ...previous,
                password: "",
            }));
            setSuccess("Profile updated successfully.");
        } catch (submitError) {
            setError("Unable to update profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex min-h-screen overflow-hidden bg-background-light text-text-primary-light dark:bg-background-dark dark:text-text-primary-dark">
            <aside className="w-72 flex-shrink-0 border-r border-slate-800 bg-slate-900 text-white">
                <div className="flex h-full flex-col justify-between p-6">
                    <div className="flex flex-col gap-8">
                        <div className="flex items-center gap-3">
                            <div
                                className={`aspect-square size-12 rounded-full bg-cover bg-center shadow-sm ${styles.avatarImage}`}
                                aria-hidden="true"
                            />
                            <div className="flex flex-col">
                                <h1 className="text-base font-bold leading-normal text-white">
                                    {name}
                                </h1>
                                <p className="text-sm font-normal leading-normal text-slate-300">
                                    {role} Account
                                </p>
                            </div>
                        </div>

                        <nav className="flex flex-col gap-2">
                            <Link
                                className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2.5 text-white transition-colors"
                                to="/profile"
                            >
                                <span className="material-symbols-outlined fill">dashboard</span>
                                <span className="text-sm font-medium leading-normal">Dashboard</span>
                            </Link>
                            <Link
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                                to="/bookings"
                            >
                                <span className="material-symbols-outlined">calendar_month</span>
                                <span className="text-sm font-medium leading-normal">My Bookings</span>
                            </Link>
                            <button
                                type="button"
                                className="group flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <span className="flex items-center gap-3">
                                    <span className="material-symbols-outlined">chat_bubble</span>
                                    <span className="text-sm font-medium leading-normal">Messages</span>
                                </span>
                                <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-white">
                                    2
                                </span>
                            </button>
                            <button
                                type="button"
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <span className="material-symbols-outlined">credit_card</span>
                                <span className="text-sm font-medium leading-normal">Payment Methods</span>
                            </button>
                            <button
                                type="button"
                                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <span className="material-symbols-outlined">settings</span>
                                <span className="text-sm font-medium leading-normal">Settings</span>
                            </button>
                        </nav>
                    </div>
                    <button
                        type="button"
                        onClick={logout}
                        className="mt-auto flex h-10 w-full items-center gap-3 rounded-lg px-3 text-slate-300 transition-colors hover:bg-red-500/20 hover:text-red-200"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        <span className="truncate text-sm font-medium">Log Out</span>
                    </button>
                </div>
            </aside>

            <main className="flex h-full flex-1 flex-col overflow-y-auto">
                <div className="layout-content-container mx-auto flex w-full max-w-[1200px] flex-col gap-8 p-6 md:p-8 lg:p-10">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <p className="text-3xl font-black leading-tight tracking-[-0.033em] text-text-primary-light dark:text-white md:text-4xl">
                                Good morning, {greetingName}
                            </p>
                            <p className="text-base font-normal leading-normal text-text-secondary-light dark:text-text-secondary-dark">
                                Manage your bookings and find your next pro.
                            </p>
                        </div>
                        <Link
                            className="flex h-10 items-center justify-center overflow-hidden rounded-lg bg-primary px-6 text-sm font-bold leading-normal tracking-[0.015em] text-white shadow-sm transition-colors hover:bg-blue-600"
                            to="/handymen"
                        >
                            <span className="truncate">Book a Service</span>
                        </Link>
                    </div>

                    <section className="flex flex-col gap-4">
                        <h2 className="text-[22px] font-bold leading-tight text-text-primary-light dark:text-white">
                            Active Bookings
                        </h2>
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            <div className="flex flex-col gap-4 rounded-xl border border-transparent bg-surface-light p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-gray-800 dark:bg-surface-dark dark:shadow-none sm:flex-row">
                                <div
                                    className={`aspect-video w-full shrink-0 rounded-lg bg-cover bg-center sm:aspect-square sm:w-40 ${styles.bookingImagePlumbing}`}
                                    aria-hidden="true"
                                />
                                <div className="flex flex-1 flex-col justify-between gap-3">
                                    <div>
                                        <div className="mb-1 flex items-start justify-between">
                                            <p className="text-lg font-bold leading-tight text-text-primary-light dark:text-white">
                                                Plumbing Repair
                                            </p>
                                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-300">
                                                In-Progress
                                            </span>
                                        </div>
                                        <div className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                            <span className="material-symbols-outlined text-[18px]">
                                                person
                                            </span>
                                            <span>Mike D.</span>
                                        </div>
                                        <div className="mt-0.5 flex items-center gap-1.5 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                            <span className="material-symbols-outlined text-[18px]">
                                                schedule
                                            </span>
                                            <span>Arriving in 15 mins</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex gap-2">
                                        <button
                                            type="button"
                                            className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-background-light px-3 text-sm font-medium text-text-primary-light transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">chat</span>
                                            <span>Message</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-background-light px-3 text-sm font-medium text-text-primary-light transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">map</span>
                                            <span>Track</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 rounded-xl border border-transparent bg-surface-light p-4 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-gray-800 dark:bg-surface-dark dark:shadow-none sm:flex-row">
                                <div
                                    className={`aspect-video w-full shrink-0 rounded-lg bg-cover bg-center sm:aspect-square sm:w-40 ${styles.bookingImageFurniture}`}
                                    aria-hidden="true"
                                />
                                <div className="flex flex-1 flex-col justify-between gap-3">
                                    <div>
                                        <div className="mb-1 flex items-start justify-between">
                                            <p className="text-lg font-bold leading-tight text-text-primary-light dark:text-white">
                                                Furniture Assembly
                                            </p>
                                            <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10 dark:bg-gray-700 dark:text-gray-300">
                                                Scheduled
                                            </span>
                                        </div>
                                        <div className="mt-1 flex items-center gap-1.5 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                            <span className="material-symbols-outlined text-[18px]">
                                                person
                                            </span>
                                            <span>Sarah J.</span>
                                        </div>
                                        <div className="mt-0.5 flex items-center gap-1.5 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                            <span className="material-symbols-outlined text-[18px]">
                                                event
                                            </span>
                                            <span>Tomorrow, 2:00 PM</span>
                                        </div>
                                    </div>
                                    <div className="mt-2 flex gap-2">
                                        <button
                                            type="button"
                                            className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-background-light px-3 text-sm font-medium text-text-primary-light transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">
                                                edit_calendar
                                            </span>
                                            <span>Reschedule</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mt-2 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[22px] font-bold leading-tight text-text-primary-light dark:text-white">
                                Recommended for you
                            </h2>
                            <Link className="text-sm font-semibold text-primary hover:underline" to="/handymen">
                                View all
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            <div className="group flex flex-col overflow-hidden rounded-xl border border-transparent bg-surface-light shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-surface-dark dark:shadow-none">
                                <div className="relative h-32 bg-gray-100">
                                    <div
                                        className={`absolute inset-0 bg-cover bg-center opacity-80 transition-opacity group-hover:opacity-100 ${styles.proCardBgElectric}`}
                                        aria-hidden="true"
                                    />
                                    <div className="absolute -bottom-6 left-4">
                                        <div
                                            className={`size-12 rounded-full border-2 border-white bg-cover bg-center dark:border-surface-dark ${styles.proAvatarMark}`}
                                            aria-hidden="true"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 px-4 pb-4 pt-8">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-text-primary-light dark:text-white">
                                                Mark T.
                                            </h3>
                                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                                Master Electrician
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 rounded bg-yellow-50 px-1.5 py-0.5 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                                            <span className="material-symbols-outlined fill text-[16px]">
                                                star
                                            </span>
                                            <span className="text-xs font-bold">4.9</span>
                                        </div>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-sm">
                                        <span className="font-semibold text-text-primary-light dark:text-white">
                                            $85/hr
                                        </span>
                                        <span className="text-text-secondary-light dark:text-text-secondary-dark">
                                            • 120 jobs
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className="mt-3 h-9 w-full rounded-lg bg-primary/10 text-sm font-bold text-primary transition-colors hover:bg-primary/20"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>

                            <div className="group flex flex-col overflow-hidden rounded-xl border border-transparent bg-surface-light shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-surface-dark dark:shadow-none">
                                <div className="relative h-32 bg-gray-100">
                                    <div
                                        className={`absolute inset-0 bg-cover bg-center opacity-80 transition-opacity group-hover:opacity-100 ${styles.proCardBgWood}`}
                                        aria-hidden="true"
                                    />
                                    <div className="absolute -bottom-6 left-4">
                                        <div
                                            className={`size-12 rounded-full border-2 border-white bg-cover bg-center dark:border-surface-dark ${styles.proAvatarDavid}`}
                                            aria-hidden="true"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 px-4 pb-4 pt-8">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-text-primary-light dark:text-white">
                                                David L.
                                            </h3>
                                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                                Carpenter
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 rounded bg-yellow-50 px-1.5 py-0.5 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                                            <span className="material-symbols-outlined fill text-[16px]">
                                                star
                                            </span>
                                            <span className="text-xs font-bold">4.8</span>
                                        </div>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-sm">
                                        <span className="font-semibold text-text-primary-light dark:text-white">
                                            $65/hr
                                        </span>
                                        <span className="text-text-secondary-light dark:text-text-secondary-dark">
                                            • 85 jobs
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className="mt-3 h-9 w-full rounded-lg bg-primary/10 text-sm font-bold text-primary transition-colors hover:bg-primary/20"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>

                            <div className="group flex flex-col overflow-hidden rounded-xl border border-transparent bg-surface-light shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-surface-dark dark:shadow-none">
                                <div className="relative h-32 bg-gray-100">
                                    <div
                                        className={`absolute inset-0 bg-cover bg-center opacity-80 transition-opacity group-hover:opacity-100 ${styles.proCardBgLeaves}`}
                                        aria-hidden="true"
                                    />
                                    <div className="absolute -bottom-6 left-4">
                                        <div
                                            className={`size-12 rounded-full border-2 border-white bg-cover bg-center dark:border-surface-dark ${styles.proAvatarEmily}`}
                                            aria-hidden="true"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 px-4 pb-4 pt-8">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-text-primary-light dark:text-white">
                                                Emily R.
                                            </h3>
                                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                                Landscaper
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 rounded bg-yellow-50 px-1.5 py-0.5 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                                            <span className="material-symbols-outlined fill text-[16px]">
                                                star
                                            </span>
                                            <span className="text-xs font-bold">5.0</span>
                                        </div>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-sm">
                                        <span className="font-semibold text-text-primary-light dark:text-white">
                                            $55/hr
                                        </span>
                                        <span className="text-text-secondary-light dark:text-text-secondary-dark">
                                            • 42 jobs
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className="mt-3 h-9 w-full rounded-lg bg-primary/10 text-sm font-bold text-primary transition-colors hover:bg-primary/20"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>

                            <div className="group flex flex-col overflow-hidden rounded-xl border border-transparent bg-surface-light shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-surface-dark dark:shadow-none">
                                <div className="relative h-32 bg-gray-100">
                                    <div
                                        className={`absolute inset-0 bg-cover bg-center opacity-80 transition-opacity group-hover:opacity-100 ${styles.proCardBgPaint}`}
                                        aria-hidden="true"
                                    />
                                    <div className="absolute -bottom-6 left-4">
                                        <div
                                            className={`size-12 rounded-full border-2 border-white bg-cover bg-center dark:border-surface-dark ${styles.proAvatarJohn}`}
                                            aria-hidden="true"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 px-4 pb-4 pt-8">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-text-primary-light dark:text-white">
                                                John K.
                                            </h3>
                                            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                                Painter
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 rounded bg-yellow-50 px-1.5 py-0.5 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400">
                                            <span className="material-symbols-outlined fill text-[16px]">
                                                star
                                            </span>
                                            <span className="text-xs font-bold">4.7</span>
                                        </div>
                                    </div>
                                    <div className="mt-1 flex items-center gap-2 text-sm">
                                        <span className="font-semibold text-text-primary-light dark:text-white">
                                            $45/hr
                                        </span>
                                        <span className="text-text-secondary-light dark:text-text-secondary-dark">
                                            • 215 jobs
                                        </span>
                                    </div>
                                    <button
                                        type="button"
                                        className="mt-3 h-9 w-full rounded-lg bg-primary/10 text-sm font-bold text-primary transition-colors hover:bg-primary/20"
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[22px] font-bold leading-tight text-text-primary-light dark:text-white">
                                Edit profile
                            </h2>
                            <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                                Keep your contact details up to date.
                            </span>
                        </div>
                        {isLoading && (
                            <div className="rounded-lg border border-dashed border-gray-200 bg-white/60 px-4 py-3 text-sm text-text-secondary-light dark:border-gray-700 dark:bg-[#111827] dark:text-text-secondary-dark">
                                Loading profile details...
                            </div>
                        )}
                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-200">
                                {error}
                            </div>
                        )}
                        {success && (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200">
                                {success}
                            </div>
                        )}
                        <form
                            className="grid gap-4 rounded-xl border border-transparent bg-surface-light p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:border-gray-800 dark:bg-surface-dark dark:shadow-none md:grid-cols-2"
                            onSubmit={handleSubmit}
                        >
                            <label className="flex flex-col gap-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                                First name
                                <input
                                    type="text"
                                    value={form.firstName}
                                    onChange={handleChange("firstName")}
                                    placeholder="First name"
                                    disabled={isLoading || isSaving}
                                    className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-text-primary-light outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-[#111827] dark:text-white dark:disabled:bg-gray-800"
                                />
                            </label>
                            <label className="flex flex-col gap-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                                Last name
                                <input
                                    type="text"
                                    value={form.lastName}
                                    onChange={handleChange("lastName")}
                                    placeholder="Last name"
                                    disabled={isLoading || isSaving}
                                    className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-text-primary-light outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-[#111827] dark:text-white dark:disabled:bg-gray-800"
                                />
                            </label>
                            <label className="flex flex-col gap-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                                Email address
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={handleChange("email")}
                                    placeholder="you@example.com"
                                    disabled={isLoading || isSaving}
                                    className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-text-primary-light outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-[#111827] dark:text-white dark:disabled:bg-gray-800"
                                />
                            </label>
                            {(role === "Customer" || role === "Worker") && (
                                <label className="flex flex-col gap-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                                    Phone number
                                    <input
                                        type="tel"
                                        value={form.phoneNumber}
                                        onChange={handleChange("phoneNumber")}
                                        placeholder="+1 (555) 123-4567"
                                        disabled={isLoading || isSaving}
                                        className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-text-primary-light outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-[#111827] dark:text-white dark:disabled:bg-gray-800"
                                    />
                                </label>
                            )}
                            {role === "Worker" && (
                                <label className="flex flex-col gap-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                                    City
                                    <input
                                        type="text"
                                        value={form.address.city}
                                        onChange={handleAddressChange("city")}
                                        placeholder="City"
                                        disabled={isLoading || isSaving}
                                        className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-text-primary-light outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-[#111827] dark:text-white dark:disabled:bg-gray-800"
                                    />
                                </label>
                            )}
                            {role === "Worker" && (
                                <label className="flex flex-col gap-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                                    State
                                    <input
                                        type="text"
                                        value={form.address.state}
                                        onChange={handleAddressChange("state")}
                                        placeholder="State"
                                        disabled={isLoading || isSaving}
                                        className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-text-primary-light outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-[#111827] dark:text-white dark:disabled:bg-gray-800"
                                    />
                                </label>
                            )}
                            {role === "Worker" && (
                                <label className="flex flex-col gap-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                                    Postal code
                                    <input
                                        type="text"
                                        value={form.address.postalCode}
                                        onChange={handleAddressChange("postalCode")}
                                        placeholder="Postal code"
                                        disabled={isLoading || isSaving}
                                        className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-text-primary-light outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-[#111827] dark:text-white dark:disabled:bg-gray-800"
                                    />
                                </label>
                            )}
                            {role === "Worker" && (
                                <label className="flex flex-col gap-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                                    Country
                                    <input
                                        type="text"
                                        value={form.address.country}
                                        onChange={handleAddressChange("country")}
                                        placeholder="Country"
                                        disabled={isLoading || isSaving}
                                        className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-text-primary-light outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-[#111827] dark:text-white dark:disabled:bg-gray-800"
                                    />
                                </label>
                            )}
                            {role === "Worker" && (
                                <label className="flex flex-col gap-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark md:col-span-2">
                                    Street address
                                    <input
                                        type="text"
                                        value={form.address.street}
                                        onChange={handleAddressChange("street")}
                                        placeholder="Street address"
                                        disabled={isLoading || isSaving}
                                        className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-text-primary-light outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-[#111827] dark:text-white dark:disabled:bg-gray-800"
                                    />
                                </label>
                            )}
                            {(role === "Customer" || role === "Admin") && (
                                <label className="flex flex-col gap-2 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark md:col-span-2">
                                    Password (optional)
                                    <input
                                        type="password"
                                        value={form.password}
                                        onChange={handleChange("password")}
                                        placeholder="Enter a new password"
                                        disabled={isLoading || isSaving}
                                        className="h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm text-text-primary-light outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-700 dark:bg-[#111827] dark:text-white dark:disabled:bg-gray-800"
                                    />
                                </label>
                            )}
                            <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-2">
                                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                                    Changes will be saved to your account profile.
                                </p>
                                <button
                                    type="submit"
                                    disabled={isLoading || isSaving}
                                    className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-6 text-sm font-bold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-300"
                                >
                                    {isSaving ? "Saving..." : "Save changes"}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
};
