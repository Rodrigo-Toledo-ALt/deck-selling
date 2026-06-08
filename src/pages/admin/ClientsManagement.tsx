// ClientsManagement.tsx
// Página administrativa para listar y gestionar usuarios (clientes).
// - carga todos los clientes desde getAllClients
// - permite buscar por username/email/role
// - ver detalle y activar/desactivar usuarios
// Comentarios concisos en español para el TFG.

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { getAllClients, Client, toggleUserStatus } from '@/data/users_remote';
import Navbar from "@/components/Navbar.tsx";
import AdminLayout from "@/components/AdminLayout.tsx";

// Formatea números como moneda en EUR
const currency = (n: number) =>
    new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(n);

const ClientsManagement: React.FC = () => {
    const { toast } = useToast();
    const navigate = useNavigate();

    // Estados principales
    const [loading, setLoading] = useState(false);      // carga inicial
    const [clients, setClients] = useState<Client[]>([]); // lista de clientes desde el servidor
    const [query, setQuery] = useState('');             // texto de búsqueda

    // Efecto inicial: cargar todos los clientes
    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getAllClients(); // llamada al servicio remoto
                setClients(data);
            } catch (e) {
                console.error(e);
                toast({ title: 'Error', description: 'No se pudieron cargar los clientes', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Filtrado en memoria según query (username, email, role)
    const filtered = clients.filter(c => {
        const q = query.toLowerCase().trim();
        if (!q) return true;
        return (
            c.username.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            c.role.toLowerCase().includes(q)
        );
    });

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <AdminLayout>
                <div className="p-4 md:p-6 space-y-4">

                    <Card>
                        {/* Cabecera con buscador */}
                        <CardHeader className="flex items-center justify-between">
                            <CardTitle>Clients</CardTitle>
                            <div className="flex items-center gap-2 w-full md:w-96">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by username, email or role..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)} // actualización del filtro
                                />
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Username</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead>Role</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Orders</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>

                                    <TableBody>
                                        {loading ? (
                                            // Estado de carga
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8">Loading...</TableCell>
                                            </TableRow>
                                        ) : filtered.length === 0 ? (
                                            // Sin resultados tras filtrar
                                            <TableRow>
                                                <TableCell colSpan={7} className="text-center py-8">No results</TableCell>
                                            </TableRow>
                                        ) : (
                                            // Filas de clientes
                                            filtered.map(c => (
                                                <TableRow key={c.id}>
                                                    <TableCell className="font-medium">{c.username}</TableCell>
                                                    <TableCell>{c.email}</TableCell>
                                                    <TableCell>
                                                        {/* Badge para rol (visual) */}
                                                        <Badge variant={c.role === 'admin' ? 'default' : 'secondary'}>
                                                            {c.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}</TableCell>
                                                    <TableCell>
                                                        {/* Badge para estado (activo/inactivo) */}
                                                        <Badge variant={c.status === 'active' ? 'default' : 'destructive'}>
                                                            {c.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="secondary">{c.ordersCount ?? 0}</Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {/* Navegar al detalle del cliente */}
                                                            <Button size="sm" variant="outline" onClick={() => navigate(`/admin/clients/${c.id}`)}>
                                                                View
                                                            </Button>

                                                            {/* Activar/Desactivar usuario:
                                                                - llama a toggleUserStatus en el servidor
                                                                - actualiza la lista localmente (optimistic-ish)
                                                                - muestra toast según resultado
                                                            */}
                                                            <Button
                                                                size="sm"
                                                                variant={c.status === 'active' ? 'destructive' : 'default'}
                                                                onClick={async () => {
                                                                    const newStatus = c.status === 'active' ? 'inactive' : 'active';
                                                                    const success = await toggleUserStatus(c.id, newStatus);
                                                                    if (success) {
                                                                        // Actualización local para reflejar el cambio sin recargar
                                                                        setClients(prev => prev.map(client =>
                                                                            client.id === c.id
                                                                                ? {...client, status: newStatus}
                                                                                : client
                                                                        ));
                                                                        toast({
                                                                            title: 'Éxito',
                                                                            description: `Usuario ${newStatus === 'inactive' ? 'desactivado' : 'activado'} correctamente`
                                                                        });
                                                                    } else {
                                                                        toast({
                                                                            title: 'Error',
                                                                            description: 'No se pudo actualizar el estado del usuario',
                                                                            variant: 'destructive'
                                                                        });
                                                                    }
                                                                }}
                                                            >
                                                                {c.status === 'active' ? 'Deactivate' : 'Activate'}
                                                            </Button>
                                                        </div>
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
        </div>

    );
};

export default ClientsManagement;