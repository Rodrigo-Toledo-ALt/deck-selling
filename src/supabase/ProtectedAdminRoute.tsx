// src/supabase/ProtectedAdminRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/supabase/AuthProvider';

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, role, loading } = useAuth();
    const location = useLocation();

    // Esperamos a que Supabase restaure la sesión
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-muted-foreground">
                Loading...
            </div>
        );
    }

    // Sesión cargada pero rol todavía null (fetch en curso)
    if (user && role === null) {
        return (
            <div className="flex items-center justify-center h-screen text-muted-foreground">
                Loading...
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    if (role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

export default ProtectedAdminRoute;