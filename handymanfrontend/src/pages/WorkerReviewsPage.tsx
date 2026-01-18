import { useEffect, useState } from "react";
import { WorkerDashboardShell } from "../components/layout/WorkerDashboardShell";
import { useAuth } from "../hooks/useAuth";
import { getReviewsByWorker } from "../api/review.api";
import type { Review } from "../features/review/review.types";

export const WorkerReviewsPage = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const workerId = user?.id;
        if (!workerId || user?.role !== "Worker") {
            setReviews([]);
            setError("Không tìm thấy mã thợ cho tài khoản này.");
            return;
        }

        let isMounted = true;

        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                const reviewData = await getReviewsByWorker(workerId);
                if (!isMounted) return;
                setReviews(reviewData);
            } catch {
                if (!isMounted) return;
                setError("Không thể tải đánh giá.");
            } finally {
                if (!isMounted) return;
                setLoading(false);
            }
        };

        loadData();
        return () => {
            isMounted = false;
        };
    }, [user?.id, user?.role]);

    return (
        <WorkerDashboardShell>
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reviews</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Customer feedback for your recent jobs.
                    </p>
                </div>
            </header>

            {error ? (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                    {error}
                </div>
            ) : null}

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {loading ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Loading reviews...</p>
                ) : reviews.length ? (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div
                                key={review.reviewId}
                                className="rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                        Customer #{review.customerId}
                                    </p>
                                    <span className="text-sm font-semibold text-amber-500">
                                        {review.rating}★
                                    </span>
                                </div>
                                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                                    {review.comment}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        No reviews yet.
                    </p>
                )}
            </div>
        </WorkerDashboardShell>
    );
};
