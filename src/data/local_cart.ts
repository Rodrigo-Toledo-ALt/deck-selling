// src/data/local_cart.ts
export type LocalCartItem = {
    product_id: string;
    quantity: number;
    name: string;
    price: number;
    image_url?: string | null;
};

const KEY = 'anon_cart_v1';

export function loadLocalCart(): LocalCartItem[] {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function saveLocalCart(items: LocalCartItem[]) {
    localStorage.setItem(KEY, JSON.stringify(items));
}

export function addToLocalCart(
    product_id: string,
    name: string,
    price: number,
    image_url: string | null | undefined,
    qty = 1
) {
    const items = loadLocalCart();
    const idx = items.findIndex(i => i.product_id === product_id);
    if (idx >= 0) {
        items[idx].quantity += qty;
    } else {
        items.push({ product_id, quantity: qty, name, price, image_url: image_url ?? null });
    }
    saveLocalCart(items);
}

export function updateLocalCartQuantity(product_id: string, quantity: number) {
    const items = loadLocalCart();
    if (quantity < 1) {
        // Remove item
        const filtered = items.filter(i => i.product_id !== product_id);
        saveLocalCart(filtered);
        return;
    }
    const idx = items.findIndex(i => i.product_id === product_id);
    if (idx >= 0) {
        items[idx].quantity = quantity;
        saveLocalCart(items);
    }
}

export function removeFromLocalCart(product_id: string) {
    const items = loadLocalCart();
    const filtered = items.filter(i => i.product_id !== product_id);
    saveLocalCart(filtered);
}

export function clearLocalCart() {
    localStorage.removeItem(KEY);
}