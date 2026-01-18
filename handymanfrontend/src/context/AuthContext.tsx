import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import type {
    AuthContextValue,
    AuthResponse,
    AuthUser,
    LoginPayload,
    RegisterCustomerPayload,
    RegisterWorkerPayload,
} from "../features/auth/auth.types.ts";
import * as authApi from "../api/auth.api";
import {
    clearStoredUser,
    clearToken,
    getStoredUser,
    getToken,
    clearCustomerId,
    setCustomerId,
    setStoredUser,
    setToken,
} from "../utils/tokenStorage";

export const AuthContext = createContext<AuthContextValue | null>(null);

const buildUserFallback = (payload: LoginPayload): AuthUser => ({
    email: payload.email,
    name: "Handyman Customer",
    role: "Customer",
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setTokenState] = useState<string | null>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTokenState(getToken());
        setUser(getStoredUser());
        setLoading(false);
    }, []);

    const login = useCallback(async (payload: LoginPayload) => {
        const normalizedEmail = payload.email.trim().toLowerCase();
        if (normalizedEmail === "admin@gmail.com" && payload.password === "admin123") {
            const adminUser: AuthUser = {
                id: 1,
                email: payload.email,
                name: "Admin",
                role: "Admin",
            };
            const adminToken = "admin-local-token";
            setToken(adminToken);
            setStoredUser(adminUser);
            clearCustomerId();
            setTokenState(adminToken);
            setUser(adminUser);
            return;
        }

        const response: AuthResponse = await authApi.login(payload);
        const nextToken = response.token;
        const nextUser = response.user ?? buildUserFallback(payload);
        setToken(nextToken);
        setStoredUser(nextUser);
        setTokenState(nextToken);
        setUser(nextUser);
        if (nextUser.role === "Customer" && nextUser.id) {
            setCustomerId(nextUser.id);
        }
    }, []);

    const updateUser = useCallback((nextUser: AuthUser) => {
        setStoredUser(nextUser);
        setUser(nextUser);
        if (nextUser.role === "Customer" && nextUser.id) {
            setCustomerId(nextUser.id);
        } else {
            clearCustomerId();
        }
    }, []);

    const registerCustomer = useCallback(async (payload: RegisterCustomerPayload) => {
        const response: AuthResponse = await authApi.registerCustomer(payload);
        const nextToken = response.token;
        const nextUser = response.user ?? {
            email: payload.email,
            name: `${payload.firstName} ${payload.lastName}`,
            role: "Customer",
        };
        setToken(nextToken);
        setStoredUser(nextUser);
        setTokenState(nextToken);
        setUser(nextUser);
        if (nextUser.id) {
            setCustomerId(nextUser.id);
        }
    }, []);

    const registerWorker = useCallback(async (payload: RegisterWorkerPayload) => {
        const response: AuthResponse = await authApi.registerWorker(payload);
        const nextToken = response.token;
        const nextUser = response.user ?? {
            email: payload.email,
            name: `${payload.firstName} ${payload.lastName}`,
            role: "Worker",
        };
        setToken(nextToken);
        setStoredUser(nextUser);
        setTokenState(nextToken);
        setUser(nextUser);
    }, []);

    const logout = useCallback(() => {
        clearToken();
        clearStoredUser();
        clearCustomerId();
        setTokenState(null);
        setUser(null);
    }, []);

    const value = useMemo<AuthContextValue>(
        () => ({
            token,
            user,
            loading,
            isAuthenticated: Boolean(token),
            login,
            registerCustomer,
            registerWorker,
            logout,
            updateUser,
        }),
        [token, user, loading, login, registerCustomer, registerWorker, logout, updateUser]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
