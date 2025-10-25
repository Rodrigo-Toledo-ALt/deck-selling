// src/data/cart_merge.ts
import { addToCart } from './cart_remote';
import { loadLocalCart, clearLocalCart } from './local_cart';

export async function mergeAnonymousCartOnLogin() {
    const anon = loadLocalCart();
    if (!anon.length) {
        console.log('🛒 No anonymous cart to merge');
        return;
    }

    console.log(`🛒 Merging ${anon.length} items from anonymous cart...`);

    for (const it of anon) {
        try {
            await addToCart(it.product_id, it.quantity);
        } catch (err) {
            console.error(`⚠️ Failed to merge item ${it.product_id}:`, err);
        }
    }

    clearLocalCart();
    console.log('✅ Anonymous cart merged and cleared');
}