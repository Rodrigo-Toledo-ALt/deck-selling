// cart_local.ts
// Gestiona el carrito de compras local (para usuarios no registrados) usando localStorage.
// Permite añadir, actualizar cantidades, eliminar y limpiar el carrito.

// ── TIPOS ───────────────────────────────────────────────────────────────

// Representa un artículo en el carrito local
export type LocalCartItem = {
    product_id: string;  // ID único del producto
    quantity: number;    // Cantidad del producto
    name: string;        // Nombre del producto
    price: number;       // Precio unitario
    image_url?: string | null; // URL opcional de la imagen
};

// Clave usada para almacenar el carrito en localStorage
const KEY = 'anon_cart_v1';

// ── FUNCIONES ───────────────────────────────────────────────────────────

/**
 * Carga el carrito desde localStorage.
 * Devuelve un array vacío si no existe o hay error.
 */
export function loadLocalCart(): LocalCartItem[] {
    try {
        const raw = localStorage.getItem(KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return []; // En caso de error (ej: JSON inválido), retorna vacío
    }
}

/**
 * Guarda el carrito en localStorage.
 */
export function saveLocalCart(items: LocalCartItem[]) {
    localStorage.setItem(KEY, JSON.stringify(items));
}

/**
 * Añade un producto al carrito o incrementa su cantidad si ya existe.
 * qty: cantidad a añadir (por defecto 1).
 */
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
        // Producto ya en carrito: aumenta cantidad
        items[idx].quantity += qty;
    } else {
        // Nuevo producto: lo agrega
        items.push({ product_id, quantity: qty, name, price, image_url: image_url ?? null });
    }
    saveLocalCart(items);
}

/**
 * Actualiza la cantidad de un producto en el carrito.
 * Si quantity <= 0, elimina el producto.
 */
export function updateLocalCartQuantity(product_id: string, quantity: number) {
    const items = loadLocalCart();
    if (quantity < 1) {
        // Elimina el producto si cantidad <= 0
        const filtered = items.filter(i => i.product_id !== product_id);
        saveLocalCart(filtered);
        return;
    }
    const idx = items.findIndex(i => i.product_id === product_id);
    if (idx >= 0) {
        // Actualiza cantidad
        items[idx].quantity = quantity;
        saveLocalCart(items);
    }
}

/**
 * Elimina un producto específico del carrito.
 */
export function removeFromLocalCart(product_id: string) {
    const items = loadLocalCart();
    const filtered = items.filter(i => i.product_id !== product_id);
    saveLocalCart(filtered);
}

/**
 * Limpia completamente el carrito local.
 */
export function clearLocalCart() {
    localStorage.removeItem(KEY);
}