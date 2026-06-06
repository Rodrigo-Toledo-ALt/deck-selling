// src/pages/admin/OrdersManagement.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout.tsx';
import { supabase } from '@/supabase/supabase-client.ts';

export interface Order {
    id: string;
    user_id: string;
    status: string | null;
    stripe_status: string | null;
    total_amount: number;
    order_date: string | null;
    stripe_payment_intent_id: string | null;
    users?: { username: string; email: string };
}

const statusVariant: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    paid: 'default',
    pending: 'secondary',
    cancelled: 'destructive',
    shipped: 'outline',
};

const OrdersManagement: React.FC = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [query, setQuery] = useState('');

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('orders')
                    .select('id, user_id, status, stripe_status, total_amount, order_date, stripe_payment_intent_id, users(username, email)')
                    .order('order_date', { ascending: false });

                if (error) throw error;
                setOrders(data as Order[]);
            } catch (e) {
                console.error(e);
                toast({ title: 'Error', description: 'No se pudieron cargar los pedidos', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = orders.filter(o => {
        const q = query.toLowerCase().trim();
        if (!q) return true;
        return (
            o.id.toLowerCase().includes(q) ||
            (o.status ?? '').toLowerCase().includes(q) ||
            (o.stripe_status ?? '').toLowerCase().includes(q) ||
            o.users?.email?.toLowerCase().includes(q) ||
            o.users?.username?.toLowerCase().includes(q)
        );
    });

    return (
        <AdminLayout>
            <div className="p-4 md:p-6 space-y-4">
                <Card>
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Orders</CardTitle>
                        <div className="flex items-center gap-2 w-full md:w-96">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by ID, email, status..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Order ID</TableHead>
                                        <TableHead>Customer</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Stripe</TableHead>
                                        <TableHead>Total</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                                        </TableRow>
                                    ) : filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">No orders found</TableCell>
                                        </TableRow>
                                    ) : (
                                        filtered.map(o => (
                                            <TableRow key={o.id}>
                                                <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}...</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{o.users?.username ?? '-'}</span>
                                                        <span className="text-xs text-muted-foreground">{o.users?.email ?? '-'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={statusVariant[o.status ?? ''] ?? 'secondary'}>
                                                        {o.status ?? 'unknown'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={statusVariant[o.stripe_status ?? ''] ?? 'outline'}>
                                                        {o.stripe_status ?? '-'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>€{Number(o.total_amount).toFixed(2)}</TableCell>
                                                <TableCell>
                                                    {o.order_date ? new Date(o.order_date).toLocaleDateString() : '-'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm" variant="outline" onClick={() => navigate(`/admin/orders/${o.id}`)}>
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
};

export default OrdersManagement;