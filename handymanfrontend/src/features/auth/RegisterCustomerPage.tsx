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
                <h1>Register as customer</h1>
                <p>Book services and manage your jobs.</p>
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
