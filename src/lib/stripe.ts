// stripeClient.ts
// Configura y exporta la instancia de Stripe para el frontend.
// Usa la clave pública del entorno para inicializar Stripe.js.

import { loadStripe } from '@stripe/stripe-js';

// Carga la instancia de Stripe.js usando la clave pública del entorno.
// Esta promesa se resuelve con el objeto Stripe listo para usar.
export const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);