// support_Remote.ts
// Gestiona tickets de soporte almacenados en Supabase.
// Permite listar, obtener detalles, asignar, actualizar estado y eliminar tickets.
// También incluye función para obtener lista de administradores.

// ── TIPOS ───────────────────────────────────────────────────────────────

// Representa un ticket de soporte
import {supabase} from "@/lib/supabase.ts";

export type SupportTicket = {
    id: string;                      // ID único
    user_id: string;                 // ID del usuario que reportó
    order_id?: string | null;        // ID de pedido asociado (opcional)
    subject: string;                 // Asunto del ticket
    message: string;                 // Mensaje detallado
    status: 'open' | 'in_progress' | 'resolved' | 'rejected'; // Estado actual
    created_at: string;              // Fecha de creación
    updated_at?: string | null;      // Última actualización
    assigned_to?: string | null;     // ID del admin asignado
    priority?: number | null;        // Prioridad (opcional)

    // Campos resueltos del lado cliente (no en BD)
    reporter_email?: string | null;    // Email del reportero
    reporter_username?: string | null; // Nombre del reportero
    assigned_email?: string | null;    // Email del asignado
    assigned_username?: string | null; // Nombre del asignado
};

// ── FUNCIONES AUXILIARES ────────────────────────────────────────────────

/**
 * Obtiene información de usuarios por sus IDs.
 * Retorna un mapa id -> {id, email, username}.
 */
async function fetchUsersMap(
    userIds: string[]
): Promise<Record<string, { id: string; email?: string | null; username?: string | null }>> {
    if (!userIds || userIds.length === 0) return {};
    // Filtra ids vacíos y elimina duplicados
    const unique = Array.from(new Set(userIds.filter(Boolean)));
    const { data, error } = await supabase
        .from('users')
        .select('id, email, username')
        .in('id', unique)
        .limit(1000); // Límite razonable

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

// ── FUNCIONES DE TICKETS ────────────────────────────────────────────────

/**
 * Obtiene todos los tickets de soporte ordenados por fecha (recientes primero).
 * Resuelve emails/nombres de usuarios reporteros y asignados.
 */
export async function getAllSupportTickets(): Promise<SupportTicket[]> {
    // 1) Obtener tickets sin datos de usuario embebidos
    const { data: tickets, error: ticketsErr } = await supabase
        .from('support_tickets')
        .select('id, user_id, order_id, subject, message, status, created_at, updated_at, assigned_to, priority')
        .order('created_at', { ascending: false });

    if (ticketsErr) {
        console.error('getAllSupportTickets - fetch tickets error', ticketsErr);
        throw ticketsErr;
    }

    const rows = tickets ?? [];

    // 2) Recolectar IDs de usuarios para resolver
    const userIds: string[] = [];
    rows.forEach((r: any) => {
        if (r.user_id) userIds.push(r.user_id);
        if (r.assigned_to) userIds.push(r.assigned_to);
    });

    // 3) Obtener datos de usuarios y crear mapa
    const usersMap = await fetchUsersMap(userIds);

    // 4) Combinar datos de tickets con usuarios y devolver
    return rows.map((r: any) => ({
        ...r,
        reporter_email: usersMap[r.user_id]?.email ?? null,
        reporter_username: usersMap[r.user_id]?.username ?? null,
        assigned_email: usersMap[r.assigned_to]?.email ?? null,
        assigned_username: usersMap[r.assigned_to]?.username ?? null,
    }));
}

/**
 * Obtiene un ticket por ID.
 * Resuelve emails/nombres de usuarios reportero y asignado.
 */
export async function getSupportTicketById(id: string): Promise<SupportTicket | null> {
    const { data, error } = await supabase
        .from('support_tickets')
        .select('id, user_id, order_id, subject, message, status, created_at, updated_at, assigned_to, priority')
        .eq('id', id)
        .maybeSingle(); // Permite null si no existe

    if (error) {
        console.error('getSupportTicketById error', error);
        throw error;
    }

    if (!data) return null;

    // Resolver usuarios reportero y asignado
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
 * Actualiza el estado de un ticket y registra la fecha de cambio.
 * Retorna true si éxito, false si error.
 */
export async function updateSupportTicketStatus(
    id: string,
    status: SupportTicket['status']
): Promise<boolean> {
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

/**
 * Asigna un ticket a un administrador (o lo desasigna si adminId es null).
 * Retorna true si éxito, false si error.
 */
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

/**
 * Elimina un ticket de soporte por ID.
 * Retorna true si éxito, false si error.
 */
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

// ── FUNCIONES DE ADMINISTRADORES ────────────────────────────────────────

/**
 * Obtiene una lista de administradores (usuarios con role 'admin').
 */
export async function getAdmins() {
    const { data, error } = await supabase
        .from('users')
        .select('id, email, username, role')
        .eq('role', 'admin')
        .limit(100); // Límite razonable

    if (error) {
        console.error('getAdmins error', error);
        return [];
    }

    // Mapea resultado a estructura más simple
    return (data ?? []).map((u: any) => ({ id: u.id, username: u.username, email: u.email }));
}