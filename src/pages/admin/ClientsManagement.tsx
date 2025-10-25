// src/pages/admin/ClientsManagement.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { getAllClients, Client } from '@/data/users_remote';
import Navbar from "@/components/Navbar.tsx";
import AdminLayout from "@/components/AdminLayout.tsx";

const ClientsManagement: React.FC = () => {
    const { toast } = useToast();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [query, setQuery] = useState('');

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await getAllClients();
                setClients(data);
            } catch (e) {
                console.error(e);
                toast({ title: 'Error', description: 'No se pudieron cargar los clientes', variant: 'destructive' });
            } finally {
                setLoading(false);
            }
        })();
    }, []);

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
                    <CardHeader className="flex items-center justify-between">
                        <CardTitle>Clients</CardTitle>
                        <div className="flex items-center gap-2 w-full md:w-96">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by username, email or role..."
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
                                        <TableHead>Username</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Created</TableHead>
                                        <TableHead>Orders</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                                        </TableRow>
                                    ) : filtered.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">No results</TableCell>
                                        </TableRow>
                                    ) : (
                                        filtered.map(c => (
                                            <TableRow key={c.id}>
                                                <TableCell className="font-medium">{c.username}</TableCell>
                                                <TableCell>{c.email}</TableCell>
                                                <TableCell>
                                                    <Badge variant={c.role === 'admin' ? 'default' : 'secondary'}>
                                                        {c.role}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{c.created_at ? new Date(c.created_at).toLocaleDateString() : '-'}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{c.ordersCount ?? 0}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button size="sm" variant="outline" onClick={() => navigate(`/admin/clients/${c.id}`)}>
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
    </div>

    );
};

export default ClientsManagement;