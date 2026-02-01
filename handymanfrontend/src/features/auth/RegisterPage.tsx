import { Link } from "react-router-dom";
import styles from "./auth.module.css";

export const RegisterPage = () => {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className="text-center mb-8">
                    <h1>Join our community</h1>
                    <p>Select the type of account you'd like to create</p>
                </div>

                <div className={styles.choiceGrid}>
                    <Link to="/auth/register/customer" className={styles.choiceCard}>
                        <h3>
                            <span className="material-symbols-outlined icon">person</span>
                            Customer Account
                        </h3>
                        <p>I want to find and book professional handymen for my home projects.</p>
                        <div className="mt-auto pt-2 text-primary font-bold text-sm flex items-center gap-1">
                            Register as Customer
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </div>
                    </Link>

                    <Link to="/auth/register/worker" className={styles.choiceCard}>
                        <h3>
                            <span className="material-symbols-outlined icon">handyman</span>
                            Worker Account
                        </h3>
                        <p>I am a professional looking to showcase my skills and grow my business.</p>
                        <div className="mt-auto pt-2 text-primary font-bold text-sm flex items-center gap-1">
                            Register as Worker
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </div>
                    </Link>
                </div>

                <div className={styles.inlineActions}>
                    Already have an account?
                    <Link to="/auth/login">Sign in here</Link>
                </div>
            </div>
        </div>
    );
};
