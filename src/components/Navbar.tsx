import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, LayoutDashboard, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from "@/supabase/AuthProvider.tsx";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const { user, role, signOut } = useAuth();
    const isAuthenticated = !!user;
    const navigate = useNavigate();

    const doLogout = async () => {
        try {
            await signOut?.();
            localStorage.removeItem('userRole');
            localStorage.removeItem('userEmail');
            navigate('/');
        } catch (e) {
            console.error('Logout error:', e);
        } finally {
            setIsMenuOpen(false);
            setConfirmOpen(false);
        }
    };

    const LogoutButton = ({ className = '' }: { className?: string }) => (
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
            <AlertDialogTrigger asChild>
                <button
                    onClick={() => setConfirmOpen(true)}
                    className={`relative flex items-center text-foreground hover:text-primary transition-colors ${className}`}
                >
                    <LogOut className="h-5 w-5 mr-1" />
                    <span>Logout</span>
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Log out?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Your current session will be closed. You will need to sign in again to access the private area.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={doLogout}>Log out</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );

    return (
        <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Left side */}
                    <div className="flex items-center space-x-6">
                        <Link to="/" className="flex items-center">
                            <span className="font-bold text-xl md:text-2xl text-gradient">Pauper Forge</span>
                        </Link>
                        <div className="hidden md:flex items-center space-x-6">
                            <Link to="/catalog" className="text-foreground hover:text-primary transition-colors">Deck Catalog</Link>
                            <Link to="/about" className="text-foreground hover:text-primary transition-colors">About/FAQ</Link>
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="hidden md:flex items-center space-x-8">
                        {!isAuthenticated ? (
                            <>
                                <Link to="/login" className="text-foreground hover:text-primary transition-colors">Sign in</Link>
                                <Link to="/register" className="text-foreground hover:text-primary transition-colors">Register</Link>
                            </>
                        ) : role === "admin" ? (
                            <>
                                <Link to="/admin/decks" className="flex items-center text-foreground hover:text-primary transition-colors">
                                    <LayoutDashboard className="h-5 w-5 mr-1" />
                                    <span>Admin Dashboard</span>
                                </Link>
                                <LogoutButton />
                            </>
                        ) : (
                            <>
                                <Link to="/cart" className="flex items-center text-foreground hover:text-primary transition-colors">
                                    <ShoppingCart className="h-5 w-5 mr-1" />
                                    <span>Cart</span>
                                </Link>
                                <Link to="/account" className="flex items-center text-foreground hover:text-primary transition-colors">
                                    <UserCircle className="h-5 w-5 mr-1" />
                                    <span>My Account</span>
                                </Link>
                                <LogoutButton />
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="text-foreground hover:text-primary"
                            aria-label="Toggle menu"
                        >
                            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 py-4 space-y-4 flex flex-col">
                        <Link to="/" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
                        <Link to="/catalog" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Deck Catalog</Link>
                        <Link to="/about" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>About/FAQ</Link>
                        {!isAuthenticated ? (
                            <>
                                <Link to="/login" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Sign in</Link>
                                <Link to="/register" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>Register</Link>
                            </>
                        ) : role === "admin" ? (
                            <>
                                <Link to="/admin/decks" className="flex items-center text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                                    <LayoutDashboard className="h-5 w-5 mr-1" />
                                    <span>Admin Dashboard</span>
                                </Link>
                                <LogoutButton className="mt-1" />
                            </>
                        ) : (
                            <>
                                <Link to="/cart" className="flex items-center text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                                    <ShoppingCart className="h-5 w-5 mr-1" />
                                    <span>Cart</span>
                                </Link>
                                <Link to="/account" className="flex items-center text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                                    <UserCircle className="h-5 w-5 mr-1" />
                                    <span>My Account</span>
                                </Link>
                                <LogoutButton className="mt-1" />
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;