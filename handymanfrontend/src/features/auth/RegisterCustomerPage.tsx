import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
    registerCustomerSchema,
    type RegisterCustomerFormValues,
} from "./auth.schema";

export const RegisterCustomerPage = () => {
    const { registerCustomer } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterCustomerFormValues>({
        resolver: zodResolver(registerCustomerSchema),
    });

    const onSubmit = async (values: RegisterCustomerFormValues) => {
        try {
            setError(null);
            await registerCustomer(values);
            navigate("/profile");
        } catch (err) {
            setError("Registration failed. Please try again.");
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-background-light p-4 font-sans antialiased transition-colors duration-300">
            <div className="flex min-h-[700px] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-card-light shadow-xl md:flex-row">
                <div className="relative hidden overflow-hidden bg-primary md:flex md:w-5/12">
                    <img
                        className="absolute inset-0 h-full w-full object-cover opacity-70 mix-blend-overlay"
                        alt="Professional handyman repairing a home interior"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuC9LxERRbDxRc9Vzrrm5lCi7rxkWfOdQ98nFFij56rW1aW089aeJ873IZKmRyC-wZkCHjea5K7wA4OHCvYVbbqNv5SdIotrvBhX3YguYjEEGRpn91_OIlt2UYhenejoEJmc4QYasI4OTsYopTAdWL9kgtFBTYp1fELaymC8GnbYSNvtC3qubwwGX4uXveAB1vz5Uw8xF1gL9gkxePhneETAX6DKhYqUWL-ThMx79jO-II-UHNsy8xcRol_NoeaRuIkFYQcHl3pDdWpz"
                    />
                    <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
                        <div>
                            <h2 className="mb-4 text-3xl font-bold leading-tight">
                                Expert repairs,
                                <br />
                                right at your doorstep.
                            </h2>
                            <p className="text-lg text-gray-300">
                                Join our community to book trusted professionals for all your home
                                needs.
                            </p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                            <span className="material-icons-outlined text-base">verified_user</span>
                            <span>Verified Professionals</span>
                        </div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent" />
                </div>
                <div className="w-full overflow-y-auto p-8 md:w-7/12 md:p-12 lg:p-16">
                    <div className="mb-8">
                        <Link
                            className="group mb-6 inline-flex items-center text-sm text-gray-500 transition-colors hover:text-accent"
                            to="/auth/register"
                        >
                            <span className="material-icons-outlined mr-1 text-lg transition-transform group-hover:-translate-x-1">
                                ⬅
                            </span>
                            Back to account types
                        </Link>
                        <h1 className="mb-2 text-2xl font-bold text-gray-900 md:text-3xl">
                            Register as customer
                        </h1>
                        <p className="text-gray-600">Book services and manage your jobs seamlessly.</p>
                    </div>
                    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                    htmlFor="firstName"
                                >
                                    First name
                                </label>
                                <input
                                    id="firstName"
                                    className="w-full rounded-lg border border-border-light bg-input-light px-4 py-2.5 text-gray-900 transition-all placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-primary"
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
                            <div>
                                <label
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                    htmlFor="lastName"
                                >
                                    Last name
                                </label>
                                <input
                                    id="lastName"
                                    className="w-full rounded-lg border border-border-light bg-input-light px-4 py-2.5 text-gray-900 transition-all placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-primary"
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
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <span className="material-icons-outlined text-lg">email</span>
                                </span>
                                <input
                                    id="email"
                                    className="w-full rounded-lg border border-border-light bg-input-light py-2.5 pl-10 pr-4 text-gray-900 transition-all placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-primary"
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
                        <div>
                            <label
                                className="mb-1 block text-sm font-medium text-gray-700"
                                htmlFor="phone"
                            >
                                Phone number
                            </label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                                    <span className="material-icons-outlined text-lg">phone</span>
                                </span>
                                <input
                                    id="phone"
                                    className="w-full rounded-lg border border-border-light bg-input-light py-2.5 pl-10 pr-4 text-gray-900 transition-all placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-primary"
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
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                    htmlFor="password"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    className="w-full rounded-lg border border-border-light bg-input-light px-4 py-2.5 text-gray-900 transition-all placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-primary"
                                    placeholder="••••••••"
                                    type="password"
                                    autoComplete="new-password"
                                    {...register("password")}
                                />
                                {errors.password?.message ? (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.password.message}
                                    </p>
                                ) : null}
                            </div>
                            <div>
                                <label
                                    className="mb-1 block text-sm font-medium text-gray-700"
                                    htmlFor="confirmPassword"
                                >
                                    Confirm password
                                </label>
                                <input
                                    id="confirmPassword"
                                    className="w-full rounded-lg border border-border-light bg-input-light px-4 py-2.5 text-gray-900 transition-all placeholder-gray-400 focus:border-transparent focus:ring-2 focus:ring-primary"
                                    placeholder="••••••••"
                                    type="password"
                                    autoComplete="new-password"
                                    {...register("confirmPassword")}
                                />
                                {errors.confirmPassword?.message ? (
                                    <p className="mt-1 text-xs text-red-500">
                                        {errors.confirmPassword.message}
                                    </p>
                                ) : null}
                            </div>
                        </div>
                        {error ? (
                            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                                {error}
                            </div>
                        ) : null}
                        <button
                            className="mt-2 w-full rounded-lg bg-primary px-4 py-3 font-semibold text-black shadow-md transition-all hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Creating..." : "Create account"}
                        </button>
                    </form>
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="bg-card-light px-2 text-gray-500">Or continue with</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            className="flex w-full items-center justify-center rounded-lg border border-border-light bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                            type="button"
                        >
                            <svg aria-hidden="true" className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                                <path
                                    d="M12.0003 20.45c4.6667 0 8.45-3.7833 8.45-8.45 0-4.6667-3.7833-8.45-8.45-8.45-4.6667 0-8.45 3.7833-8.45 8.45 0 4.6667 3.7833 8.45 8.45 8.45Z"
                                    fill="#fff"
                                    fillOpacity="0"
                                    stroke="none"
                                />
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </button>
                        <button
                            className="flex w-full items-center justify-center rounded-lg border border-border-light bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                            type="button"
                        >
                            <svg aria-hidden="true" className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.684.816-1.813 1.508-2.978 1.508-.06 0-.11 0-.17-.008.06-1.22.6-2.367 1.258-3.174.658-.808 1.76-1.492 2.887-1.492.06 0 .12 0 .18.008zm-4.76 3.635c.106-1.125.755-2.316 1.433-3.08.678-.763 1.734-1.393 2.72-1.393.104 0 .208.006.31.018-.086 1.13-.585 2.253-1.263 3.017-.678.763-1.787 1.45-2.89 1.45-.104 0-.208-.006-.31-.012zm5.72 13.918c-1.175 1.72-2.395 3.39-4.275 3.42-1.076.017-1.928-.68-2.946-.68-1.017 0-2.052.664-3.01.697-2.022.067-3.563-2.016-4.834-4.555-2.61-5.207-.674-8.87 2.454-9.02 1.246-.06 2.285.83 2.946.83.662 0 1.838-.973 3.193-.83 1.13.12 2.37.585 3.033 1.543-2.677 1.63-2.22 5.43.513 6.586-.54 1.35-1.218 2.68-2.073 4.01z" />
                            </svg>
                            Apple
                        </button>
                    </div>
                    <div className="mt-8 text-center text-sm text-gray-500">
                        Already have an account?{" "}
                        <Link className="font-medium text-accent hover:text-blue-600" to="/auth/login">
                            Log in
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    );
};
