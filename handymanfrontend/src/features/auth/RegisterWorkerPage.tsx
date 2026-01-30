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
                <h1>Register as worker</h1>
                <p>Showcase your skills and get booked quickly.</p>
                <div className={styles.inlineActions}>
                    <Link to="/auth/login">Already have an account?</Link>
                    <Link to="/auth/register">Back to account types</Link>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <div className={styles.row}>
                        <Input
                            label="First name"
                            error={errors.firstName?.message}
                            {...register("firstName")}
                        />
                        <Input
                            label="Last name"
                            error={errors.lastName?.message}
                            {...register("lastName")}
                        />
                    </div>
                    <Input
                        label="Email"
                        type="email"
                        autoComplete="email"
                        error={errors.email?.message}
                        {...register("email")}
                    />
                    <Input
                        label="Phone number"
                        type="tel"
                        autoComplete="tel"
                        error={errors.phoneNumber?.message}
                        {...register("phoneNumber")}
                    />
                    <div className={styles.row}>
                        <Input
                            label="Years of experience"
                            type="number"
                            error={errors.yearsOfExperience?.message}
                            {...register("yearsOfExperience", { valueAsNumber: true })}
                        />
                        <Input
                            label="Hourly rate"
                            type="number"
                            error={errors.hourlyRate?.message}
                            {...register("hourlyRate", { valueAsNumber: true })}
                        />
                    </div>
                    <Input
                        label="Street"
                        error={errors.address?.street?.message}
                        {...register("address.street")}
                    />
                    <div className={styles.row}>
                        <Input
                            label="City"
                            error={errors.address?.city?.message}
                            {...register("address.city")}
                        />
                        <Input
                            label="State"
                            error={errors.address?.state?.message}
                            {...register("address.state")}
                        />
                    </div>
                    <div className={styles.row}>
                        <Input
                            label="Postal code"
                            error={errors.address?.postalCode?.message}
                            {...register("address.postalCode")}
                        />
                        <Input
                            label="Country"
                            error={errors.address?.country?.message}
                            {...register("address.country")}
                        />
                    </div>
                    <Input
                        label="Password"
                        type="password"
                        autoComplete="new-password"
                        error={errors.password?.message}
                        {...register("password")}
                    />
                    <Input
                        label="Confirm password"
                        type="password"
                        autoComplete="new-password"
                        error={errors.confirmPassword?.message}
                        {...register("confirmPassword")}
                    />
                    {error ? <div className={styles.error}>{error}</div> : null}
                    <Button type="submit" fullWidth disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create account"}
                    </Button>
                </form>
            </div>
        </div>
    );
};
