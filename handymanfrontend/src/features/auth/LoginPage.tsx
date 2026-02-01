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
                <div className="flex flex-col items-center text-center mb-8">
                    <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary">
                        <span className="material-symbols-outlined text-4xl">lock_open</span>
                    </div>
                    <h1>Welcome back</h1>
                    <p>Enter your credentials to access your account</p>
                </div>

                {error ? (
                    <div className={`${styles.error} mb-6`}>
                        <span className="material-symbols-outlined text-lg">error</span>
                        {error}
                    </div>
                ) : null}

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="e.g. alex@example.com"
                        autoComplete="email"
                        error={errors.email?.message}
                        {...register("email")}
                    />
                    <Input
                        label="Password"
                        type="password"
                        placeholder="••••••••"
                        autoComplete="current-password"
                        error={errors.password?.message}
                        {...register("password")}
                    />

                    <div className="flex items-center justify-end">
                        <Link to="/auth/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                            Forgot password?
                        </Link>
                    </div>

                    <Button type="submit" fullWidth disabled={isSubmitting}>
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                                Signing in...
                            </div>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>

                <div className={styles.divider}>OR</div>

                <div className={styles.inlineActions}>
                    Don't have an account?
                    <Link to="/auth/register">Create one</Link>
                </div>

                <Link to="/handymen" className={styles.guestLink}>
                    <span className="flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to browsing
                    </span>
                </Link>
            </div>
        </div>
    );
};
