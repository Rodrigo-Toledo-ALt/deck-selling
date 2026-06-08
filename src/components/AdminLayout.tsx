// AdminLayout.tsx
// Layout principal para la sección de administración.
// - Muestra sidebar (desktop) y navegación simplificada (móvil).
// - Incluye logout simple que borra datos en localStorage y redirige a /login.
// Autor: (tu nombre) — Nota: puedes indicar el propósito en el TFG si lo deseas.

import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Package, ShoppingBag, Users, MessageSquare } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    // Logout mínimo: limpia la "role" y email guardados localmente,
    // muestra un toast y redirige al login.
    // Nota: esto es intencionalmente simple para el TFG; en producción
    // conviene invalidar el token en el backend y usar un contexto/estado global.
    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');

        toast({
            title: "Logged out",
            description: "You have been successfully logged out",
        });

        navigate('/login');
    };

    // Items del menú de admin. Se renderizan igual en mobile/desktop.
    const adminMenuItems = [
        { path: '/admin/decks', label: 'Decks', icon: <Package size={18} /> },
        { path: '/admin/clients', label: 'Clients', icon: <Users size={18} /> },
        { path: '/admin/orders', label: 'Orders', icon: <ShoppingBag size={18} /> },
        // Añadido soporte (soporte/tiquet)
        { path: '/admin/support', label: 'Support', icon: <MessageSquare size={18} /> },
    ];

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar (visible en md+) */}
            <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gradient">Admin Panel</h2>
                    {/*
                      Mostrar el email guardado en localStorage aquí es práctico
                      pero acoplado: sería mejor obtenerlo desde un contexto de usuario.
                      (Evita accesos directos a localStorage durante render si es posible.)
                    */}
                    <p className="text-sm text-muted-foreground mt-1">
                        {localStorage.getItem('userEmail')}
                    </p>
                </div>

                {/* Menú principal */}
                <nav className="flex-1 px-4 pb-4">
                    <ul className="space-y-1">
                        {adminMenuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                                        // startsWith permite marcar secciones y subrutas activas.
                                        // Atención: para rutas como '/admin/decks-archive' podría coincidir,
                                        // pero suele ser suficiente para paneles con paths bien definidos.
                                        location.pathname.startsWith(item.path)
                                            ? 'bg-primary/10 text-primary'
                                            : 'hover:bg-secondary/50 text-foreground'
                                    }`}
                                >
                                    {item.icon}
                                    <span className="ml-3">{item.label}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>

                {/* Acción fija: logout */}
                <div className="p-4 border-t border-border">
                    <Button variant="outline" size="sm" onClick={handleLogout} className="w-full">
                        <LogOut size={16} /> Logout
                    </Button>
                </div>
            </aside>

            {/* Contenido principal */}
            <div className="flex-1 flex flex-col">
                {/* Top bar móvil: título + logout */}
                <div className="md:hidden p-4 bg-card border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gradient">Admin Panel</h2>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        <LogOut size={16} />
                    </Button>
                </div>

                {/* Navegación móvil compacta (scroll horizontal si hay muchas opciones) */}
                <div className="md:hidden p-2 bg-card/50 border-b border-border overflow-x-auto">
                    <div className="flex space-x-2">
                        {adminMenuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex-shrink-0 px-3 py-2 rounded-md text-sm ${
                                    // mismo criterio de "activo" que en el sidebar
                                    location.pathname.startsWith(item.path)
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-foreground'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Área donde se renderiza el contenido específico de cada sección */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;