import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/supabase/AuthProvider";
import { useToast } from "@/components/ui/use-toast";

const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, role, loading } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                toast({
                    title: "Not logged in",
                    description: "Please log in to continue.",
                    variant: "destructive",
                });
                navigate("/login", { replace: true });
            } else if (role !== "admin") {
                toast({
                    title: "Access denied",
                    description: "You must be an admin to view this page.",
                    variant: "destructive",
                });
                navigate("/", { replace: true });
            }
        }
    }, [user, role, loading, navigate, toast]);

    // ⏳ Mientras se valida la sesión/rol mostramos un loader
    if (loading) {
        return <div className="p-8">Loading...</div>;
    }

// ⚡ ojo aquí: si todavía no hay role (null) pero sí user, muestra loader en vez de cortar
    if (user && role === null) {
        return <div className="p-8">Loading role...</div>;
    }

    if (!user) {
        toast({ title: "Not logged in", description: "Please log in", variant:"destructive" });
        navigate("/login", { replace: true });
        return null;
    }

    if (role !== "admin") {
        toast({ title: "Access denied", description: "You must be an admin", variant:"destructive" });
        navigate("/", { replace: true });
        return null;
    }

    return <>{children}</>;
};

export default ProtectedAdminRoute;