import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getServices, getWorkerById } from "../../api/handyman.api";
import { BookingForm } from "../booking/BookingForm";
import { formatCurrency } from "../../utils/validators";
import type { Service, Worker } from "./handyman.types";
import styles from "./HandymanDetailPage.module.css";

export const HandymanDetailPage = () => {
    const { id } = useParams();
    const [worker, setWorker] = useState<Worker | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const [workerData, serviceData] = await Promise.all([
                    getWorkerById(Number(id)),
                    getServices(),
                ]);
                setWorker(workerData);
                setServices(serviceData);
                setError(null);
            } catch (err) {
                setError("Unable to load this handyman profile.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    const availableServices = useMemo(() => services.slice(0, 6), [services]);

    if (loading) {
        return (
            <div className={styles.container}>
                <div className={`${styles.profile} ${styles.skeletonCard}`}>
                    <div className={`${styles.skeleton} ${styles.skeletonTitle}`} />
                    <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
                    <div className={`${styles.skeleton} ${styles.skeletonLine}`} />
                </div>
                <div className={styles.content}>
                    <div className={`${styles.section} ${styles.skeletonCard}`} />
                    <div className={`${styles.section} ${styles.skeletonCard}`} />
                </div>
            </div>
        );
    }

    if (error || !worker) {
        return <div className={styles.error}>{error ?? "Not found"}</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.profile}>
                <div>
                    <h1>
                        {worker.firstName} {worker.lastName}
                    </h1>
                    <p>{worker.email}</p>
                    <p>
                        {worker.address.city}, {worker.address.state}
                    </p>
                    <div className={styles.badges}>
                        <span>{worker.yearsOfExperience}+ yrs experience</span>
                        <span>{worker.rating}★ rating</span>
                        <span>{formatCurrency(worker.hourlyRate)}/hr</span>
                    </div>
                </div>
                <div
                    className={
                        worker.isAvailable
                            ? styles.availability
                            : styles.availabilityBlocked
                    }
                >
                    {worker.isAvailable ? "Available now" : "Booked today"}
                </div>
            </div>

            <div className={styles.content}>
                <section className={styles.section}>
                    <h2>Popular services</h2>
                    <ul className={styles.services}>
                        {availableServices.map((service) => (
                            <li key={service.serviceId}>{service.serviceName}</li>
                        ))}
                    </ul>
                </section>
                <section className={styles.section}>
                    <h2>Next step: request a booking</h2>
                    <p className={styles.helper}>
                        Pick a service and time below. Your customer ID is stored in Profile.
                    </p>
                    <BookingForm workerId={worker.workerId} services={services} />
                </section>
            </div>
        </div>
    );
};
