// ClientDetailPage.tsx
// Página administrativa para ver el detalle de un cliente:
// - carga el cliente por ID (users_remote.getClientById)
// - muestra perfil, direcciones y pedidos con sus ítems
// Comentarios en español y concisos para facilitar lectura en el TFG.

import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { getClientById, ClientDetail } from '@/data/users_remote';
import Navbar from '@/components/Navbar.tsx';
import AdminLayout from '@/components/AdminLayout.tsx';

// Helper simple para formatear cantidades en EUR
const currency = (n: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(n);

const ClientDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>(); // id del cliente desde la ruta
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [client, setClient] = useState<ClientDetail | null>(null);

    // Efecto que carga el cliente cuando cambia el id
    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                setLoading(true);
                const data = await getClientById(id); // llamada al servicio remoto
                if (!data) {
                    // feedback si no existe el cliente
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
    }, [id, toast]);

    // Estado de carga: indicador sencillo
    if (loading) return <div className="p-6">Loading...</div>;

    // Si no hay cliente (no encontrado), mostrar botón de vuelta
    if (!client) {
        return (
            <div className="p-6">
                <p className="mb-4">Cliente no encontrado.</p>
                <Button asChild variant="outline"><Link to="/admin/clients">Volver a Clientes</Link></Button>
            </div>
        );
    }

    // Render principal: Navbar + layout administrativo
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <AdminLayout>
                <div className="p-4 md:p-6 space-y-6">

                    {/* Header con nombre del cliente y botón de volver */}
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">Cliente: {client.username}</h1>
                        <Button asChild variant="outline"><Link to="/admin/clients">Volver</Link></Button>
                    </div>

                    {/* Tarjeta: Perfil básico */}
                    <Card>
                        <CardHeader><CardTitle>Perfil</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                            <div><span className="text-muted-foreground">Username:</span> {client.username}</div>
                            <div><span className="text-muted-foreground">Email:</span> {client.email}</div>
                            <div><span className="text-muted-foreground">Role:</span> {client.role}</div>
                            <div><span className="text-muted-foreground">Creado:</span> {client.created_at ? new Date(client.created_at).toLocaleString() : '-'}</div>
                            <div><span className="text-muted-foreground">Fecha de nacimiento:</span> {client.birthdate ?? '-'}</div>
                        </CardContent>
                    </Card>

                    {/* Tarjeta: Direcciones - lista o mensaje si no hay */}
                    <Card>
                        <CardHeader><CardTitle>Direcciones</CardTitle></CardHeader>
                        <CardContent>
                            {client.addresses.length === 0 ? (
                                <div className="text-sm text-muted-foreground">Sin direcciones</div>
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

                    {/* Tarjeta: Pedidos */}
                    <Card>
                        <CardHeader><CardTitle>Pedidos</CardTitle></CardHeader>
                        <CardContent>
                            {client.orders.length === 0 ? (
                                <div className="text-sm text-muted-foreground">Sin pedidos</div>
                            ) : (
                                <div className="space-y-6">
                                    {client.orders.map(o => (
                                        // Cada pedido como caja con cabecera y tabla de items
                                        <div key={o.id} className="border rounded-md overflow-hidden">
                                            <div className="flex items-center justify-between p-3 border-b">
                                                <div>
                                                    <div className="font-medium">Pedido #{o.id}</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        {o.order_date ? new Date(o.order_date).toLocaleString() : '-'}
                                                    </div>
                                                </div>
                                                {/* Badge con total del pedido */}
                                                <Badge variant="secondary">Total: {currency(o.total_amount)}</Badge>
                                            </div>
                                            <div className="p-3">
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Producto</TableHead>
                                                            <TableHead>Cantidad</TableHead>
                                                            <TableHead>Precio</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {o.items.length === 0 ? (
                                                            // Caso borde: pedido sin items (raro, pero manejado)
                                                            <TableRow>
                                                                <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">Sin items</TableCell>
                                                            </TableRow>
                                                        ) : (
                                                            // Filas por cada item del pedido
                                                            o.items.map(it => (
                                                                <TableRow key={it.id}>
                                                                    <TableCell>{it.product_name ?? it.product_id ?? '(desconocido)'}</TableCell>
                                                                    <TableCell>{it.quantity ?? '-'}</TableCell>
                                                                    <TableCell>{typeof it.price === 'number' ? currency(it.price) : '-'}</TableCell>
                                                                </TableRow>
                                                            ))
                                                        )}
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