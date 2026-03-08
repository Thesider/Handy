import { createContext, useContext, useEffect, useMemo } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "./ToastContext";
import { signalRService, type UserAlertPayload } from "../services/signalRService";

type RealtimeContextValue = {
    joinBooking: (bookingId: number) => Promise<void>;
    leaveBooking: (bookingId: number) => Promise<void>;
};

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

const getAlertRoute = (alert: UserAlertPayload) => {
    if (alert.meta?.bookingId) {
        return `/bookings?bookingId=${alert.meta.bookingId}`;
    }
    if (alert.meta?.jobGigId) {
        return "/customer/gigs";
    }
    return undefined;
};

export const RealtimeProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, isAuthenticated } = useAuth();
    const { showToast } = useToast();

    useEffect(() => {
        if (!isAuthenticated || !user?.id) {
            void signalRService.disconnect();
            return;
        }

        let isDisposed = false;

        const wire = async () => {
            try {
                await signalRService.connect();
                if (isDisposed) return;
                if (!user?.id) return;
                await signalRService.joinUser(user.id);
            } catch {
                showToast("Realtime updates unavailable. Retrying in background.", "info");
            }
        };

        wire();

        const offAlert = signalRService.on("UserAlert", (alert) => {
            showToast(`${alert.title}: ${alert.message}`, "info", getAlertRoute(alert));
        });

        return () => {
            isDisposed = true;
            offAlert();
            if (user?.id) {
                void signalRService.leaveUser(user.id);
            }
            void signalRService.disconnect();
        };
    }, [isAuthenticated, user?.id, showToast]);

    const value = useMemo<RealtimeContextValue>(
        () => ({
            joinBooking: (bookingId: number) => signalRService.joinBooking(bookingId),
            leaveBooking: (bookingId: number) => signalRService.leaveBooking(bookingId),
        }),
        []
    );

    return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
};

export const useRealtime = () => {
    const context = useContext(RealtimeContext);
    if (!context) {
        throw new Error("useRealtime must be used within RealtimeProvider");
    }
    return context;
};
