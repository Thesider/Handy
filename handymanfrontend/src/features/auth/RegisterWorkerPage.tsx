import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
    registerWorkerSchema,
    type RegisterWorkerFormValues,
} from "./auth.schema";

export const RegisterWorkerPage = () => {
    const { registerWorker } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting, isValid, isDirty },
    } = useForm<RegisterWorkerFormValues>({
        resolver: zodResolver(registerWorkerSchema),
        mode: "onChange",
    });

    const canSubmit = isValid && isDirty && !isSubmitting;

    const onSubmit = async (values: RegisterWorkerFormValues) => {
        try {
            setError(null);
            await registerWorker(values);
            navigate("/profile/worker");
        } catch (err) {
            setError("Registration failed. Please try again.");
        }
    };

    return (
        <main className="flex min-h-screen flex-col bg-background-light font-sans text-gray-900">
            <div className="flex grow items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-5xl overflow-hidden rounded-xl bg-card-light shadow-soft">
                    <div className="border-b border-gray-200 bg-gray-50 p-6 md:p-8">
                        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                            <div>
                                <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
                                    Register as a Worker
                                </h1>
                                <p className="text-gray-500">
                                    Showcase your skills and get booked quickly.
                                </p>
                            </div>
                            <div className="text-sm">
                                <span className="text-gray-500">Already have an account?</span>
                                <Link className="ml-1 font-medium text-accent hover:underline" to="/auth/login">
                                    Log in
                                </Link>
                            </div>
                        </div>
                        <div className="w-full">
                            <div className="mb-2 flex justify-between text-xs font-semibold uppercase text-gray-500">
                            </div>
                            <div className="h-2.5 w-full rounded-full bg-gray-200">
                            </div>
                        </div>
                    </div>
                    <form className="p-6 md:p-8" onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
                            <div className="space-y-8 lg:col-span-5">
                                <div className="group cursor-pointer rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6 text-center transition hover:bg-gray-100">
                                    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-200 transition-transform group-hover:scale-105">
                                        <span className="material-icons text-4xl text-gray-400">
                                            add_a_photo
                                        </span>
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900">
                                        Upload Profile Photo
                                    </h3>
                                    <p className="mt-1 text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                </div>
                                <div>
                                    <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                                        <span className="material-icons mr-2 text-xl text-gray-400">
                                            person
                                        </span>
                                        Personal Information
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2 sm:col-span-1">
                                                <label
                                                    className="mb-1 block text-sm font-medium text-gray-700"
                                                    htmlFor="first-name"
                                                >
                                                    First name
                                                </label>
                                                <input
                                                    id="first-name"
                                                    className="block w-full rounded-md border-gray-300 bg-white py-2.5 text-gray-900 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                                                    placeholder="Jane"
                                                    type="text"
                                                    {...register("firstName")}
                                                />
                                                {errors.firstName?.message ? (
                                                    <p className="mt-1 text-xs text-red-500">
                                                        {errors.firstName.message}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <div className="col-span-2 sm:col-span-1">
                                                <label
                                                    className="mb-1 block text-sm font-medium text-gray-700"
                                                    htmlFor="last-name"
                                                >
                                                    Last name
                                                </label>
                                                <input
                                                    id="last-name"
                                                    className="block w-full rounded-md border-gray-300 bg-white py-2.5 text-gray-900 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                                                    placeholder="Doe"
                                                    type="text"
                                                    {...register("lastName")}
                                                />
                                                {errors.lastName?.message ? (
                                                    <p className="mt-1 text-xs text-red-500">
                                                        {errors.lastName.message}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div>
                                            <label
                                                className="mb-1 block text-sm font-medium text-gray-700"
                                                htmlFor="email"
                                            >
                                                Email address
                                            </label>
                                            <div className="relative rounded-md shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="material-icons text-lg text-gray-400">
                                                        mail
                                                    </span>
                                                </div>
                                                <input
                                                    id="email"
                                                    className="block w-full rounded-md border-gray-300 bg-white py-2.5 pl-10 text-gray-900 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                                                    placeholder="you@example.com"
                                                    type="email"
                                                    autoComplete="email"
                                                    {...register("email")}
                                                />
                                            </div>
                                            {errors.email?.message ? (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {errors.email.message}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div className="pt-2">
                                            <label
                                                className="mb-1 block text-sm font-medium text-gray-700"
                                                htmlFor="password"
                                            >
                                                Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="password"
                                                    className="block w-full rounded-md border-gray-300 bg-white py-2.5 pr-12 text-gray-900 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                                                    type={showPassword ? "text" : "password"}
                                                    autoComplete="new-password"
                                                    {...register("password")}
                                                />
                                                <button
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition hover:text-gray-600"
                                                    type="button"
                                                    onClick={() => setShowPassword((prev) => !prev)}
                                                    aria-label={
                                                        showPassword ? "Hide password" : "Show password"
                                                    }
                                                >
                                                    <span className="material-icons text-lg">
                                                        {showPassword ? "visibility_off" : "visibility"}
                                                    </span>
                                                </button>
                                            </div>
                                            {errors.password?.message ? (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {errors.password.message}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div>
                                            <label
                                                className="mb-1 block text-sm font-medium text-gray-700"
                                                htmlFor="confirm-password"
                                            >
                                                Confirm password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    id="confirm-password"
                                                    className="block w-full rounded-md border-gray-300 bg-white py-2.5 pr-12 text-gray-900 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                                                    type={showConfirmPassword ? "text" : "password"}
                                                    autoComplete="new-password"
                                                    {...register("confirmPassword")}
                                                />
                                                <button
                                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition hover:text-gray-600"
                                                    type="button"
                                                    onClick={() =>
                                                        setShowConfirmPassword((prev) => !prev)
                                                    }
                                                    aria-label={
                                                        showConfirmPassword
                                                            ? "Hide confirm password"
                                                            : "Show confirm password"
                                                    }
                                                >
                                                    <span className="material-icons text-lg">
                                                        {showConfirmPassword
                                                            ? "visibility_off"
                                                            : "visibility"}
                                                    </span>
                                                </button>
                                            </div>
                                            {errors.confirmPassword?.message ? (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {errors.confirmPassword.message}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div>
                                            <label
                                                className="mb-1 block text-sm font-medium text-gray-700"
                                                htmlFor="phone"
                                            >
                                                Phone number
                                            </label>
                                            <div className="relative rounded-md shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="material-icons text-lg text-gray-400">
                                                        phone
                                                    </span>
                                                </div>
                                                <input
                                                    id="phone"
                                                    className="block w-full rounded-md border-gray-300 bg-white py-2.5 pl-10 text-gray-900 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                                                    placeholder="+1 (555) 000-0000"
                                                    type="tel"
                                                    autoComplete="tel"
                                                    {...register("phoneNumber")}
                                                />
                                            </div>
                                            {errors.phoneNumber?.message ? (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {errors.phoneNumber.message}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-8 lg:col-span-7">
                                <div>
                                    <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                                        <span className="material-icons mr-2 text-xl text-gray-400">
                                            work
                                        </span>
                                        Professional Details
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <div>
                                            <label
                                                className="mb-1 block text-sm font-medium text-gray-700"
                                                htmlFor="rate"
                                            >
                                                Hourly rate ($)
                                            </label>
                                            <div className="relative rounded-md shadow-sm">
                                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                                    <span className="text-sm text-gray-500">$</span>
                                                </div>
                                                <input
                                                    id="rate"
                                                    className="block w-full rounded-md border-gray-300 bg-white py-2.5 pl-7 pr-12 text-gray-900 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                                                    placeholder="0.00"
                                                    type="number"
                                                    {...register("hourlyRate", { valueAsNumber: true })}
                                                />
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <span className="text-sm text-gray-500">USD</span>
                                                </div>
                                            </div>
                                            {errors.hourlyRate?.message ? (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {errors.hourlyRate.message}
                                                </p>
                                            ) : null}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="mb-4 flex items-center text-lg font-semibold text-gray-900">
                                        <span className="material-icons mr-2 text-xl text-gray-400">
                                            location_on
                                        </span>
                                        Location
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label
                                                className="mb-1 block text-sm font-medium text-gray-700"
                                                htmlFor="street"
                                            >
                                                Street address
                                            </label>
                                            <input
                                                id="street"
                                                className="block w-full rounded-md border-gray-300 bg-white py-2.5 text-gray-900 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                                                placeholder="123 Main St"
                                                type="text"
                                                {...register("address.street")}
                                            />
                                            {errors.address?.street?.message ? (
                                                <p className="mt-1 text-xs text-red-500">
                                                    {errors.address.street.message}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div className="grid grid-cols-6 gap-4">
                                            <div className="col-span-6 sm:col-span-3">
                                                <label
                                                    className="mb-1 block text-sm font-medium text-gray-700"
                                                    htmlFor="city"
                                                >
                                                    City
                                                </label>
                                                <input
                                                    id="city"
                                                    className="block w-full rounded-md border-gray-300 bg-white py-2.5 text-gray-900 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                                                    type="text"
                                                    {...register("address.city")}
                                                />
                                                {errors.address?.city?.message ? (
                                                    <p className="mt-1 text-xs text-red-500">
                                                        {errors.address.city.message}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <div className="col-span-6 sm:col-span-3">
                                                <label
                                                    className="mb-1 block text-sm font-medium text-gray-700"
                                                    htmlFor="state"
                                                >
                                                    State / Province
                                                </label>
                                                <input
                                                    id="state"
                                                    className="block w-full rounded-md border-gray-300 bg-white py-2.5 text-gray-900 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                                                    type="text"
                                                    {...register("address.state")}
                                                />
                                                {errors.address?.state?.message ? (
                                                    <p className="mt-1 text-xs text-red-500">
                                                        {errors.address.state.message}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <div className="col-span-6 sm:col-span-3">
                                                <label
                                                    className="mb-1 block text-sm font-medium text-gray-700"
                                                    htmlFor="postal-code"
                                                >
                                                    Postal code
                                                </label>
                                                <input
                                                    id="postal-code"
                                                    className="block w-full rounded-md border-gray-300 bg-white py-2.5 text-gray-900 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                                                    type="text"
                                                    {...register("address.postalCode")}
                                                />
                                                {errors.address?.postalCode?.message ? (
                                                    <p className="mt-1 text-xs text-red-500">
                                                        {errors.address.postalCode.message}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <div className="col-span-6 sm:col-span-3">
                                                <label
                                                    className="mb-1 block text-sm font-medium text-gray-700"
                                                    htmlFor="country"
                                                >
                                                    Country
                                                </label>
                                                <select
                                                    id="country"
                                                    className="block w-full rounded-md border-gray-300 bg-white py-2.5 text-gray-900 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
                                                    {...register("address.country")}
                                                >
                                                    <option value="United States">United States</option>
                                                    <option value="Canada">Canada</option>
                                                    <option value="United Kingdom">United Kingdom</option>
                                                    <option value="Australia">Australia</option>
                                                </select>
                                                {errors.address?.country?.message ? (
                                                    <p className="mt-1 text-xs text-red-500">
                                                        {errors.address.country.message}
                                                    </p>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {error ? (
                            <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                                {error}
                            </div>
                        ) : null}
                        <div className="mt-12 flex flex-col-reverse items-center justify-between gap-4 border-t border-gray-200 pt-6 sm:flex-row">
                            <Link
                                className="flex items-center text-sm font-medium text-gray-500 transition hover:text-gray-900"
                                to="/auth/register"
                            >
                                <svg
                                    className="mr-2 h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M15 18l-6-6 6-6" />
                                </svg>
                                Back to account types
                            </Link>
                            <button
                                className={`flex w-full items-center justify-center rounded-md px-8 py-3 text-base font-medium shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 sm:w-auto ${canSubmit
                                        ? "bg-primary text-white hover:bg-primary-hover focus:ring-primary"
                                        : "cursor-not-allowed border border-gray-200 bg-gray-100 text-gray-400 focus:ring-gray-200"
                                    }`}
                                type="submit"
                                disabled={!canSubmit}
                            >
                                {isSubmitting ? "Creating..." : "Create Account"}
                                <svg
                                    className="ml-2 h-4 w-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                >
                                    <path d="M9 6l6 6-6 6" />
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </main>
    );
};
