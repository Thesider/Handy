import { Link } from "react-router-dom";
import { Button } from "../../components/common/Button";
import styles from "./auth.module.css";

export const RegisterPage = () => {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1>Create your account</h1>
                <p>Most people start as customers to book jobs.</p>
                <div className={styles.choiceGrid}>
                    <div className={styles.choiceCard}>
                        <h3>Customer</h3>
                        <p>Book trusted handymen and manage your jobs.</p>
                        <Link to="/auth/register/customer">
                            <Button fullWidth>Register as customer</Button>
                        </Link>
                    </div>
                    <div className={styles.choiceCard}>
                        <h3>Worker</h3>
                        <p>Showcase your skills and accept new bookings.</p>
                        <Link to="/auth/register/worker">
                            <Button variant="secondary" fullWidth>
                                Register as worker
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
