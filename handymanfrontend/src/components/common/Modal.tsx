import type { ReactNode } from "react";
import styles from "./Modal.module.css";

type ModalProps = {
    title: string;
    open: boolean;
    onClose: () => void;
    children: ReactNode;
};

export const Modal = ({ title, open, onClose, children }: ModalProps) => {
    if (!open) return null;

    return (
        <div className={styles.backdrop} role="dialog" aria-modal="true">
            <div className={styles.modal}>
                <header className={styles.header}>
                    <h3>{title}</h3>
                    <button onClick={onClose} aria-label="Close" className={styles.close}>
                        ✕
                    </button>
                </header>
                <div className={styles.body}>{children}</div>
            </div>
        </div>
    );
};
