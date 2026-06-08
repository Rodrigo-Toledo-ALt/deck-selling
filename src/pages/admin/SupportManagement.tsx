// SupportManagement.tsx
// Página admin para listar y gestionar tickets de soporte.
// - carga tickets y admins remotos
// - búsqueda y filtrado por estado
// - ver detalle y eliminar tickets
// Comentarios concisos en español para el TFG.

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Trash2, Eye } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout.tsx';
import {
    getAllSupportTickets,
    deleteSupportTicket,
    getAdmins as getAdminsRemote,
    type SupportTicket,
} from '@/data/support_remote';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import Navbar from "@/components/Navbar.tsx";

// Opciones y tipado de estado del ticket
const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'rejected'] as const;
type TicketStatus = typeof STATUS_OPTIONS[number];

// Mapeo visual para los badges según estado
const statusVariant: Record<TicketStatus, 'default' | 'secondary' | 'destructive' | 'success' | 'outline'> = {
    open: 'secondary',
    in_progress: 'default',
    resolved: 'success',
    rejected: 'destructive',
};

// Formatea una etiqueta de estado ('in_progress' -> 'In Progress')
function formatStatusLabel(s?: string | null) {
    if (!s) return '';
    return s
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

const SupportManagement: React.FC = () => {
    const { toast } = useToast();
    const navigate = useNavigate();

    // Estados principales
    const [loading, setLoading] = useState(false);
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [admins, setAdmins] = useState<{ id: string; username?: string | null; email?: string | null }[]>([]);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // Carga inicial: tickets y lista de admins
    useEffect(() => {
        load();
        loadAdmins();
    }, []);

    // Obtener tickets desde el servicio (data/support_remote)
    const load = async () => {
        try {
            setLoading(true);
            const data = await getAllSupportTickets();
            setTickets(data || []); // proteger contra null
        } catch (err) {
            console.error('load tickets error', err);
            toast({ title: 'Error', description: 'No se pudieron cargar los tickets', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    // Obtener admins para mostrar nombres en la tabla
    const loadAdmins = async () => {
        try {
            const data = await getAdminsRemote();
            setAdmins(data || []);
        } catch (err) {
            console.error('load admins error', err);
            setAdmins([]);
        }
    };

    // Map rápido id -> display name (username | email | short id)
    const adminNameById = useMemo(() => {
        const map = new Map<string, string>();
        admins.forEach(a => {
            map.set(a.id, a.username ?? a.email ?? a.id.slice(0, 8));
        });
        return map;
    }, [admins]);

    // Filtrado en memoria:
    // - por estado (si statusFilter !== 'all')
    // - por texto en asunto/mensaje/email/username
    const filtered = tickets.filter(t => {
        const q = query.toLowerCase().trim();
        if (statusFilter !== 'all' && t.status !== statusFilter) return false;
        if (!q) return true;
        return (
            (t.subject ?? '').toLowerCase().includes(q) ||
            ((t.message ?? '') as string).toLowerCase().includes(q) ||
            ((t.user_email ?? '') as string).toLowerCase().includes(q) ||
            ((t.reporter_username ?? '') as string).toLowerCase().includes(q)
        );
    });

    // Eliminar ticket con confirm y actualización local optimista
    const onDelete = async (id: string) => {
        if (!confirm('¿Eliminar ticket?')) return;
        try {
            const ok = await deleteSupportTicket(id);
            if (ok) {
                toast({ title: 'Eliminado' });
                setTickets(prev => prev.filter(t => t.id !== id));
            } else {
                toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
            }
        } catch (err) {
            console.error('delete ticket error', err);
            toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <AdminLayout>
                <div className="p-4 md:p-6">
                    <Card>
                        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <CardTitle>Support Tickets</CardTitle>
                            {/* Barra de controles: búsqueda, filtro de estado y refrescar */}
                            <div className="flex gap-2 items-center w-full md:w-auto">
                                <Input placeholder="Buscar..." value={query} onChange={(e) => setQuery(e.target.value)} />
                                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v)}>
                                    <SelectTrigger className="w-40 bg-card border-border">
                                        <SelectValue>{statusFilter === 'all' ? 'Todos' : formatStatusLabel(statusFilter)}</SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todos</SelectItem>
                                        {STATUS_OPTIONS.map(s => (
                                            <SelectItem key={s} value={s}>{formatStatusLabel(s)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button onClick={load}>Refrescar</Button>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Asunto</TableHead>
                                        <TableHead>Usuario</TableHead>
                                        <TableHead>Pedido</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Asignado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {loading ? (
                                        // Indicador de carga global
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">Cargando...</TableCell>
                                        </TableRow>
                                    ) : filtered.length === 0 ? (
                                        // No hay tickets tras filtrar
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-8">No hay tickets</TableCell>
                                        </TableRow>
                                    ) : (
                                        // Filas de tickets
                                        filtered.map(t => {
                                            // Decide cómo mostrar el asignado (map desde admins > assigned_user > fallback)
                                            const assignedDisplay =
                                                (t.assigned_to && adminNameById.get(t.assigned_to)) ||
                                                t.assigned_user?.username ||
                                                t.assigned_user?.email ||
                                                '— Ninguno —';

                                            // Quién reportó (email > username > user id corto)
                                            const reporterDisplay =
                                                t.user_email ??
                                                t.reporter_username ??
                                                t.user_id?.slice(0, 8) ??
                                                '-';

                                            return (
                                                <TableRow key={t.id}>
                                                    <TableCell className="font-medium">{t.subject}</TableCell>
                                                    <TableCell>{reporterDisplay}</TableCell>
                                                    <TableCell>{t.order_id ? t.order_id.slice(0, 8) : '-'}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={statusVariant[(t.status as TicketStatus) ?? 'open']}>
                                                            {formatStatusLabel(t.status)}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{assignedDisplay}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end gap-2">
                                                            {/* Ver detalle y eliminar */}
                                                            <Button size="sm" variant="outline" onClick={() => navigate(`/admin/support/${t.id}`)}>
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                            <Button size="sm" variant="destructive" onClick={() => onDelete(t.id)}>
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>
            </AdminLayout>
        </div>
    );
};

export default SupportManagement;