import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, id, className, ...props }, ref) => {
        const inputId = id ?? props.name ?? label;
        return (
            <div className={styles.field}>
                <label htmlFor={inputId} className={styles.label}>
                    {label}
                </label>
                <input
                    id={inputId}
                    ref={ref}
                    className={[styles.input, error ? styles.error : "", className ?? ""]
                        .filter(Boolean)
                        .join(" ")}
                    {...props}
                />
                {error ? <span className={styles.helper}>{error}</span> : null}
            </div>
        );
    }
);

Input.displayName = "Input";
