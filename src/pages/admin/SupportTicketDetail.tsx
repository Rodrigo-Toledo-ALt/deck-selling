// src/pages/admin/SupportTicketDetail.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AdminLayout from '@/components/AdminLayout.tsx';
import { supabase } from '@/supabase/supabase-client.ts';
import {
    getSupportTicketById,
    updateSupportTicketStatus,
    assignSupportTicket,
    getAdmins as getAdminsRemote,
    type SupportTicket,
} from '@/data/support_remote';
import Navbar from "@/components/Navbar.tsx";

const STATUS_OPTIONS = ['open', 'in_progress', 'resolved', 'rejected'] as const;
type TicketStatus = typeof STATUS_OPTIONS[number];

const statusVariant: Record<TicketStatus, 'default' | 'secondary' | 'destructive' | 'success' | 'outline'> = {
    open: 'secondary',
    in_progress: 'default',
    resolved: 'success',
    rejected: 'destructive',
};

interface StatusUpdateRow {
    id: string;
    ticket_id: string;
    old_status?: TicketStatus | null;
    new_status: TicketStatus;
    updated_by?: { id?: string; username?: string | null } | null;
    note?: string | null;
    updated_at: string;
}

const SENTINEL_NONE = '__none__';

/** Helper para mostrar estado bonito */
function formatStatusLabel(s?: string | null) {
    if (!s) return '';
    return s
        .split('_')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

const SupportTicketDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [loading, setLoading] = useState(true);
    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [history, setHistory] = useState<StatusUpdateRow[]>([]);
    const [admins, setAdmins] = useState<{ id: string; username?: string | null; email?: string | null }[]>([]);

    const [newStatus, setNewStatus] = useState<TicketStatus | ''>('');
    const [note, setNote] = useState('');
    const [saving, setSaving] = useState(false);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        if (!id) return;
        load();
        loadAdmins();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const load = async () => {
        try {
            setLoading(true);

            // ticket via remote helper (no embed)
            const t = await getSupportTicketById(id!);
            if (!t) {
                toast({ title: 'Error', description: 'Ticket no encontrado', variant: 'destructive' });
                setTicket(null);
                setHistory([]);
                return;
            }
            setTicket(t);
            setNewStatus((t.status as TicketStatus) ?? '');

            // history - fetch without embedding updated_by; then resolve usernames
            const { data: historyData, error: historyError } = await supabase
                .from('support_ticket_updates')
                .select('id, ticket_id, old_status, new_status, updated_by, note, updated_at')
                .eq('ticket_id', id)
                .order('updated_at', { ascending: false });

            if (historyError) {
                console.error('history fetch error', historyError);
                setHistory([]);
            } else {
                const rows: any[] = historyData ?? [];

                const updatedByIds = Array.from(new Set(rows.map(r => r.updated_by).filter(Boolean) as string[]));
                let usersMap: Record<string, { id: string; username?: string | null }> = {};
                if (updatedByIds.length > 0) {
                    const { data: usersData, error: usersErr } = await supabase
                        .from('users')
                        .select('id, username')
                        .in('id', updatedByIds)
                        .limit(1000);
                    if (usersErr) {
                        console.error('history users fetch error', usersErr);
                    } else {
                        (usersData ?? []).forEach((u: any) => {
                            usersMap[u.id] = { id: u.id, username: u.username };
                        });
                    }
                }

                const mapped: StatusUpdateRow[] = rows.map(r => ({
                    id: r.id,
                    ticket_id: r.ticket_id,
                    old_status: r.old_status,
                    new_status: r.new_status,
                    updated_by: r.updated_by ? usersMap[r.updated_by] ?? { id: r.updated_by } : null,
                    note: r.note,
                    updated_at: r.updated_at,
                }));
                setHistory(mapped);
            }
        } catch (e: any) {
            console.error('load ticket error', e);
            toast({ title: 'Error', description: e.message ?? 'No se pudo cargar el ticket', variant: 'destructive' });
            setTicket(null);
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    const loadAdmins = async () => {
        try {
            const adminsList = await getAdminsRemote();
            // getAdminsRemote should return only admins; fallback:
            if (!adminsList || adminsList.length === 0) {
                const { data, error } = await supabase.from('users').select('id, username, email').eq('role', 'admin').limit(100);
                if (!error) setAdmins(data ?? []);
            } else {
                setAdmins(adminsList);
            }
        } catch (e) {
            console.error('loadAdmins error', e);
        }
    };

    const handleChangeStatus = async () => {
        if (!id || !newStatus || !ticket) return;
        if (newStatus === ticket.status && !note.trim()) {
            toast({ title: 'Nada que actualizar', description: 'El estado no ha cambiado y no hay nota', variant: 'destructive' });
            return;
        }

        try {
            setSaving(true);
            const ok = await updateSupportTicketStatus(id, newStatus as TicketStatus);
            if (!ok) throw new Error('No se pudo actualizar el estado');

            const { data: authRes } = await supabase.auth.getUser();
            const updatedBy = authRes.user?.id ?? null;

            const { error: insertErr } = await supabase
                .from('support_ticket_updates')
                .insert([{
                    ticket_id: id,
                    old_status: ticket.status,
                    new_status: newStatus,
                    updated_by: updatedBy,
                    note: note.trim() || null,
                    updated_at: new Date().toISOString()
                }]);

            if (insertErr) {
                console.error('insert history error', insertErr);
                toast({ title: 'Advertencia', description: 'Estado cambiado, pero no se pudo guardar la nota', variant: 'destructive' });
            } else {
                toast({ title: 'Estado actualizado', description: `Estado cambiado a "${formatStatusLabel(newStatus)}"` });
            }

            setNote('');
            await load();
        } catch (e: any) {
            console.error('handleChangeStatus error', e);
            toast({ title: 'Error', description: e.message ?? 'No se pudo actualizar el estado', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleAssign = async (targetAdminId: string | null) => {
        if (!id) return;
        try {
            setAssigning(true);
            const ok = await assignSupportTicket(id, targetAdminId);
            if (!ok) throw new Error('No se pudo asignar');
            toast({ title: 'Asignación actualizada' });
            await load();
        } catch (e: any) {
            console.error('handleAssign error', e);
            toast({ title: 'Error', description: e.message ?? 'No se pudo asignar', variant: 'destructive' });
        } finally {
            setAssigning(false);
        }
    };

    if (loading) return <AdminLayout><div className="p-6">Loading...</div></AdminLayout>;

    if (!ticket) return (
        <AdminLayout>
            <div className="p-6">
                <p className="mb-4">Ticket no encontrado.</p>
                <Button asChild variant="outline"><Link to="/admin/support">Back to Support</Link></Button>
            </div>
        </AdminLayout>
    );

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
                <AdminLayout>
                    <div className="p-4 md:p-6 space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-semibold">
                                Ticket <span className="font-mono text-base text-muted-foreground">#{ticket.id.slice(0, 8)}...</span>
                            </h1>
                            <div className="flex items-center gap-2">
                                <Button asChild variant="outline"><Link to="/admin/support">Back</Link></Button>
                                <Badge variant={statusVariant[ticket.status as TicketStatus] ?? 'secondary'}>
                                    {formatStatusLabel(ticket.status)}
                                </Badge>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader><CardTitle>Requester</CardTitle></CardHeader>
                                <CardContent className="text-sm space-y-2">
                                    <div><span className="text-muted-foreground">Username:</span> {ticket.reporter_username ?? '-'}</div>
                                    <div><span className="text-muted-foreground">Email:</span> {ticket.reporter_email ?? '-'}</div>
                                    <div className="pt-2">
                                        <Button size="sm" variant="outline" onClick={() => navigate(`/admin/clients/${ticket.user_id}`)}>
                                            View Client
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Ticket</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="font-medium mb-2">{ticket.subject}</div>
                                    <div className="whitespace-pre-wrap border rounded p-3 bg-muted/5">{ticket.message}</div>
                                    {ticket.order_id && <div className="mt-3 text-sm text-muted-foreground">Order: <Link to={`/admin/orders/${ticket.order_id}`} className="font-mono text-xs">{ticket.order_id.slice(0, 8)}...</Link></div>}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Actions</CardTitle></CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <label className="text-sm text-muted-foreground block mb-1">Change status</label>
                                        <Select value={newStatus} onValueChange={(v) => setNewStatus(v as TicketStatus)}>
                                            <SelectTrigger className="w-full bg-card border-border">
                                                <SelectValue placeholder="Select new status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{formatStatusLabel(s)}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div>
                                        <label className="text-sm text-muted-foreground block mb-1">Add note (optional)</label>
                                        <Textarea placeholder="Note for the user / internal note..." value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
                                    </div>

                                    <div className="flex gap-2">
                                        <Button onClick={handleChangeStatus} disabled={saving || !newStatus || newStatus === ticket.status}>
                                            {saving ? 'Saving...' : 'Save status'}
                                        </Button>
                                        <Button variant="outline" onClick={() => { setNewStatus(ticket.status); setNote(''); }}>
                                            Reset
                                        </Button>
                                    </div>

                                    <div className="pt-4">
                                        <label className="text-sm text-muted-foreground block mb-1">Assign to (admin)</label>

                                        {/* Use sentinel value to avoid empty-string SelectItem error */}
                                        <Select
                                            value={ticket.assigned_to ?? SENTINEL_NONE}
                                            onValueChange={(v) => handleAssign(v === SENTINEL_NONE ? null : v)}
                                        >
                                            <SelectTrigger className="w-full bg-card border-border">
                                                <SelectValue placeholder="— Ninguno —" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value={SENTINEL_NONE}>— Ninguno —</SelectItem>
                                                {admins.map(a => (
                                                    <SelectItem key={a.id} value={a.id}>
                                                        {a.username ?? a.email ?? a.id.slice(0, 8)}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <div className="mt-2 flex gap-2">
                                            <Button size="sm" onClick={async () => {
                                                const { data } = await supabase.auth.getUser();
                                                if (!data.user) {
                                                    toast({ title: 'Error', description: 'No autenticado', variant: 'destructive' });
                                                    return;
                                                }
                                                await handleAssign(data.user.id);
                                            }} disabled={assigning}>Assign to me</Button>
                                            <Button size="sm" variant="outline" onClick={() => handleAssign(null)} disabled={assigning}>Unassign</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* History */}
                        <Card>
                            <CardHeader><CardTitle>History</CardTitle></CardHeader>
                            <CardContent>
                                {history.length === 0 ? (
                                    <div className="text-sm text-muted-foreground">No history yet</div>
                                ) : (
                                    <div className="space-y-3">
                                        {history.map(h => (
                                            <div key={h.id} className="flex items-start gap-3 text-sm border-b pb-3 last:border-0">
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={statusVariant[h.old_status as TicketStatus] ?? 'outline'}>
                                                            {formatStatusLabel(h.old_status ?? '')}
                                                        </Badge>
                                                        <span className="text-muted-foreground">→</span>
                                                        <Badge variant={statusVariant[h.new_status as TicketStatus] ?? 'secondary'}>
                                                            {formatStatusLabel(h.new_status)}
                                                        </Badge>
                                                    </div>
                                                    {h.note && <div className="text-muted-foreground italic">"{h.note}"</div>}
                                                </div>
                                                <div className="text-right text-xs text-muted-foreground shrink-0">
                                                    <div>{h.updated_by?.username ?? 'system'}</div>
                                                    <div>{new Date(h.updated_at).toLocaleString()}</div>
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

export default SupportTicketDetail;