import { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const CheckoutForm = ({ orderId }: { orderId: string }) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setLoading(true);
        setError(null);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Stripe redirige aquí tras el pago
                return_url: `${window.location.origin}/order-success?orderId=${orderId}`,
            },
        });

        if (error) {
            setError(error.message ?? 'Payment failed');
            setLoading(false);
        }
        // Si no hay error, Stripe redirige automáticamente
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 space-y-4">
            <h2 className="text-xl font-semibold">Complete your payment</h2>
            <PaymentElement />
            {error && <p className="text-destructive text-sm">{error}</p>}
            <Button type="submit" disabled={!stripe || loading} className="w-full">
                {loading ? 'Processing...' : 'Pay now'}
            </Button>
        </form>
    );
};

export default CheckoutForm;