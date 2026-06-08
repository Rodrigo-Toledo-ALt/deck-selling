// ProtectedAdminRoute.tsx
// Ruta protegida para la sección de admin: espera la sesión y el role, redirige si no hay acceso.

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/supabase/AuthProvider';

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, role, loading } = useAuth();
    const location = useLocation();

    // Mientras se restaura la sesión desde Supabase mostramos un loader simple
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-muted-foreground">
                Loading...
            </div>
        );
    }

    // Sesión presente pero aún no se ha resuelto el role (fetch en curso): seguimos mostrando loader
    if (user && role === null) {
        return (
            <div className="flex items-center justify-center h-screen text-muted-foreground">
                Loading...
            </div>
        );
    }

    // No autenticado -> redirigir a login, guardando la ruta origen en state
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Usuario autenticado pero no es admin -> redirigir a home
    if (role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // Usuario admin: renderizar children (ruta permitida)
    return <>{children}</>;
};

export default ProtectedAdminRoute;