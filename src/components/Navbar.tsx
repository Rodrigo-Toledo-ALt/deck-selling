// Navbar.tsx
// Barra de navegación principal con menú responsive, autenticación, carrito y sidebar.
// - Muestra diferentes opciones según si el usuario está logueado o no.
// - Gestiona carrito local (invitado) y remoto (logueado).
// - Incluye sidebar para ver contenido del carrito sin salir de la página (solo invitados).

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
import { supabase } from '@/supabase/supabase-client.ts';

// Función auxiliar para contar total de items en carrito local
function getTotalCount(items: LocalCartItem[]) {
    return items.reduce((acc, it) => acc + it.quantity, 0);
}

const Navbar = () => {
    // Estados para UI: menú hamburguesa, diálogo de confirmación, sidebar de carrito
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [cartOpen, setCartOpen] = useState(false);
    const [cartVisible, setCartVisible] = useState(false); // Para animar entrada/salida del sidebar

    // Estados de datos: items del carrito local y cantidad en carrito remoto
    const [localItems, setLocalItems] = useState<LocalCartItem[]>([]);
    const [remoteCartCount, setRemoteCartCount] = useState(0);

    // Contexto de autenticación (usuario, rol, función de logout)
    const { user, role, signOut } = useAuth();
    const isAuthenticated = !!user;
    const navigate = useNavigate();

    // ── Efecto: carga y escucha cambios en carrito LOCAL ────────────────
    useEffect(() => {
        // Si está logueado, no seguimos escuchando cambios en localStorage
        if (isAuthenticated) return;

        // Refresca items del carrito local y escucha evento global 'cartUpdated'
        const refresh = () => setLocalItems(loadLocalCart());
        refresh();
        const interval = setInterval(refresh, 600);
        window.addEventListener('cartUpdated', refresh);

        // Cleanup: limpiar interval y listener al desmontar o cambiar auth
        return () => {
            clearInterval(interval);
            window.removeEventListener('cartUpdated', refresh);
        };
    }, [isAuthenticated]);

    // ── Función: obtiene cantidad de items en carrito REMOTO ─────────────
    const fetchRemoteCount = useCallback(async () => {
        if (!user) return;
        try {
            // Busca el carrito del usuario
            const { data: cart, error: cartErr } = await supabase
                .from('carts')
                .select('id')
                .eq('user_id', user.id)
                .maybeSingle();

            if (cartErr || !cart) {
                setRemoteCartCount(0);
                return;
            }

            // Cuenta total de items en ese carrito
            const { data, error } = await supabase
                .from('cart_items')
                .select('quantity')
                .eq('cart_id', cart.id);

            if (!error && data) {
                setRemoteCartCount(data.reduce((sum, row) => sum + (row.quantity ?? 1), 0));
            }
        } catch (e) {
            console.error('fetchRemoteCount error:', e);
        }
    }, [user]);

    // ── Efecto: carga y escucha cambios en carrito REMOTO ───────────────
    useEffect(() => {
        if (!isAuthenticated) {
            setRemoteCartCount(0);
            return;
        }
        fetchRemoteCount();
        const interval = setInterval(fetchRemoteCount, 5000);
        window.addEventListener('cartUpdated', fetchRemoteCount);

        return () => {
            clearInterval(interval);
            window.removeEventListener('cartUpdated', fetchRemoteCount);
        };
    }, [isAuthenticated, fetchRemoteCount]);

    // ── Efecto: anima entrada/salida del sidebar de carrito ─────────────
    useEffect(() => {
        if (cartOpen) {
            // Doble requestAnimationFrame asegura que el DOM esté listo para animar
            requestAnimationFrame(() => requestAnimationFrame(() => setCartVisible(true)));
        } else {
            setCartVisible(false);
        }
    }, [cartOpen]);

    // ── Efecto: permite cerrar sidebar con tecla Escape ──────────────────
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCart(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // ── Funciones auxiliares para el sidebar de carrito ──────────────────
    const closeCart = () => {
        setCartVisible(false);
        setTimeout(() => setCartOpen(false), 300); // Espera animación
    };

    // ── Valores calculados ───────────────────────────────────────────────
    const cartCount = isAuthenticated ? remoteCartCount : getTotalCount(localItems);
    const cartSubtotal = localItems.reduce(
        (sum, it) => sum + Number(it.price ?? 0) * it.quantity, 0
    );

    // ── Handlers de navegación ───────────────────────────────────────────
    const handleCartClick = () => {
        if (isAuthenticated) navigate('/cart');
        else setCartOpen(true);
    };

    const handleGoToLogin = () => {
        closeCart();
        navigate('/login?redirect=cart');
    };

    // ── Logout: limpia sesión y redirige a home ──────────────────────────
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

    // ── Componentes auxiliares ───────────────────────────────────────────
    // Botón reutilizable para carrito (badge + contador)
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

    // Botón de logout con confirmación modal
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

    // ── Renderizado principal ────────────────────────────────────────────
    return (
        <>
            {/* Barra de navegación principal */}
            <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo y enlaces visibles en escritorio */}
                        <div className="flex items-center space-x-6">
                            <Link to="/" className="flex items-center">
                                <span className="font-bold text-xl md:text-2xl text-gradient">Pauper Forge</span>
                            </Link>
                            <div className="hidden md:flex items-center space-x-6">
                                <Link to="/catalog" className="text-foreground hover:text-primary transition-colors">Deck Catalog</Link>
                                <Link to="/about" className="text-foreground hover:text-primary transition-colors">About/FAQ</Link>
                            </div>
                        </div>

                        {/* Opciones de usuario visibles en escritorio */}
                        <div className="hidden md:flex items-center space-x-8">
                            {!isAuthenticated ? (
                                <>
                                    <CartButton />
                                    <Link to="/login" className="text-foreground hover:text-primary transition-colors">Sign in</Link>
                                    <Link to="/register" className="text-foreground hover:text-primary transition-colors">Register</Link>
                                </>
                            ) : (
                                <>
                                    {/* 🟢 Todos los usuarios logueados ven carrito y cuenta */}
                                    <CartButton />
                                    <Link to="/account" className="flex items-center text-foreground hover:text-primary transition-colors">
                                        <UserCircle className="h-5 w-5 mr-1" />
                                        <span>My Account</span>
                                    </Link>

                                    {/* 🔵 Solo admins ven dashboard */}
                                    {role === "admin" && (
                                        <Link to="/admin/decks" className="flex items-center text-foreground hover:text-primary transition-colors">
                                            <LayoutDashboard className="h-5 w-5 mr-1" />
                                            <span>Admin Dashboard</span>
                                        </Link>
                                    )}

                                    <LogoutButton />
                                </>
                            )}
                        </div>

                        {/* Botón hamburguesa en móviles */}
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

                    {/* Menú desplegado en móviles */}
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
                            ) : (
                                <>
                                    <CartButton onClick={() => { setIsMenuOpen(false); navigate('/cart'); }} />
                                    <Link to="/account" className="flex items-center text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                                        <UserCircle className="h-5 w-5 mr-1" />
                                        <span>My Account</span>
                                    </Link>

                                    {role === "admin" && (
                                        <Link to="/admin/decks" className="flex items-center text-foreground hover:text-primary transition-colors" onClick={() => setIsMenuOpen(false)}>
                                            <LayoutDashboard className="h-5 w-5 mr-1" />
                                            <span>Admin Dashboard</span>
                                        </Link>
                                    )}

                                    <LogoutButton className="mt-1" />
                                </>
                            )}
                        </div>
                    )}
                </div>
            </nav>

            {/* Sidebar del carrito (solo para invitados) */}
            {cartOpen && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    {/* Overlay oscuro */}
                    <div
                        className="absolute inset-0 bg-black/50 transition-opacity duration-300"
                        style={{ opacity: cartVisible ? 1 : 0 }}
                        onClick={closeCart}
                    />
                    {/* Panel lateral */}
                    <div
                        className="relative w-80 max-w-full h-full bg-background border-l border-border flex flex-col shadow-2xl transition-transform duration-300 ease-out"
                        style={{ transform: cartVisible ? 'translateX(0)' : 'translateX(100%)' }}
                    >
                        {/* Cabecera del sidebar */}
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

                        {/* Lista de items en carrito */}
                        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
                            {localItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-3 py-12">
                                    <ShoppingCart size={40} className="opacity-30" />
                                    <p className="text-sm">Your cart is empty</p>
                                </div>
                            ) : (
                                localItems.map((item) => (
                                    <div key={item.product_id} className="flex items-center gap-3 p-2 rounded-lg border border-border bg-card">
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

                        {/* Total y botones de acción */}
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