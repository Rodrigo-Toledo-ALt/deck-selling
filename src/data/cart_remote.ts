// cart_remote.ts
// Operaciones CRUD del carrito almacenado en Supabase (remoto).
// Comentarios en español para el TFG: explicación rápida de cada función,
// decisiones relevantes y posibles mejoras (p. ej. evitar condiciones de carrera).

import { supabase } from '@/supabase/supabase-client';

export type Product = {
    id: string;
    name: string;
    price: number;
    main_image_path?: string | null; // ruta a la imagen principal (según el schema)
};

export type CartItem = {
    id: string;
    cart_id: string;
    product_id: string;
    quantity: number;
    product?: Product; // Proyección/relación con la tabla products
};

/**
 * Obtiene el userId del usuario autenticado a través de Supabase Auth.
 * Devuelve null si no hay sesión.
 */
async function getUserId(): Promise<string | null> {
    const { data } = await supabase.auth.getUser();
    return data.user?.id ?? null;
}

/**
 * Devuelve el id del carrito del usuario si existe o lo crea si no.
 * Lanza error si no hay usuario autenticado.
 *
 * Observación: el patrón "buscar y crear si no existe" puede sufrir
 * condiciones de carrera si se llama concurrentemente. En producción
 * es preferible usar una función RPC/transactional en el backend que
 * realice esto de forma atómica.
 */
export async function getOrCreateCartId(): Promise<string> {
    const userId = await getUserId();
    if (!userId) throw new Error('Not authenticated');

    // Intentamos recuperar un carrito existente
    const { data: existing, error: selErr } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
    if (selErr) throw selErr;

    if (existing?.id) return existing.id;

    // Si no existe, creamos uno nuevo y devolvemos su id
    const { data: created, error: insErr } = await supabase
        .from('carts')
        .insert({ user_id: userId })
        .select('id')
        .single();
    if (insErr) throw insErr;

    return created.id;
}

/**
 * Obtiene los items del carrito del usuario, incluyendo datos del producto asociados.
 * Si no hay usuario autenticado devuelve array vacío.
 */
export async function getCart(): Promise<CartItem[]> {
    const userId = await getUserId();
    if (!userId) return [];

    // Buscamos el carrito del usuario
    const { data: cart, error: cartErr } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
    if (cartErr) throw cartErr;
    if (!cart) return [];

    // Recuperamos los items y hacemos join con products para obtener nombre, precio e imagen
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

/**
 * Añade un producto al carrito. Si ya existe, incrementa la cantidad.
 * - product_id: id del producto a añadir
 * - qty: cantidad a añadir (por defecto 1)
 *
 * Se basa en getOrCreateCartId y luego busca si existe un cart_item para ese producto.
 * Lanza excepciones en caso de error (se propagan al llamador).
 *
 * Nota: si varias llamadas concurrentes intentan añadir el mismo producto
 * puede haber condiciones de carrera que acaben en cantidades incorrectas.
 * Para evitarlo, conviene manejar esto en el backend (RPC) o usar transacciones.
 */
export async function addToCart(product_id: string, qty = 1) {
    const cartId = await getOrCreateCartId();

    // Comprobamos si ya existe la fila para este producto en el carrito
    const { data: existing, error: selErr } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('cart_id', cartId)
        .eq('product_id', product_id)
        .maybeSingle();
    if (selErr) throw selErr;

    if (existing) {
        // Si existe, actualizamos la cantidad sumando 'qty'
        const { error } = await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity + qty })
            .eq('id', existing.id);
        if (error) throw error;
    } else {
        // Si no existe, insertamos una nueva fila
        const { error } = await supabase
            .from('cart_items')
            .insert({ cart_id: cartId, product_id, quantity: qty });
        if (error) throw error;
    }
    return true;
}

/**
 * Actualiza la cantidad de un item del carrito por su id.
 * - Si la nueva cantidad es menor que 1, elimina el item.
 */
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

/**
 * Elimina un item del carrito por su id.
 */
export async function removeFromCart(item_id: string) {
    const { error } = await supabase.from('cart_items').delete().eq('id', item_id);
    if (error) throw error;
    return true;
}

/**
 * Elimina todos los items del carrito del usuario autenticado.
 * Si no hay usuario, devuelve true (no hay nada que hacer).
 */
export async function clearCart() {
    const userId = await getUserId();
    if (!userId) return true;

    // Recuperamos el carrito del usuario
    const { data: cart, error: cartErr } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
    if (cartErr) throw cartErr;
    if (!cart) return true;

    // Borramos todos los items asociados
    const { error } = await supabase.from('cart_items').delete().eq('cart_id', cart.id);
    if (error) throw error;
    return true;
}