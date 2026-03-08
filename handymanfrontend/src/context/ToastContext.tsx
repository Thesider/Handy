import type { ReactNode } from "react";
import { createContext, useContext, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Toast.module.css";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
    routeTo?: string;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType, routeTo?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = "success", routeTo?: string) => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type, routeTo }]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3000);
    }, []);

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const handleToastClick = (toast: Toast) => {
        if (toast.routeTo) {
            navigate(toast.routeTo);
        }
        removeToast(toast.id);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className={styles.container}>
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`${styles.toast} ${styles[toast.type]}`}
                        onClick={() => handleToastClick(toast)}
                    >
                        <span className={styles.message}>{toast.message}</span>
                        {toast.routeTo ? <span className={styles.action}>Open</span> : null}
                        <span className={styles.close}>&times;</span>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};
