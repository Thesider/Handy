import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";
import {
    registerCustomerSchema,
    type RegisterCustomerFormValues,
} from "./auth.schema";
import styles from "./auth.module.css";

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
        <div className={styles.container}>
            <div className={styles.card}>
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
                        <span className="material-symbols-outlined text-3xl">person_add</span>
                    </div>
                    <h1>Create Customer Account</h1>
                    <p>Start booking professional services for your projects</p>
                </div>

                {error ? (
                    <div className={`${styles.error} mb-6`}>
                        <span className="material-symbols-outlined text-lg">error</span>
                        {error}
                    </div>
                ) : null}

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <div className={styles.row}>
                        <Input
                            label="First Name"
                            placeholder="e.g. John"
                            error={errors.firstName?.message}
                            {...register("firstName")}
                        />
                        <Input
                            label="Last Name"
                            placeholder="e.g. Doe"
                            error={errors.lastName?.message}
                            {...register("lastName")}
                        />
                    </div>
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="john.doe@example.com"
                        autoComplete="email"
                        error={errors.email?.message}
                        {...register("email")}
                    />
                    <Input
                        label="Phone Number"
                        type="tel"
                        placeholder="e.g. 0123 456 789"
                        autoComplete="tel"
                        error={errors.phoneNumber?.message}
                        {...register("phoneNumber")}
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                        error={errors.password?.message}
                        {...register("password")}
                    />
                    <Input
                        label="Confirm Password"
                        type="password"
                        placeholder="Repeat your password"
                        autoComplete="new-password"
                        error={errors.confirmPassword?.message}
                        {...register("confirmPassword")}
                    />

                    <Button type="submit" fullWidth disabled={isSubmitting}>
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                Creating Account...
                            </div>
                        ) : (
                            "Create Customer Account"
                        )}
                    </Button>
                </form>

                <div className={styles.inlineActions}>
                    <span>Already have an account?</span>
                    <Link to="/auth/login">Sign in</Link>
                </div>

                <Link to="/auth/register" className={styles.guestLink}>
                    <span className="flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-sm">arrow_back_ios</span>
                        Back to choices
                    </span>
                </Link>
            </div>
        </div>
    );
};
