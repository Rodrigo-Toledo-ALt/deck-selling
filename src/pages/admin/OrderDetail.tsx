// OrderDetail.tsx
// Página administrativa para ver y gestionar un pedido:
// - carga pedido, items y historial desde Supabase
// - permite cambiar el estado del pedido usando una función RPC (set_order_status)
// - interfaz con varias tarjetas (cliente, dirección, pago, items, historial)
// Comentarios concisos en español para el TFG.

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/supabase/supabase-client.ts';
import AdminLayout from '@/components/AdminLayout.tsx';
import Navbar from "@/components/Navbar.tsx";

// Formatea importe a EUR (utilidad pequeña usada en la UI)
const currency = (n: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(n);

// Opciones de estado y mapeo a variantes visuales (badges)
const STATUS_OPTIONS = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'] as const;
type OrderStatus = typeof STATUS_OPTIONS[number];

const statusVariant: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    paid: 'default',
    delivered: 'default',
    pending: 'secondary',
    processing: 'secondary',
    shipped: 'outline',
    cancelled: 'destructive',
};

// Tipado local mínimo para renderizar datos
interface OrderItem {
    id: string;
    quantity: number;
    price: number;
    products: { name: string; main_image_path: string | null };
}

interface Address {
    full_name: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

interface StatusHistory {
    id: string;
    old_status: string | null;
    new_status: string;
    note: string | null;
    changed_at: string;
    users: { username: string } | null;
}

interface OrderDetailData {
    id: string;
    user_id: string;
    status: string | null;
    stripe_status: string | null;
    stripe_payment_intent_id: string | null;
    total_amount: number;
    order_date: string | null;
    users: { username: string; email: string } | null;
    addresses: Address | null;
}

const OrderDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // id del pedido desde la ruta
    const { toast } = useToast();
    const navigate = useNavigate();

    // Estados de carga y datos
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<OrderDetailData | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [history, setHistory] = useState<StatusHistory[]>([]);

    const [newStatus, setNewStatus] = useState<OrderStatus | ''>(''); // estado seleccionado para actualizar
    const [note, setNote] = useState(''); // nota opcional al cambiar estado
    const [saving, setSaving] = useState(false); // bloqueo mientras se guarda

    // Carga inicial / cuando cambia el id
    useEffect(() => {
        if (!id) return;
        loadOrder();
    }, [id]);

    // Carga completa: pedido, items y historial
    const loadOrder = async () => {
        try {
            setLoading(true);

            // 1) Pedido con usuario y dirección (join)
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select(`
                    id, user_id, status, stripe_status,
                    stripe_payment_intent_id, total_amount, order_date,
                    users(username, email),
                    addresses(full_name, address, city, state, postal_code, country)
                `)
                .eq('id', id)
                .single();

            if (orderError) throw orderError;
            setOrder(orderData as OrderDetailData);
            setNewStatus((orderData.status as OrderStatus) ?? 'pending');

            // 2) Items del pedido
            const { data: itemsData, error: itemsError } = await supabase
                .from('order_items')
                .select('id, quantity, price, products(name, main_image_path)')
                .eq('order_id', id);

            if (itemsError) throw itemsError;
            setItems(itemsData as OrderItem[]);

            // 3) Historial de cambios de estado (más reciente primero)
            const { data: historyData, error: historyError } = await supabase
                .from('order_status_history')
                .select('id, old_status, new_status, note, changed_at, users(username)')
                .eq('order_id', id)
                .order('changed_at', { ascending: false });

            if (historyError) throw historyError;
            setHistory(historyData as StatusHistory[]);

        } catch (e) {
            console.error(e);
            toast({ title: 'Error', description: 'No se pudo cargar el pedido', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    // Llamada para cambiar estado:
    // - usa la RPC 'set_order_status' definida en la base de datos (transaccional / con historial)
    // - refresca la vista llamando a loadOrder()
    const handleStatusChange = async () => {
        if (!id || !newStatus || newStatus === order?.status) return;
        try {
            setSaving(true);
            const { error } = await supabase.rpc('set_order_status', {
                p_order_id: id,
                p_new_status: newStatus,
                p_note: note.trim() || null,
            });
            if (error) throw error;
            toast({ title: 'Status updated', description: `Order is now "${newStatus}"` });
            setNote('');
            await loadOrder(); // refrescar datos y historial
        } catch (e: any) {
            console.error(e);
            toast({ title: 'Error', description: e.message ?? 'No se pudo actualizar el estado', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    // Renderes de carga / no encontrado
    if (loading) return <AdminLayout><div className="p-6">Loading...</div></AdminLayout>;

    if (!order) return (
        <AdminLayout>
            <div className="p-6">
                <p className="mb-4">Pedido no encontrado.</p>
                <Button asChild variant="outline"><Link to="/admin/orders">Back to Orders</Link></Button>
            </div>
        </AdminLayout>
    );

    // Render principal con Navbar + AdminLayout
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <AdminLayout>
                <div className="p-4 md:p-6 space-y-6">

                    {/* Header con identificador parcial y botón volver */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">
                            Order <span className="font-mono text-base text-muted-foreground">#{order.id.slice(0, 8)}...</span>
                        </h1>
                        <Button asChild variant="outline"><Link to="/admin/orders">Back</Link></Button>
                    </div>

                    {/* Grid con tarjetas: cliente, dirección, pago y cambio de estado */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                        {/* Cliente */}
                        <Card>
                            <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div><span className="text-muted-foreground">Username: </span>{order.users?.username ?? '-'}</div>
                                <div><span className="text-muted-foreground">Email: </span>{order.users?.email ?? '-'}</div>
                                <div className="pt-1">
                                    <Button size="sm" variant="outline" onClick={() => navigate(`/admin/clients/${order.user_id}`)}>
                                        View Client
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dirección de envío */}
                        <Card>
                            <CardHeader><CardTitle>Shipping Address</CardTitle></CardHeader>
                            <CardContent className="text-sm space-y-1">
                                {order.addresses ? (
                                    <>
                                        <div>{order.addresses.full_name}</div>
                                        <div>{order.addresses.address}</div>
                                        <div>{order.addresses.city}, {order.addresses.state} {order.addresses.postal_code}</div>
                                        <div>{order.addresses.country}</div>
                                    </>
                                ) : (
                                    <div className="text-muted-foreground">No shipping address</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Información de pago */}
                        <Card>
                            <CardHeader><CardTitle>Payment</CardTitle></CardHeader>
                            <CardContent className="text-sm space-y-2">
                                <div>
                                    <span className="text-muted-foreground">Total: </span>
                                    <span className="font-semibold">{currency(order.total_amount)}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Stripe status: </span>
                                    <Badge variant={statusVariant[order.stripe_status as OrderStatus] ?? 'outline'}>
                                        {order.stripe_status ?? '-'}
                                    </Badge>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Payment Intent: </span>
                                    <span className="font-mono text-xs">{order.stripe_payment_intent_id ?? '-'}</span>
                                </div>
                                <div>
                                    <span className="text-muted-foreground">Date: </span>
                                    {order.order_date ? new Date(order.order_date).toLocaleString() : '-'}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Panel para actualizar estado del pedido */}
                        <Card>
                            <CardHeader><CardTitle>Update Status</CardTitle></CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">Current:</span>
                                    <Badge variant={statusVariant[order.status as OrderStatus] ?? 'secondary'}>
                                        {order.status ?? 'unknown'}
                                    </Badge>
                                </div>
                                <Select value={newStatus} onValueChange={(v) => setNewStatus(v as OrderStatus)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select new status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {STATUS_OPTIONS.map(s => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Textarea
                                    placeholder="Note (optional)..."
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    rows={2}
                                />
                                <Button
                                    onClick={handleStatusChange}
                                    disabled={saving || !newStatus || newStatus === order.status}
                                    className="w-full"
                                >
                                    {saving ? 'Saving...' : 'Save Status'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabla con los items del pedido */}
                    <Card>
                        <CardHeader><CardTitle>Order Items</CardTitle></CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Product</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Unit Price</TableHead>
                                            <TableHead className="text-right">Subtotal</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">No items</TableCell>
                                            </TableRow>
                                        ) : items.map(item => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">{item.products?.name ?? '-'}</TableCell>
                                                <TableCell>{item.quantity}</TableCell>
                                                <TableCell>{currency(item.price)}</TableCell>
                                                <TableCell className="text-right">{currency(item.price * item.quantity)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            {items.length > 0 && (
                                <div className="flex justify-end pt-4 font-semibold">
                                    Total: {currency(order.total_amount)}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Historial de cambios de estado */}
                    <Card>
                        <CardHeader><CardTitle>Status History</CardTitle></CardHeader>
                        <CardContent>
                            {history.length === 0 ? (
                                <div className="text-sm text-muted-foreground">No history yet</div>
                            ) : (
                                <div className="space-y-3">
                                    {history.map(h => (
                                        <div key={h.id} className="flex items-start gap-3 text-sm border-b pb-3 last:border-0">
                                            <div className="flex-1 space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant={statusVariant[h.old_status as OrderStatus] ?? 'outline'}>
                                                        {h.old_status ?? 'none'}
                                                    </Badge>
                                                    <span className="text-muted-foreground">→</span>
                                                    <Badge variant={statusVariant[h.new_status as OrderStatus] ?? 'secondary'}>
                                                        {h.new_status}
                                                    </Badge>
                                                </div>
                                                {h.note && <div className="text-muted-foreground italic">"{h.note}"</div>}
                                            </div>
                                            <div className="text-right text-xs text-muted-foreground shrink-0">
                                                <div>{h.users?.username ?? 'system'}</div>
                                                <div>{new Date(h.changed_at).toLocaleString()}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </AdminLayout>
        </div>
    );
};

export default OrderDetail;