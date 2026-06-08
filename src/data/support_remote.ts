// src/data/support_remote.ts
import { supabase } from '@/lib/supabase';

export type SupportTicket = {
    id: string;
    user_id: string;
    order_id?: string | null;
    subject: string;
    message: string;
    status: 'open' | 'in_progress' | 'resolved' | 'rejected';
    created_at: string;
    updated_at?: string | null;
    assigned_to?: string | null;
    priority?: number | null;

    // campos de usuario resueltos por cliente (opcional)
    reporter_email?: string | null;
    reporter_username?: string | null;
    assigned_email?: string | null;
    assigned_username?: string | null;
};

/**
 * Helper: trae Usuarios por ids y devuelve un mapa id -> user
 */
async function fetchUsersMap(userIds: string[]): Promise<Record<string, { id: string; email?: string | null; username?: string | null }>> {
    if (!userIds || userIds.length === 0) return {};
    const unique = Array.from(new Set(userIds.filter(Boolean)));
    const { data, error } = await supabase
        .from('users')
        .select('id, email, username')
        .in('id', unique)
        .limit(1000);

    if (error) {
        console.error('fetchUsersMap error', error);
        return {};
    }

    const map: Record<string, any> = {};
    (data ?? []).forEach((u: any) => {
        map[u.id] = u;
    });
    return map;
}

/**
 * Devuelve todos los tickets sin embebidos, y resuelve usuarios por separado
 */
export async function getAllSupportTickets(): Promise<SupportTicket[]> {
    // 1) Traer tickets simples (sin users embebidos)
    const { data: tickets, error: ticketsErr } = await supabase
        .from('support_tickets')
        .select('id, user_id, order_id, subject, message, status, created_at, updated_at, assigned_to, priority')
        .order('created_at', { ascending: false });

    if (ticketsErr) {
        console.error('getAllSupportTickets - fetch tickets error', ticketsErr);
        throw ticketsErr;
    }

    const rows = tickets ?? [];

    // 2) Recolectar ids de usuario a resolver
    const userIds: string[] = [];
    rows.forEach((r: any) => {
        if (r.user_id) userIds.push(r.user_id);
        if (r.assigned_to) userIds.push(r.assigned_to);
    });

    // 3) Traer usuarios y mapear
    const usersMap = await fetchUsersMap(userIds);

    // 4) Combinar y devolver
    return rows.map((r: any) => ({
        ...r,
        reporter_email: usersMap[r.user_id]?.email ?? null,
        reporter_username: usersMap[r.user_id]?.username ?? null,
        assigned_email: usersMap[r.assigned_to]?.email ?? null,
        assigned_username: usersMap[r.assigned_to]?.username ?? null,
    }));
}

/**
 * Obtener un ticket por id (misma estrategia: traer ticket simple y resolver usuarios)
 */
export async function getSupportTicketById(id: string): Promise<SupportTicket | null> {
    const { data, error } = await supabase
        .from('support_tickets')
        .select('id, user_id, order_id, subject, message, status, created_at, updated_at, assigned_to, priority')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        console.error('getSupportTicketById error', error);
        throw error;
    }

    if (!data) return null;

    const usersMap = await fetchUsersMap([data.user_id, data.assigned_to].filter(Boolean) as string[]);

    return {
        ...data,
        reporter_email: usersMap[data.user_id]?.email ?? null,
        reporter_username: usersMap[data.user_id]?.username ?? null,
        assigned_email: usersMap[data.assigned_to]?.email ?? null,
        assigned_username: usersMap[data.assigned_to]?.username ?? null,
    };
}

/**
 * Actualizaciones y borrados siguen operando sobre la tabla support_tickets.
 * Estas llamadas NO usan embebidos.
 */
export async function updateSupportTicketStatus(id: string, status: SupportTicket['status']): Promise<boolean> {
    const { error } = await supabase
        .from('support_tickets')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        console.error('updateSupportTicketStatus error', error);
        return false;
    }
    return true;
}

export async function assignSupportTicket(id: string, adminId: string | null): Promise<boolean> {
    const { error } = await supabase
        .from('support_tickets')
        .update({ assigned_to: adminId, updated_at: new Date().toISOString() })
        .eq('id', id);

    if (error) {
        console.error('assignSupportTicket error', error);
        return false;
    }
    return true;
}

export async function deleteSupportTicket(id: string): Promise<boolean> {
    const { error } = await supabase
        .from('support_tickets')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('deleteSupportTicket error', error);
        return false;
    }
    return true;
}

/**
 * Obtener admins (puedes adaptar esta heurística).
 * Aquí simplemente devolvemos todos los usuarios (o filtra según tu lógica).
 */

export async function getAdmins() {
    const { data, error } = await supabase
        .from('users')
        .select('id, email, username, role')
        .eq('role', 'admin')
        .limit(100);

    if (error) {
        console.error('getAdmins error', error);
        return [];
    }

    return (data ?? []).map((u: any) => ({ id: u.id, username: u.username, email: u.email }));
}