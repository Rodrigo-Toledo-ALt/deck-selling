// src/components/Navbar.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, LayoutDashboard, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from "@/supabase/AuthProvider.tsx";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { loadLocalCart, type LocalCartItem } from '@/data/local_cart';
import { supabase } from '@/supabase/supabase-client.ts'; // ajusta el path si es diferente

function getTotalCount(items: LocalCartItem[]) {
    return items.reduce((acc, it) => acc + it.quantity, 0);
}

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [cartVisible, setCartVisible] = useState(false);
    const [localItems, setLocalItems] = useState<LocalCartItem[]>([]);
    const [remoteCartCount, setRemoteCartCount] = useState(0);
    const { user, role, signOut } = useAuth();
    const isAuthenticated = !!user;
    const navigate = useNavigate();

    // ── Carrito local (anon) ──────────────────────────────────────────
    useEffect(() => {
        if (isAuthenticated) return; // no necesitamos polling si está loggeado
        const refresh = () => setLocalItems(loadLocalCart());
        refresh();
        const interval = setInterval(refresh, 600);
        return () => clearInterval(interval);
    }, [isAuthenticated]);

    // ── Carrito remoto (loggeado) ─────────────────────────────────────
    const fetchRemoteCount = useCallback(async () => {
        if (!user) {
            console.log('fetchRemoteCount: no user, skipping');
            return;
        }
        console.log('fetchRemoteCount: fetching for user', user.id);
        try {
            const { data: cart, error: cartErr } = await supabase
                .from('carts')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            console.log('cart:', cart, 'cartErr:', cartErr);

            if (cartErr || !cart) {
                setRemoteCartCount(0);
                return;
            }

            const { data, error } = await supabase
                .from('cart_items')
                .select('quantity')
                .eq('cart_id', cart.id);

            console.log('cart_items data:', data, 'error:', error);

            if (!error && data) {
                setRemoteCartCount(data.reduce((sum, row) => sum + (row.quantity ?? 1), 0));
            }
        } catch (e) {
            console.error('fetchRemoteCount error:', e);
        }
    }, [user]);

    useEffect(() => {
        if (!isAuthenticated) {
            setRemoteCartCount(0);
            return;
        }
        fetchRemoteCount();
        const interval = setInterval(fetchRemoteCount, 5000); // cada 5s
        return () => clearInterval(interval);
    }, [isAuthenticated, fetchRemoteCount]);

    // ── Animación sidebar ─────────────────────────────────────────────
    useEffect(() => {
        if (cartOpen) {
            requestAnimationFrame(() => requestAnimationFrame(() => setCartVisible(true)));
        } else {
            setCartVisible(false);
        }
    }, [cartOpen]);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const closeCart = () => {
        setCartVisible(false);
        setTimeout(() => setCartOpen(false), 300);
    };

    const cartCount = isAuthenticated ? remoteCartCount : getTotalCount(localItems);
    const cartSubtotal = localItems.reduce(
        (sum, it) => sum + Number(it.price ?? 0) * it.quantity, 0
    );

    const handleCartClick = () => {
        if (isAuthenticated) navigate('/cart');
        else setCartOpen(true);
    };

    const handleGoToLogin = () => {
        closeCart();
        navigate('/login?redirect=cart');
    };

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

    const CartButton = ({ onClick }: { onClick?: () => void }) => (
        <button
            onClick={onClick ?? handleCartClick}
            className="relative flex items-center text-foreground hover:text-primary transition-colors"
            aria-label="Cart"
        >
            <ShoppingCart className="h-5 w-5 mr-1" />
            <span>Cart</span>
            {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                    {cartCount}
                </span>
            )}
        </button>
    );

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
        <>
            <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">

                        {/* Left */}
                        <div className="flex items-center space-x-6">
                            <Link to="/" className="flex items-center">
                                <span className="font-bold text-xl md:text-2xl text-gradient">Pauper Forge</span>
                            </Link>
                            <div className="hidden md:flex items-center space-x-6">
                                <Link to="/catalog" className="text-foreground hover:text-primary transition-colors">Deck Catalog</Link>
                                <Link to="/about" className="text-foreground hover:text-primary transition-colors">About/FAQ</Link>
                            </div>
                        </div>

                        {/* Right — desktop */}
                        <div className="hidden md:flex items-center space-x-8">
                            {!isAuthenticated ? (
                                <>
                                    <CartButton />
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
                                    <CartButton />
                                    <Link to="/account" className="flex items-center text-foreground hover:text-primary transition-colors">
                                        <UserCircle className="h-5 w-5 mr-1" />
                                        <span>My Account</span>
                                    </Link>
                                    <LogoutButton />
                                </>
                            )}
                        </div>

                        {/* Mobile toggle */}
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
                                    <CartButton onClick={() => { setIsMenuOpen(false); handleCartClick(); }} />
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
                                    <CartButton onClick={() => { setIsMenuOpen(false); navigate('/cart'); }} />
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

            {/* ── Cart Sidebar (solo anon) ──────────────────────────────────── */}
            {cartOpen && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    <div
                        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
                        style={{ opacity: cartVisible ? 1 : 0 }}
                        onClick={closeCart}
                    />
                    <div
                        className="relative w-80 max-w-full h-full bg-background border-l border-border flex flex-col shadow-2xl transition-transform duration-300 ease-out"
                        style={{ transform: cartVisible ? 'translateX(0)' : 'translateX(100%)' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-4 border-b border-border">
                            <h2 className="font-semibold text-lg flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5" />
                                My Cart
                                {cartCount > 0 && (
                                    <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                                        {cartCount}
                                    </span>
                                )}
                            </h2>
                            <button onClick={closeCart} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Close cart">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                            {localItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 py-12">
                                    <ShoppingCart size={40} className="opacity-30" />
                                    <p className="text-sm">Your cart is empty</p>
                                </div>
                            ) : (
                                localItems.map((item) => (
                                    <div key={item.product_id} className="flex items-center gap-3 p-2 rounded-lg border border-border bg-card">
                                        {/* Thumbnail — misma proporción que DeckCard (aspect 3/2, object-cover) */}
                                        <div className="w-16 flex-shrink-0 rounded overflow-hidden bg-muted" style={{ aspectRatio: '3/2' }}>
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                                    <ShoppingCart size={16} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">{item.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {item.quantity} × €{Number(item.price).toFixed(2)}
                                            </p>
                                        </div>
                                        <p className="text-sm font-semibold whitespace-nowrap">
                                            €{(item.quantity * Number(item.price)).toFixed(2)}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        <div className="px-4 py-4 border-t border-border space-y-3">
                            {localItems.length > 0 && (
                                <div className="flex justify-between text-sm font-semibold">
                                    <span>Total</span>
                                    <span>€{cartSubtotal.toFixed(2)}</span>
                                </div>
                            )}
                            <button
                                onClick={handleGoToLogin}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <ShoppingCart size={18} />
                                Sign in to checkout
                            </button>
                            <button
                                onClick={closeCart}
                                className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                            >
                                Continue browsing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;