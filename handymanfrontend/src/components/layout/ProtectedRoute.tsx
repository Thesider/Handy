import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import type { AuthUser } from "../../features/auth/auth.types.ts";

type ProtectedRouteProps = {
    allowedRoles?: AuthUser["role"][];
};

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { isAuthenticated, loading, user } = useAuth();

    if (loading) {
        return null;
    }

    if (!isAuthenticated) {
        return <Navigate to="/auth/login" replace />;
    }

    if (allowedRoles?.length && (!user?.role || !allowedRoles.includes(user.role))) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};
