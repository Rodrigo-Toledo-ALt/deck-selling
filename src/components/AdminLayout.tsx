import React, { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Package, Users } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');

        toast({
            title: "Logged out",
            description: "You have been successfully logged out",
        });

        navigate('/login');
    };

    // Menú actualizado: quitamos Dashboard y Settings, añadimos Clients
    const adminMenuItems = [
        { path: '/admin/decks', label: 'Decks', icon: <Package size={18} /> },
        { path: '/admin/clients', label: 'Clients', icon: <Users size={18} /> },
    ];

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="hidden md:flex w-64 flex-col bg-card border-r border-border">
                <div className="p-6">
                    <h2 className="text-xl font-bold text-gradient">Admin Panel</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        {localStorage.getItem('userEmail')}
                    </p>
                </div>

                <nav className="flex-1 px-4 pb-4">
                    <ul className="space-y-1">
                        {adminMenuItems.map((item) => (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                                        location.pathname === item.path
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

                <div className="p-4 border-t border-border">
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col">
                {/* Mobile top bar */}
                <div className="md:hidden p-4 bg-card border-b border-border flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gradient">Admin Panel</h2>
                    <Button variant="outline" size="sm" onClick={handleLogout}>
                        <LogOut size={16} />
                    </Button>
                </div>

                {/* Mobile navigation */}
                <div className="md:hidden p-2 bg-card/50 border-b border-border overflow-x-auto">
                    <div className="flex space-x-2">
                        {adminMenuItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex-shrink-0 px-3 py-2 rounded-md text-sm ${
                                    location.pathname === item.path
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-foreground'
                                }`}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Content area */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;