import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";
import {
    registerWorkerSchema,
    type RegisterWorkerFormValues,
} from "./auth.schema";
import styles from "./auth.module.css";

export const RegisterWorkerPage = () => {
    const { registerWorker } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterWorkerFormValues>({
        resolver: zodResolver(registerWorkerSchema),
    });

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
        <div className={styles.container}>
            <div className={styles.card}>
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="size-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
                        <span className="material-symbols-outlined text-3xl">construction</span>
                    </div>
                    <h1>Join as a Professional</h1>
                    <p>Start growing your business and reaching more customers</p>
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
                            placeholder="e.g. Alex"
                            error={errors.firstName?.message}
                            {...register("firstName")}
                        />
                        <Input
                            label="Last Name"
                            placeholder="e.g. Smith"
                            error={errors.lastName?.message}
                            {...register("lastName")}
                        />
                    </div>
                    <div className={styles.row}>
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="alex@example.com"
                            autoComplete="email"
                            error={errors.email?.message}
                            {...register("email")}
                        />
                        <Input
                            label="Phone Number"
                            type="tel"
                            placeholder="0123 456 789"
                            autoComplete="tel"
                            error={errors.phoneNumber?.message}
                            {...register("phoneNumber")}
                        />
                    </div>

                    <div className={styles.divider}>Professional Info</div>

                    <div className={styles.row}>
                        <Input
                            label="Experience (Years)"
                            type="number"
                            placeholder="e.g. 5"
                            error={errors.yearsOfExperience?.message}
                            {...register("yearsOfExperience", { valueAsNumber: true })}
                        />
                        <Input
                            label="Rate (VND/hr)"
                            type="number"
                            placeholder="e.g. 200000"
                            error={errors.hourlyRate?.message}
                            {...register("hourlyRate", { valueAsNumber: true })}
                        />
                    </div>

                    <div className={styles.divider}>Location</div>

                    <Input
                        label="Street Address"
                        placeholder="e.g. 123 Main St"
                        error={errors.address?.street?.message}
                        {...register("address.street")}
                    />
                    <div className={styles.row}>
                        <Input
                            label="City"
                            placeholder="Springfield"
                            error={errors.address?.city?.message}
                            {...register("address.city")}
                        />
                        <Input
                            label="State"
                            placeholder="IL"
                            error={errors.address?.state?.message}
                            {...register("address.state")}
                        />
                    </div>
                    <div className={styles.row}>
                        <Input
                            label="Postal Code"
                            placeholder="62701"
                            error={errors.address?.postalCode?.message}
                            {...register("address.postalCode")}
                        />
                        <Input
                            label="Country"
                            placeholder="USA"
                            error={errors.address?.country?.message}
                            {...register("address.country")}
                        />
                    </div>

                    <div className={styles.divider}>Security</div>

                    <div className={styles.row}>
                        <Input
                            label="Password"
                            type="password"
                            placeholder="Min. 8 chars"
                            autoComplete="new-password"
                            error={errors.password?.message}
                            {...register("password")}
                        />
                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="Repeat password"
                            autoComplete="new-password"
                            error={errors.confirmPassword?.message}
                            {...register("confirmPassword")}
                        />
                    </div>

                    <Button type="submit" fullWidth disabled={isSubmitting}>
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                Setting up profile...
                            </div>
                        ) : (
                            "Create Worker Account"
                        )}
                    </Button>
                </form>

                <div className={styles.inlineActions}>
                    Already have an account?
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
