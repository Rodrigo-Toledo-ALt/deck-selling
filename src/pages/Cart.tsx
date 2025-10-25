// src/pages/Cart.tsx
import React, { useEffect, useMemo, useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { useAuth } from '@/supabase/AuthProvider'; // o tu hook/contexto de auth
import {
    getCart as getRemoteCart,
    addToCart as addRemote,
    updateQuantity as updateRemoteQty,
    removeFromCart as removeRemote,
    clearCart as clearRemote,
    checkout as remoteCheckout,
    type CartItem as RemoteCartItem,
    type Product as RemoteProduct,
} from '@/data/cart_remote';
import { getSignedMainImageUrl } from '@/data/decks_remote';

// ------------ Tipos para carrito anónimo ------------
type LocalCartItem = {
    id: string; // uuid-like generado localmente
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    // Para anónimo guardamos una URL usable directamente (si la tienes ya firmada/pública)
    imageUrl?: string | null;
};

const LOCAL_CART_KEY = 'cart_items_v1';

// Utilidades localStorage
function loadLocalCart(): LocalCartItem[] {
    try {
        const raw = localStorage.getItem(LOCAL_CART_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
    } catch {}
    return [];
}
function saveLocalCart(items: LocalCartItem[]) {
    localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
}
function removeLocalItem(id: string) {
    const items = loadLocalCart().filter((it) => it.id !== id);
    saveLocalCart(items);
}
function clearLocalCart() {
    saveLocalCart([]);
}
function updateLocalQty(id: string, quantity: number) {
    const items = loadLocalCart().map((it) => (it.id === id ? { ...it, quantity } : it));
    saveLocalCart(items);
}

// ------------- Cart page -------------
const Cart: React.FC = () => {
    const { user } = useAuth(); // { user?.id } si estás logueado
    const isAuthed = Boolean(user?.id);

    // Estado para carrito remoto y local
    const [remoteItems, setRemoteItems] = useState<RemoteCartItem[]>([]);
    const [localItems, setLocalItems] = useState<LocalCartItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Mapa de URLs firmadas para items remotos por cart_item.id
    const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({});

    // Carga inicial del carrito
    useEffect(() => {
        let cancelled = false;
        (async () => {
            setLoading(true);
            try {
                if (isAuthed) {
                    const items = await getRemoteCart();
                    if (!cancelled) setRemoteItems(items);
                } else {
                    const items = loadLocalCart();
                    if (!cancelled) setLocalItems(items);
                }
            } catch (e) {
                console.error('Cart load error:', e);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [isAuthed]);

    // Resolver imágenes firmadas para carrito remoto (como haces en Catalog)
    useEffect(() => {
        if (!isAuthed || remoteItems.length === 0) {
            setResolvedUrls({});
            return;
        }
        let cancelled = false;
        (async () => {
            try {
                const pairs = await Promise.all(
                    remoteItems.map(async (it) => {
                        const path = it.product?.main_image_path ?? '';
                        const url = path ? await getSignedMainImageUrl({ main_image_path: path } as any) : '';
                        return [it.id, url] as const;
                    })
                );
                if (!cancelled) setResolvedUrls(Object.fromEntries(pairs));
            } catch (e) {
                console.error('resolve signed urls error:', e);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [isAuthed, remoteItems]);

    // Totales
    const subtotal = useMemo(() => {
        if (isAuthed) {
            return remoteItems.reduce((sum, it) => {
                const price = Number(it.product?.price ?? 0);
                return sum + price * it.quantity;
            }, 0);
        } else {
            return localItems.reduce((sum, it) => sum + Number(it.price ?? 0) * it.quantity, 0);
        }
    }, [isAuthed, remoteItems, localItems]);

    // Acciones carrito AUTENTICADO
    const incRemote = async (itemId: string) => {
        const item = remoteItems.find((i) => i.id === itemId);
        if (!item) return;
        await updateRemoteQty(itemId, item.quantity + 1);
        // refrescar lista
        const items = await getRemoteCart();
        setRemoteItems(items);
    };
    const decRemote = async (itemId: string) => {
        const item = remoteItems.find((i) => i.id === itemId);
        if (!item) return;
        const nextQty = item.quantity - 1;
        await updateRemoteQty(itemId, nextQty);
        const items = await getRemoteCart();
        setRemoteItems(items);
    };
    const removeRemoteItem = async (itemId: string) => {
        await removeRemote(itemId);
        const items = await getRemoteCart();
        setRemoteItems(items);
    };
    const clearRemoteCartNow = async () => {
        await clearRemote();
        setRemoteItems([]);
    };
    const checkout = async () => {
        try {
            const result = await remoteCheckout();
            console.log('Order complete:', result);
            // Redirigir a order success, Stripe, etc.
        } catch (e) {
            console.error('Checkout error:', e);
        }
    };

    // Acciones carrito ANÓNIMO
    const incLocal = (id: string) => {
        const item = localItems.find((i) => i.id === id);
        if (!item) return;
        const nextQty = item.quantity + 1;
        updateLocalQty(id, nextQty);
        setLocalItems(loadLocalCart());
    };
    const decLocal = (id: string) => {
        const item = localItems.find((i) => i.id === id);
        if (!item) return;
        const nextQty = item.quantity - 1;
        if (nextQty < 1) {
            removeLocalItem(id);
        } else {
            updateLocalQty(id, nextQty);
        }
        setLocalItems(loadLocalCart());
    };
    const removeLocal = (id: string) => {
        removeLocalItem(id);
        setLocalItems(loadLocalCart());
    };
    const clearLocal = () => {
        clearLocalCart();
        setLocalItems([]);
    };

    // Render helpers
    const renderRemoteThumb = (it: RemoteCartItem) => {
        const url = resolvedUrls[it.id];
        return url ? (
            <img src={url} alt={it.product?.name || 'Product'} className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ShoppingCart size={32} />
            </div>
        );
    };

    const renderLocalThumb = (it: LocalCartItem) => {
        const url = it.imageUrl;
        return url ? (
            <img src={url} alt={it.name} className="w-full h-full object-cover" />
        ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <ShoppingCart size={32} />
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <section className="py-12 bg-secondary">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl font-bold mb-4 text-gradient">Your Cart</h1>
                        <p className="text-lg text-muted-foreground">Review your items before checkout</p>
                    </div>
                </section>

                <section className="py-10">
                    <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <div className="bg-card border border-border rounded-xl p-4">
                                <h2 className="font-semibold mb-4">
                                    Cart Items ({isAuthed ? remoteItems.length : localItems.length})
                                </h2>

                                {loading ? (
                                    <div className="space-y-3">
                                        {[...Array(2)].map((_, i) => (
                                            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
                                        ))}
                                    </div>
                                ) : isAuthed ? (
                                    remoteItems.length === 0 ? (
                                        <div className="text-muted-foreground py-8 text-center">Your cart is empty</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {remoteItems.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex items-center gap-4 p-3 rounded-lg border border-border"
                                                >
                                                    <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0 bg-muted">
                                                        {renderRemoteThumb(item)}
                                                    </div>

                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium truncate">{item.product?.name}</div>
                                                        <div className="text-sm text-muted-foreground">
                                                            €{Number(item.product?.price ?? 0).toFixed(2)}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => decRemote(item.id)}
                                                            aria-label="Decrease quantity"
                                                        >
                                                            <Minus size={16} />
                                                        </Button>
                                                        <div className="w-8 text-center">{item.quantity}</div>
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={() => incRemote(item.id)}
                                                            aria-label="Increase quantity"
                                                        >
                                                            <Plus size={16} />
                                                        </Button>
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="text-destructive"
                                                        onClick={() => removeRemoteItem(item.id)}
                                                        aria-label="Remove item"
                                                    >
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )
                                ) : localItems.length === 0 ? (
                                    <div className="text-muted-foreground py-8 text-center">Your cart is empty</div>
                                ) : (
                                    <div className="space-y-3">
                                        {localItems.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center gap-4 p-3 rounded-lg border border-border"
                                            >
                                                <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0 bg-muted">
                                                    {renderLocalThumb(item)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium truncate">{item.name}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        €{Number(item.price ?? 0).toFixed(2)}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => decLocal(item.id)}
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus size={16} />
                                                    </Button>
                                                    <div className="w-8 text-center">{item.quantity}</div>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => incLocal(item.id)}
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus size={16} />
                                                    </Button>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive"
                                                    onClick={() => removeLocal(item.id)}
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Clear cart */}
                            {!loading && (
                                <div className="mt-3">
                                    {isAuthed ? (
                                        <Button variant="outline" onClick={clearRemoteCartNow}>
                                            Clear Cart
                                        </Button>
                                    ) : (
                                        <Button variant="outline" onClick={clearLocal}>
                                            Clear Cart
                                        </Button>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Order summary */}
                        <div className="md:col-span-1">
                            <div className="bg-card border border-border rounded-xl p-4">
                                <h3 className="font-semibold mb-4">Order Summary</h3>
                                <div className="flex justify-between text-sm mb-2">
                                    <span>Subtotal</span>
                                    <span>€{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm mb-4">
                                    <span>Shipping</span>
                                    <span>Free</span>
                                </div>
                                <div className="flex justify-between font-semibold text-base mb-4">
                                    <span>Total</span>
                                    <span>€{subtotal.toFixed(2)}</span>
                                </div>
                                {isAuthed ? (
                                    <Button className="w-full" onClick={checkout} disabled={loading || remoteItems.length === 0}>
                                        <ShoppingCart className="mr-2 h-4 w-4" />
                                        Checkout
                                    </Button>
                                ) : (
                                    <div className="text-sm text-muted-foreground">
                                        Please sign in to checkout.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Cart;