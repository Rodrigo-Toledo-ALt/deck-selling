import { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import CheckoutForm from '@/components/CheckoutForm';
import { useLocation } from 'react-router-dom';

const CheckoutPage = () => {
    const location = useLocation();
    // Recibes el clientSecret desde Cart.tsx via navigate state
    const { clientSecret, orderId } = location.state || {};

    if (!clientSecret) return <div>Error: no payment session found.</div>;

    return (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
            <CheckoutForm orderId={orderId} />
        </Elements>
    );
};

export default CheckoutPage;