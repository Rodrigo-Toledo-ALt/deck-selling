// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/supabase/AuthProvider.tsx';

interface ProtectedRouteProps {
    children: React.ReactNode;
    adminOnly?: boolean; // opcional, lo usamos para rutas de admin
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
    const { user, role, loading } = useAuth();
    const location = useLocation();

    // Si auth todavía se está cargando, evita mostrar pantalla vacía
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen text-muted-foreground">
                Loading...
            </div>
        );
    }

    // Si no hay usuario, redirigir a /login, guardando la URL que quería visitar
    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // Si la ruta es solo para admins y el usuario no lo es, redirige
    if (adminOnly && role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    // Si todo OK → renderiza el contenido
    return <>{children}</>;
};

export default ProtectedRoute;