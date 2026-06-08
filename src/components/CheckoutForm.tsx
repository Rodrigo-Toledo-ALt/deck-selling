// CheckoutForm.tsx
// Formulario de pago usando Stripe Elements.
// Recopila datos de tarjeta y envía el pago asociado a un orderId.
// Redirige a /order-success tras completar el pago.

import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CheckoutForm = ({ orderId }: { orderId: string }) => {
    // Hooks de Stripe para manejar el formulario de pago
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();

    // Estados locales para feedback visual
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Envía el pago usando Stripe
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Protección básica: si Stripe aún no carga, no hacemos nada
        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        // Confirmamos el pago con los datos del formulario
        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // URL a la que Stripe redirige tras procesar el pago
                return_url: `${window.location.origin}/order-success?orderId=${orderId}`,
            },
        });

        // Si hay error, lo mostramos al usuario
        if (error) {
            setError(error.message ?? 'Payment failed');
            setLoading(false);
        }
        // Si no hay error, Stripe redirige automáticamente al return_url
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-4">
            <h2 className="text-xl font-semibold">Complete your payment</h2>

            {/* Elemento de pago gestionado por Stripe (tarjeta, etc.) */}
            <PaymentElement />

            {/* Mensaje de error si falla el pago */}
            {error && <p className="text-destructive text-sm">{error}</p>}

            {/* Botón de pago: inhabilitado si Stripe no está listo o si está procesando */}
            <Button type="submit" disabled={!stripe || loading} className="w-full">
                {loading ? 'Processing...' : 'Pay now'}
            </Button>
        </form>
    );
};

export default CheckoutForm;