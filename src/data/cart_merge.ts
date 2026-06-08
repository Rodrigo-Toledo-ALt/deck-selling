// mergeAnonymousCartOnLogin.ts
// Función que fusiona el carrito local (anónimo) con el carrito remoto al iniciar sesión.
// Se ejecuta tras un login exitoso para no perder items añadidos como invitado.

import { addToCart } from './cart_remote';
import { loadLocalCart, clearLocalCart } from './local_cart';

/**
 * Fusiona los items del carrito local (almacenado en localStorage)
 * con el carrito remoto del usuario logueado.
 *
 * Flujo:
 * 1. Lee items del carrito local.
 * 2. Si hay items, los añade uno a uno al carrito remoto.
 * 3. Limpia el carrito local al finalizar.
 *
 * Nota: se asume que addToCart maneja incrementos si el item ya existe.
 */
export async function mergeAnonymousCartOnLogin() {
    // Cargar items del carrito local (anónimo)
    const anon = loadLocalCart();
    if (!anon.length) {
        console.log('🛒 No anonymous cart to merge');
        return;
    }

    console.log(`🛒 Merging ${anon.length} items from anonymous cart...`);

    // Añadir cada item del carrito local al carrito remoto
    for (const it of anon) {
        try {
            await addToCart(it.product_id, it.quantity);
        } catch (err) {
            // Si falla un item, lo registramos pero continuamos con los demás
            console.error(`⚠️ Failed to merge item ${it.product_id}:`, err);
        }
    }

    // Limpiar el carrito local tras la fusión
    clearLocalCart();
    console.log('✅ Anonymous cart merged and cleared');

    // Opcional: emitir evento global para notificar cambios en UI
    window.dispatchEvent(new Event('cartUpdated'));
}