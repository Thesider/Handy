import { useEffect, useState } from "react";
import { WorkerDashboardShell } from "../components/layout/WorkerDashboardShell";
import { Button } from "../components/common/Button";
import { getGigs, addBid } from "../api/gigs.api";
import type { JobGig } from "../api/gigs.api";
import { useAuth } from "../hooks/useAuth";
import { httpClient } from "../api/httpClient";
import { useToast } from "../context/ToastContext";

export const JobBoardPage = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<"feed" | "my-gigs">("feed");
    const [gigs, setGigs] = useState<JobGig[]>([]);

    const [biddingGigId, setBiddingGigId] = useState<number | null>(null);
    const [bidMessage, setBidMessage] = useState("");
    const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

    const loadGigs = async () => {
        try {
            const data = await getGigs();
            setGigs(data);
        } catch (err) {
            console.error("Failed to load gigs:", err);
        }
    };

    useEffect(() => {
        loadGigs();
    }, []);

    const handleEnroll = async (jobGigId: number, amount: number) => {
        if (!user?.id) return;

        try {
            await addBid({
                jobGigId,
                workerId: user.id,
                amount: amount,
                message: bidMessage
            });

            await loadGigs();
            setBiddingGigId(null);
            setBidMessage("");
            showToast("Success! You've enrolled for this job. You can now communicate with the customer.", "success");
            setActiveTab("my-gigs");
        } catch (err) {
            console.error("Failed to add bid:", err);
        }
    };

    const handleStatusChange = async (jobGigId: number, newStatus: "InProgress" | "Completed") => {
        const confirmMsg = newStatus === "InProgress"
            ? "Start working on this job?"
            : "Mark this job as completed?";

        if (!window.confirm(confirmMsg)) return;

        try {
            setUpdatingStatusId(jobGigId);
            await httpClient.put(`/api/job-gigs/${jobGigId}/status`, newStatus);

            // Reload gigs to get updated status
            await loadGigs();
            showToast(newStatus === "Completed" ? "Job marked as completed!" : "Job started!", "success");
        } catch (err) {
            console.error("Failed to update status:", err);
            showToast("Failed to update job status. Please try again.", "error");
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const feedGigs = gigs.filter(g => g.status === "Open" && !g.bids.some(b => b.workerId === user?.id));
    const enrolledGigs = gigs.filter(g => g.bids.some(b => b.workerId === user?.id));

    return (
        <WorkerDashboardShell>
            <div className="flex flex-col gap-8">
                <header className="flex flex-col gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">Job Board</h1>
                        <p className="text-slate-500 mt-1">Discover opportunities and enroll for jobs that match your skills.</p>
                    </div>

                    <div className="flex border-b border-slate-200">
                        <button
                            onClick={() => setActiveTab("feed")}
                            className={`px-6 py-3 text-sm font-bold transition-all relative ${activeTab === "feed" ? "text-primary" : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Available Jobs
                            {activeTab === "feed" && <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />}
                        </button>
                        <button
                            onClick={() => setActiveTab("my-gigs")}
                            className={`px-6 py-3 text-sm font-bold transition-all relative ${activeTab === "my-gigs" ? "text-primary" : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            Your Applications
                            {activeTab === "my-gigs" && <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary" />}
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    {activeTab === "feed" ? (
                        feedGigs.length > 0 ? (
                            feedGigs.map((gig) => (
                                <div key={gig.jobGigId} className="group relative flex flex-col gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-primary">
                                                    {gig.serviceType}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                                                    Posted {new Date(gig.createdAtUtc).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="text-xl font-bold text-slate-900">{gig.title}</h3>
                                            <div className="flex items-center gap-4 text-sm text-slate-500">
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <span className="material-symbols-outlined text-[18px] text-slate-400">person</span>
                                                    {gig.customerName}
                                                </div>
                                                <div className="flex items-center gap-1.5 font-medium">
                                                    <span className="material-symbols-outlined text-[18px] text-slate-400">location_on</span>
                                                    {gig.address.city}, {gig.address.state}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end">
                                            <span className="text-2xl font-black text-slate-900 leading-none">{gig.budget.toLocaleString()} VND / day</span>
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">Est. Budget ({gig.durationDays} days)</span>
                                            <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">Total: {(gig.budget * gig.durationDays).toLocaleString()} VND</span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-600 leading-relaxed border-t border-slate-50 pt-4">{gig.description || "N.A"}</p>

                                    <div className="flex items-center justify-between border-t border-slate-50 pt-5 mt-2">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Applicants</span>
                                            <span className="text-sm font-bold text-slate-900">{gig.bids.length} pros applied</span>
                                        </div>
                                        <Button className="px-8 shadow-lg shadow-primary/20" onClick={() => setBiddingGigId(gig.jobGigId)}>Enrol Now</Button>
                                    </div>

                                    {biddingGigId === gig.jobGigId && (
                                        <div className="mt-4 flex flex-col gap-5 rounded-2xl bg-slate-50 p-6 border border-slate-200 animate-in zoom-in-95 duration-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-primary">send</span>
                                                    <h4 className="font-bold text-slate-900 text-lg">Confirm Enrollment</h4>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">
                                                    <span className="material-symbols-outlined text-[16px]">location_on</span>
                                                    {gig.address.street}, {gig.address.city}
                                                </div>
                                            </div>

                                            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap gap-6 items-center">
                                                <div className="flex-1 min-w-[120px]">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Rate / Day</p>
                                                    <p className="text-lg font-bold text-slate-900">{gig.budget.toLocaleString()} VND</p>
                                                    <p className="text-[10px] text-slate-400 font-medium italic">{gig.durationDays} working days</p>
                                                </div>
                                                <div className="flex-1 min-w-[120px]">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Budget</p>
                                                    <p className="text-lg font-bold text-slate-900">{(gig.budget * gig.durationDays).toLocaleString()} VND</p>
                                                </div>
                                                <div className="flex-1 min-w-[120px]">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Service Fee (10%)</p>
                                                    <p className="text-sm font-bold text-red-500">-{(gig.budget * gig.durationDays * 0.1).toLocaleString()} VND</p>
                                                </div>
                                                <div className="flex-1 min-w-[120px] border-l pl-6 border-slate-100">
                                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Net Total Earnings</p>
                                                    <p className="text-xl font-black text-emerald-600">{(gig.budget * gig.durationDays * 0.9).toLocaleString()} VND</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Offer Note / Message</label>
                                                <textarea
                                                    className="min-h-[100px] w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                                    placeholder="Tell the customer why you're a good fit for this job (optional)..."
                                                    value={bidMessage}
                                                    onChange={(e) => setBidMessage(e.target.value)}
                                                />
                                            </div>

                                            <div className="flex justify-end gap-3 pt-2">
                                                <Button variant="ghost" className="font-bold" onClick={() => {
                                                    setBiddingGigId(null);
                                                    setBidMessage("");
                                                }}>Cancel</Button>
                                                <Button className="px-10" onClick={() => handleEnroll(gig.jobGigId, gig.budget)}>Enroll for {gig.budget.toLocaleString()} VND</Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="rounded-3xl border-2 border-dashed border-slate-200 py-24 text-center bg-white/50">
                                <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">search_off</span>
                                <p className="text-slate-500 font-bold text-lg italic">No new jobs matching your profile yet.</p>
                                <p className="text-slate-400 text-sm mt-1">We'll alert you when something pops up!</p>
                            </div>
                        )
                    ) : (
                        enrolledGigs.length > 0 ? (
                            enrolledGigs.map((gig) => {
                                const myBid = gig.bids.find(b => b.workerId === user?.id);
                                const isAccepted = myBid?.isAccepted;

                                return (
                                    <div key={gig.jobGigId} className={`relative flex flex-col gap-4 rounded-2xl border p-6 shadow-md transition-all ${isAccepted ? "border-emerald-500 bg-emerald-50/10" : "border-blue-600 bg-white"
                                        }`}>
                                        <div className={`absolute -top-3 right-6 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg ${isAccepted ? "bg-emerald-500 shadow-emerald-500/30" : "bg-blue-600 shadow-blue-500/30"
                                            }`}>
                                            {isAccepted ? "Accepted" : "Application Sent"}
                                        </div>
                                        <div className="flex items-start justify-between">
                                            <div className="flex flex-col gap-1">
                                                <h3 className="text-xl font-bold text-slate-900">{gig.title}</h3>
                                                <p className="text-sm text-slate-500 font-medium italic">Applied to {gig.customerName}</p>
                                                <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                                                    <span className="material-symbols-outlined text-[18px] text-slate-400">location_on</span>
                                                    {gig.address.street}, {gig.address.city}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">Your Bid</p>
                                                <span className="text-xl font-black text-primary">{myBid?.amount.toLocaleString()} VND</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-3 border-t border-slate-50 pt-4 mt-2">
                                            {isAccepted ? (
                                                <>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${gig.status === "InProgress" ? "bg-blue-100 text-blue-700" :
                                                            gig.status === "Completed" ? "bg-emerald-100 text-emerald-700" :
                                                                "bg-slate-100 text-slate-600"
                                                            }`}>
                                                            {gig.status}
                                                        </span>
                                                    </div>

                                                    {gig.status === "InProgress" ? (
                                                        <Button
                                                            onClick={() => handleStatusChange(gig.jobGigId, "Completed")}
                                                            disabled={updatingStatusId === gig.jobGigId}
                                                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold w-full disabled:opacity-50"
                                                        >
                                                            {updatingStatusId === gig.jobGigId ? "Updating..." : "Mark as Completed"}
                                                        </Button>
                                                    ) : gig.status === "Open" ? (
                                                        <Button
                                                            onClick={() => handleStatusChange(gig.jobGigId, "InProgress")}
                                                            disabled={updatingStatusId === gig.jobGigId}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold w-full disabled:opacity-50"
                                                        >
                                                            {updatingStatusId === gig.jobGigId ? "Starting..." : "Start Work"}
                                                        </Button>
                                                    ) : gig.status === "Completed" ? (
                                                        <div className="text-center py-3 text-emerald-600 font-bold flex items-center justify-center gap-2">
                                                            <span className="material-symbols-outlined">check_circle</span>
                                                            Job Completed
                                                        </div>
                                                    ) : (
                                                        <Button className="bg-primary hover:bg-primary/90 text-white font-bold w-full">
                                                            Contact Customer
                                                        </Button>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <Button variant="ghost" className="text-primary hover:bg-blue-50 font-bold border border-primary/10 flex-1">View Status</Button>
                                                    <Button variant="ghost" className="text-slate-500 hover:bg-slate-50 font-bold flex-1">Withdraw</Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="rounded-3xl border border-slate-200 py-24 text-center bg-white/50">
                                <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">assignment_turned_in</span>
                                <p className="text-slate-500 font-bold text-lg">You haven't enrolled for any jobs yet.</p>
                                <Button variant="ghost" className="mt-4 text-primary font-bold" onClick={() => setActiveTab("feed")}>Explore Job Feed</Button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </WorkerDashboardShell>
    );
};
