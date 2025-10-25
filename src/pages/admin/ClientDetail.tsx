// src/pages/admin/ClientDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getClientById, ClientDetail } from '@/data/users_remote';
import Navbar from "@/components/Navbar.tsx";
import AdminLayout from "@/components/AdminLayout.tsx";

const currency = (n: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(n);

const ClientDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [client, setClient] = useState<ClientDetail | null>(null);

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                setLoading(true);
                const data = await getClientById(id);
                if (!data) {
                    toast({ title: 'Not found', description: 'Cliente no encontrado', variant: 'destructive' });
                }
                setClient(data ?? null);
            } catch (e) {
                console.error(e);
                toast({ title: 'Error', description: 'No se pudo cargar el cliente', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <div className="p-6">Loading...</div>;

    if (!client) {
        return (
            <div className="p-6">
                <p className="mb-4">Cliente no encontrado.</p>
                <Button asChild variant="outline"><Link to="/admin/clients">Back to Clients</Link></Button>
            </div>
        );
    }

    return (


        <div className="flex flex-col min-h-screen">
            <Navbar />
            <AdminLayout>
        <div className="p-4 md:p-6 space-y-6">

            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Client: {client.username}</h1>
                <Button asChild variant="outline"><Link to="/admin/clients">Back</Link></Button>
            </div>

            <Card>
                <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                    <div><span className="text-muted-foreground">Username:</span> {client.username}</div>
                    <div><span className="text-muted-foreground">Email:</span> {client.email}</div>
                    <div><span className="text-muted-foreground">Role:</span> {client.role}</div>
                    <div><span className="text-muted-foreground">Created:</span> {client.created_at ? new Date(client.created_at).toLocaleString() : '-'}</div>
                    <div><span className="text-muted-foreground">Birthdate:</span> {client.birthdate ?? '-'}</div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Addresses</CardTitle></CardHeader>
                <CardContent>
                    {client.addresses.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No addresses</div>
                    ) : (
                        <ul className="list-disc pl-5 space-y-1">
                            {client.addresses.map(a => (
                                <li key={a.id}>
                                    {a.address}, {a.city}, {a.state}, {a.postal_code}, {a.country}
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Payment Methods</CardTitle></CardHeader>
                <CardContent>
                    {client.payment_methods.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No payment methods</div>
                    ) : (
                        <ul className="list-disc pl-5 space-y-1">
                            {client.payment_methods.map(pm => (
                                <li key={pm.id}>
                                    {pm.card_type} • Expires {pm.expiry_date}
                                </li>
                            ))}
                        </ul>
                    )}
                    <div className="text-xs text-muted-foreground mt-2">
                        Only metadata is shown. Sensitive details are never displayed.
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><CardTitle>Orders</CardTitle></CardHeader>
                <CardContent>
                    {client.orders.length === 0 ? (
                        <div className="text-sm text-muted-foreground">No orders</div>
                    ) : (
                        <div className="space-y-6">
                            {client.orders.map(o => (
                                <div key={o.id} className="border rounded-md">
                                    <div className="flex items-center justify-between p-3 border-b">
                                        <div>
                                            <div className="font-medium">Order #{o.id}</div>
                                            <div className="text-sm text-muted-foreground">
                                                {o.order_date ? new Date(o.order_date).toLocaleString() : '-'}
                                            </div>
                                        </div>
                                        <Badge variant="secondary">Total: {currency(o.total_amount)}</Badge>
                                    </div>
                                    <div className="p-3">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Product</TableHead>
                                                    <TableHead>Quantity</TableHead>
                                                    <TableHead>Price</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {o.items.map(it => (
                                                    <TableRow key={it.id}>
                                                        <TableCell>{it.product_name}</TableCell>
                                                        <TableCell>{it.quantity}</TableCell>
                                                        <TableCell>{currency(it.price)}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
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

export default ClientDetailPage;