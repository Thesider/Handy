import { Link } from "react-router-dom";
import { Button } from "../components/common/Button";
import styles from "./NotFoundPage.module.css";

export const NotFoundPage = () => {
    return (
        <div className={styles.container}>
            <h1>Page not found</h1>
            <p>Let’s get you back to a safe place.</p>
            <Link to="/">
                <Button variant="secondary">Go home</Button>
            </Link>
        </div>
    );
};
