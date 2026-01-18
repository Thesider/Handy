import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { useAuth } from "../../hooks/useAuth";
import { loginSchema, type LoginFormValues } from "./auth.schema";
import { getStoredUser } from "../../utils/tokenStorage";
import styles from "./auth.module.css";

export const LoginPage = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (values: LoginFormValues) => {
        try {
            setError(null);
            await login(values);
            const nextUser = getStoredUser();
            if (nextUser?.role === "Admin") {
                navigate("/admin");
                return;
            }
            if (nextUser?.role === "Worker") {
                navigate("/profile/worker");
                return;
            }
            navigate("/profile");
        } catch (err) {
            setError("Login failed. Please check your credentials.");
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1>Welcome back</h1>
                <p>Sign in to manage bookings or your worker profile.</p>
                <div className={styles.inlineActions}>
                    <Link to="/auth/register/customer">Create customer account</Link>
                    <Link to="/auth/register/worker">Join as worker</Link>
                    <Link to="/handymen">Browse as guest</Link>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <Input
                        label="Email"
                        type="email"
                        autoComplete="email"
                        error={errors.email?.message}
                        {...register("email")}
                    />
                    <Input
                        label="Password"
                        type="password"
                        autoComplete="current-password"
                        error={errors.password?.message}
                        {...register("password")}
                    />
                    {error ? <div className={styles.error}>{error}</div> : null}
                    <Button type="submit" fullWidth disabled={isSubmitting}>
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </Button>
                </form>
            </div>
        </div>
    );
};
