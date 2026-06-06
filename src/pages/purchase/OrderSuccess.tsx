import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/supabase/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

interface OrderDetail {
    id: string;
    order_date: string;
    total_amount: number;
    status: string;
    shipping_address: {
        full_name: string;
        address: string;
        city: string;
        state: string;
        postal_code: string;
        country: string;
    } | null;
    items: {
        quantity: number;
        price: number;
        product: { name: string };
    }[];
}

const OrderSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const orderId = searchParams.get('orderId');

    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) { setError(true); setLoading(false); return; }

            const { data, error } = await supabase
                .from('orders')
                .select(`
                    id, order_date, total_amount, status,
                    shipping_address:addresses!orders_shipping_address_id_fkey (
                        full_name, address, city, state, postal_code, country
                    ),
                    items:order_items (
                        quantity, price,
                        product:products ( name )
                    )
                `)
                .eq('id', orderId)
                .maybeSingle();

            if (error || !data) setError(true);
            else setOrder(data as unknown as OrderDetail);
            setLoading(false);
        };
        fetchOrder();
    }, [orderId]);

    if (loading) return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex items-center justify-center">
                <p className="text-muted-foreground">Loading your order...</p>
            </main>
            <Footer />
        </div>
    );

    if (error || !order) return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">Could not load order details.</p>
                <Button onClick={() => navigate('/')}>Go to home</Button>
            </main>
            <Footer />
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <div className="max-w-2xl mx-auto p-6 space-y-6">
                    <div className="flex flex-col items-center text-center space-y-2 py-4">
                        <CheckCircle2 className="w-16 h-16 text-green-500" />
                        <h1 className="text-2xl font-bold">Order confirmed!</h1>
                        <p className="text-muted-foreground">
                            Thank you for your purchase. We'll start preparing your order right away.
                        </p>
                    </div>

                    <Card>
                        <CardHeader><CardTitle>Order summary</CardTitle></CardHeader>
                        <CardContent className="space-y-3">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                    <span>
                                        <span className="font-medium">{item.product.name}</span>
                                        <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                                    </span>
                                    <span>€{(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className="border-t pt-3 flex justify-between font-semibold">
                                <span>Total</span>
                                <span>€{Number(order.total_amount).toFixed(2)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {order.shipping_address && (
                        <Card>
                            <CardHeader><CardTitle>Shipping to</CardTitle></CardHeader>
                            <CardContent className="text-sm space-y-1">
                                <p className="font-medium">{order.shipping_address.full_name}</p>
                                <p className="text-muted-foreground">{order.shipping_address.address}</p>
                                <p className="text-muted-foreground">
                                    {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}, {order.shipping_address.country}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <Card>
                        <CardContent className="pt-4 text-sm flex justify-between text-muted-foreground">
                            <span>Date: {new Date(order.order_date).toLocaleDateString('es-ES')}</span>
                            <span className="capitalize">Status: {order.status}</span>
                        </CardContent>
                    </Card>

                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => navigate('/account')}>
                            My account
                        </Button>
                        <Button className="flex-1" onClick={() => navigate('/')}>
                            Continue shopping
                        </Button>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default OrderSuccess;