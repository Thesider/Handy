import { useEffect, useState } from "react";
import { CustomerDashboardShell } from "../components/layout/CustomerDashboardShell";
import { Button } from "../components/common/Button";
import { Input } from "../components/common/Input";
import { getServices } from "../api/handyman.api";
import { getGigsByCustomer, createGig, acceptBid } from "../api/gigs.api";
import type { JobGig } from "../api/gigs.api";
import type { Service } from "../features/handyman/handyman.types";
import { useAuth } from "../hooks/useAuth";

export const CustomerGigsPage = () => {
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [selectedGigId, setSelectedGigId] = useState<number | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [gigs, setGigs] = useState<JobGig[]>([]);

    const [newGig, setNewGig] = useState({
        title: "",
        description: "",
        budget: "",
        serviceId: ""
    });

    const loadData = async () => {
        if (!user?.id) return;
        try {
            const [serviceData, gigData] = await Promise.all([
                getServices(),
                getGigsByCustomer(user.id)
            ]);
            setServices(serviceData);
            setGigs(gigData);
        } catch (err) {
            console.error("Failed to fetch data:", err);
        }
    };

    useEffect(() => {
        loadData();
    }, [user?.id]);

    const handleCreateGig = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id || !newGig.serviceId) return;

        try {
            await createGig({
                title: newGig.title,
                description: newGig.description.trim() || null,
                budget: Number(newGig.budget),
                serviceId: Number(newGig.serviceId),
                customerId: user.id,
                location: "VN, HCM" // Mock location
            });

            loadData();
            setNewGig({ title: "", description: "", budget: "", serviceId: "" });
            setShowForm(false);
        } catch (err) {
            console.error("Failed to create gig:", err);
        }
    };

    const handleAcceptBidAction = async (jobGigId: number, bidId: number) => {
        try {
            await acceptBid(jobGigId, bidId);
            loadData();
            alert("Worker enrolled successfully! The job is now in progress.");
        } catch (err) {
            console.error("Failed to accept bid:", err);
        }
    };

    const activeGig = gigs.find(g => g.jobGigId === selectedGigId);

    return (
        <CustomerDashboardShell>
            <div className="flex flex-col gap-8">
                <header className="flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900">My Job Gigs</h1>
                        <p className="text-slate-500 mt-1">Manage your posted jobs and hire the right professionals.</p>
                    </div>
                    {!showForm && !selectedGigId && (
                        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                            <span className="material-symbols-outlined">add</span>
                            Post New Job
                        </Button>
                    )}
                    {selectedGigId && (
                        <Button variant="ghost" onClick={() => setSelectedGigId(null)} className="flex items-center gap-2">
                            <span className="material-symbols-outlined">arrow_back</span>
                            Back to List
                        </Button>
                    )}
                </header>

                {showForm && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-primary">
                                <span className="material-symbols-outlined">post_add</span>
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Post a New Job</h2>
                        </div>
                        <form onSubmit={handleCreateGig} className="flex flex-col gap-6">
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <Input
                                    label="Job Title"
                                    placeholder="e.g. Broken AC Repair"
                                    value={newGig.title}
                                    onChange={(e) => setNewGig({ ...newGig, title: e.target.value })}
                                    required
                                />
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-slate-700">Service Type</label>
                                    <select
                                        className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                                        value={newGig.serviceId}
                                        onChange={(e) => setNewGig({ ...newGig, serviceId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select a service...</option>
                                        {services.map(s => (
                                            <option key={s.serviceId} value={s.serviceId}>{s.serviceName}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="md:col-span-2 flex flex-col gap-1.5">
                                    <label className="text-sm font-bold text-slate-700">Detailed Description (Optional)</label>
                                    <textarea
                                        className="rounded-xl border border-slate-200 p-4 text-sm focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all min-h-[120px]"
                                        placeholder="Describe the problem, tools needed, and preference..."
                                        value={newGig.description}
                                        onChange={(e) => setNewGig({ ...newGig, description: e.target.value })}
                                    />
                                </div>
                                <Input
                                    label="Budget (VND)"
                                    type="number"
                                    placeholder="e.g. 500000"
                                    value={newGig.budget}
                                    onChange={(e) => setNewGig({ ...newGig, budget: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                                <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                                <Button type="submit" className="px-8">Post Job Now</Button>
                            </div>
                        </form>
                    </div>
                )}

                {!showForm && selectedGigId && activeGig && (
                    <div className="flex flex-col gap-8 animate-in fade-in duration-300">
                        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <div className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-primary mb-3">
                                        {activeGig.serviceType}
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900">{activeGig.title}</h2>
                                    <p className="text-slate-500 text-sm mt-1">Posted on {new Date(activeGig.createdAtUtc).toLocaleDateString()}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-black text-slate-900">{activeGig.budget.toLocaleString()} VND</p>
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold mt-2 ${activeGig.status === "Open" ? "bg-green-100 text-green-700" :
                                        activeGig.status === "InProgress" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                                        }`}>
                                        {activeGig.status}
                                    </span>
                                </div>
                            </div>
                            <div className="border-t border-slate-50 pt-4">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Details</p>
                                <p className="text-slate-600 leading-relaxed max-w-3xl">
                                    {activeGig.description || <span className="text-slate-400 font-medium italic select-none">N.A</span>}
                                </p>
                            </div>
                        </div>

                        <section className="flex flex-col gap-4">
                            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">groups</span>
                                {activeGig.status === "InProgress" ? "Worker Enrolled" : `Applications (${activeGig.bids.length})`}
                            </h3>

                            <div className="grid grid-cols-1 gap-4">
                                {activeGig.bids.length > 0 ? (
                                    activeGig.bids.map((bid) => {
                                        const isAccepted = activeGig.acceptedBidId === bid.bidId;
                                        if (activeGig.status === "InProgress" && !isAccepted) return null;

                                        return (
                                            <div key={bid.bidId} className={`rounded-xl border p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-all ${isAccepted ? "border-primary bg-blue-50/30" : "border-slate-200 bg-white hover:border-slate-300 shadow-sm"
                                                }`}>
                                                <div className="flex items-center gap-4">
                                                    <div className="size-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                                        <span className="material-symbols-outlined text-3xl">account_circle</span>
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-slate-900">{bid.workerName}</h4>
                                                            <div className="flex items-center gap-0.5 text-yellow-500">
                                                                <span className="material-symbols-outlined fill text-[14px]">star</span>
                                                                <span className="text-xs font-bold text-slate-600">{bid.workerRating}</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-sm text-slate-600 mt-1 italic">"{bid.message}"</p>
                                                        <p className="text-xs text-slate-400 mt-2">{new Date(bid.createdAtUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 self-end sm:self-center">
                                                    <div className="text-right">
                                                        <p className="text-lg font-black text-slate-900">{bid.amount.toLocaleString()} VND</p>
                                                        <p className="text-xs text-slate-500 uppercase font-bold tracking-tight">Proposed Price</p>
                                                    </div>
                                                    {activeGig.status === "Open" && (
                                                        <Button onClick={() => handleAcceptBidAction(activeGig.jobGigId, bid.bidId)}>Enrol Worker</Button>
                                                    )}
                                                    {isAccepted && (
                                                        <div className="flex items-center gap-1 text-primary font-bold bg-white px-3 py-1 rounded-full border border-primary/20">
                                                            <span className="material-symbols-outlined">check_circle</span>
                                                            Selected
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center bg-white/50">
                                        <p className="text-slate-500">Waiting for applications from workers...</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}

                {!showForm && !selectedGigId && (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {gigs.length > 0 ? (
                            gigs.map((gig) => (
                                <div key={gig.jobGigId} className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                                    <div className="flex items-start justify-between">
                                        <div className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                                            {gig.serviceType}
                                        </div>
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${gig.status === "Open" ? "bg-green-100 text-green-700" :
                                            gig.status === "InProgress" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                                            }`}>
                                            {gig.status}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{gig.title}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                                        {gig.description || "N.A"}
                                    </p>

                                    <div className="mt-2 flex items-center justify-between border-t border-slate-50 pt-4">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">Budget</span>
                                            <span className="font-bold text-slate-900">{gig.budget.toLocaleString()} VND</span>
                                        </div>
                                        <div className="flex flex-col text-right">
                                            <span className="text-[10px] text-slate-400 font-bold uppercase">{gig.status === "InProgress" ? "Selected" : "Applications"}</span>
                                            <span className="font-bold text-slate-900">{gig.status === "InProgress" ? "1 Worker" : `${gig.bids.length}`}</span>
                                        </div>
                                    </div>
                                    <Button variant="ghost" className="w-full mt-2 text-primary border border-primary/10 hover:bg-blue-50" onClick={() => setSelectedGigId(gig.jobGigId)}>
                                        Manage Gigs
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full rounded-2xl border border-dashed border-slate-300 py-20 text-center bg-white/50">
                                <span className="material-symbols-outlined text-5xl text-slate-300 mb-2">work_off</span>
                                <p className="text-slate-500 font-medium">No job gigs posted yet.</p>
                                <Button variant="ghost" onClick={() => setShowForm(true)} className="mt-4 text-primary">Post your first requirement</Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </CustomerDashboardShell>
    );
};
