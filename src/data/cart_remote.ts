// src/data/cart_remote.ts
import { supabase } from '@/supabase/supabase-client';

export type Product = {
    id: string;
    name: string;
    price: number;
    main_image_path?: string | null; // ← actualizado según tu schema
};

export type CartItem = {
    id: string;
    cart_id: string;
    product_id: string;
    quantity: number;
    product?: Product; // join
};

async function getUserId(): Promise<string | null> {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
}

export async function getOrCreateCartId(): Promise<string> {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    const { data: existing, error: selErr } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
    if (selErr) throw selErr;

    if (existing?.id) return existing.id;

    const { data: created, error: insErr } = await supabase
        .from('carts')
        .insert({ user_id: userId })
        .select('id')
        .single();
    if (insErr) throw insErr;

    return created.id;
}

export async function getCart(): Promise<CartItem[]> {
    const userId = await getUserId();
    if (!userId) return [];

    const { data: cart, error: cartErr } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
    if (cartErr) throw cartErr;
    if (!cart) return [];

    const { data, error } = await supabase
        .from('cart_items')
        .select(`
      id, cart_id, product_id, quantity,
      product:products(id, name, price, main_image_path)
    `)
        .eq('cart_id', cart.id)
        .order('id', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as CartItem[];
}

export async function addToCart(product_id: string, qty = 1) {
    const cartId = await getOrCreateCartId();

    const { data: existing, error: selErr } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('product_id', product_id)
        .maybeSingle();
    if (selErr) throw selErr;

    if (existing) {
        const { error } = await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + qty })
            .eq('id', existing.id);
        if (error) throw error;
    } else {
        const { error } = await supabase
            .from('cart_items')
            .insert({ cart_id: cartId, product_id, quantity: qty });
        if (error) throw error;
    }
    return true;
}

export async function updateQuantity(item_id: string, quantity: number) {
    if (quantity < 1) {
        const { error } = await supabase.from('cart_items').delete().eq('id', item_id);
        if (error) throw error;
        return true;
    }
    const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', item_id);
    if (error) throw error;
    return true;
}

export async function removeFromCart(item_id: string) {
    const { error } = await supabase.from('cart_items').delete().eq('id', item_id);
    if (error) throw error;
    return true;
}

export async function clearCart() {
    const userId = await getUserId();
    if (!userId) return true;
    const { data: cart, error: cartErr } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
    if (cartErr) throw cartErr;
    if (!cart) return true;

    const { error } = await supabase.from('cart_items').delete().eq('cart_id', cart.id);
    if (error) throw error;
    return true;
}

export async function checkout() {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    const items = await getCart();
    if (items.length === 0) throw new Error('Cart is empty');

    const total = items.reduce((sum, it) => sum + (it.product?.price ? Number(it.product.price) : 0) * it.quantity, 0);

    const { data: order, error: ordErr } = await supabase
        .from('orders')
        .insert({
            user_id: userId,
            total_amount: total,
            order_date: new Date().toISOString(),
        })
        .select('id')
        .single();
    if (ordErr) throw ordErr;

    const orderItems = items.map(it => ({
        order_id: order.id,
        product_id: it.product_id,
        quantity: it.quantity,
        price: it.product?.price ?? 0, // snapshot
    }));

    const { error: oiErr } = await supabase.from('order_items').insert(orderItems);
    if (oiErr) throw oiErr;

    await clearCart();

    return { order_id: order.id, total };
}