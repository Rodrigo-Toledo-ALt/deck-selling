import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { useAuth } from "@/supabase/AuthProvider.tsx";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { user, role } = useAuth();
    const isAuthenticated = !!user;

    return (
        <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo + left navigation */}
                    <div className="flex items-center space-x-6">
                        <Link to="/" className="flex items-center">
                            <span className="font-bold text-xl md:text-2xl text-gradient">Pauper Forge</span>
                        </Link>
                        {/* Left menu (only desktop) */}
                        <div className="hidden md:flex items-center space-x-6">
                            <Link to="/catalog" className="text-foreground hover:text-primary transition-colors">
                                Deck Catalog
                            </Link>
                            <Link to="/about" className="text-foreground hover:text-primary transition-colors">
                                About/FAQ
                            </Link>
                        </div>
                    </div>

                    {/* Right side (only desktop) */}
                    <div className="hidden md:flex items-center space-x-8">
                        {!isAuthenticated ? (
                            <>
                                <Link to="/login" className="text-foreground hover:text-primary transition-colors">
                                    Sign in
                                </Link>
                                <Link to="/register" className="text-foreground hover:text-primary transition-colors">
                                    Register
                                </Link>
                            </>
                        ) : role === "admin" ? (
                            <Link
                                to="/admin/decks"
                                className="relative flex items-center text-foreground hover:text-primary transition-colors"
                            >
                                <LayoutDashboard className="h-5 w-5 mr-1" />
                                <span>Admin Dashboard</span>
                            </Link>
                        ) : (
                            <Link
                                to="/cart"
                                className="relative flex items-center text-foreground hover:text-primary transition-colors"
                            >
                                <ShoppingCart className="h-5 w-5 mr-1" />
                                <span>Cart</span>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
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

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden mt-4 py-4 space-y-4 flex flex-col">
                        <Link
                            to="/"
                            className="text-foreground hover:text-primary transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            to="/catalog"
                            className="text-foreground hover:text-primary transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Deck Catalog
                        </Link>
                        <Link
                            to="/about"
                            className="text-foreground hover:text-primary transition-colors"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            About/FAQ
                        </Link>
                        {!isAuthenticated ? (
                            <>
                                <Link
                                    to="/login"
                                    className="text-foreground hover:text-primary transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Sign in
                                </Link>
                                <Link
                                    to="/register"
                                    className="text-foreground hover:text-primary transition-colors"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Register
                                </Link>
                            </>
                        ) : role === "admin" ? (
                            <Link
                                to="/admin/decks"
                                className="flex items-center text-foreground hover:text-primary transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <LayoutDashboard className="h-5 w-5 mr-1" />
                                <span>Admin Dashboard</span>
                            </Link>
                        ) : (
                            <Link
                                to="/cart"
                                className="flex items-center text-foreground hover:text-primary transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <ShoppingCart className="h-5 w-5 mr-1" />
                                <span>Cart</span>
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;