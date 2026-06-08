// account.ts
// Funciones para gestionar datos del perfil, direcciones y tickets de soporte del usuario logueado.
// Todas requieren autenticación válida mediante Supabase Auth.

import { supabase } from '@/supabase/supabase-client.ts';

// ── TIPOS ───────────────────────────────────────────────────────────────

export interface MeProfile {
    id: string;
    username: string;
    email: string;
    birthdate: string | null;     // Solo lectura (no se edita desde frontend)
    created_at?: string | null;
}

export interface MyAddress {
    id: string;
    full_name: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
}

// ── PERFIL DE USUARIO ───────────────────────────────────────────────────

/**
 * Obtiene los datos del perfil del usuario actual.
 * @returns Objeto MeProfile o null si no hay sesión.
 */
export async function getMe(): Promise<MeProfile | null> {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return null;

    const { data, error } = await supabase
        .from('users')
        .select('id, username, email, birthdate, created_at')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('getMe error:', error);
        return null;
    }

    return data as MeProfile;
}

/**
 * Actualiza campos permitidos del perfil (por ahora solo username).
 * @param payload Campos a actualizar.
 * @returns true si éxito, false si error.
 */
export async function updateMe(payload: Partial<Pick<MeProfile, 'username'>>): Promise<boolean> {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return false;

    const { error } = await supabase
        .from('users')
        .update(payload)
        .eq('id', userId);

    if (error) {
        console.error('updateMe error:', error);
        return false;
    }
    return true;
}

/**
 * Cambia el email del usuario en Supabase Auth.
 * @param newEmail Nuevo correo electrónico.
 * @returns true si éxito, false si error.
 */
export async function updateMyEmail(newEmail: string): Promise<boolean> {
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
        console.error('updateMyEmail error:', error);
        return false;
    }
    return true;
}

/**
 * Cambia la contraseña del usuario en Supabase Auth.
 * @param newPassword Nueva contraseña.
 * @returns true si éxito, false si error.
 */
export async function changeMyPassword(newPassword: string): Promise<boolean> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
        console.error('changeMyPassword error:', error);
        return false;
    }
    return true;
}

// ── DIRECCIONES ─────────────────────────────────────────────────────────

/**
 * Obtiene todas las direcciones del usuario logueado.
 * @returns Array de direcciones o [] si error/no sesión.
 */
export async function getMyAddresses(): Promise<MyAddress[]> {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return [];

    const { data, error } = await supabase
        .from('addresses')
        .select('id, full_name, address, city, state, postal_code, country, is_default')
        .eq('user_id', userId)
        .order('is_default', { ascending: false }); // Prioriza dirección por defecto

    if (error) {
        console.error('getMyAddresses error:', error);
        return [];
    }

    return data as MyAddress[];
}

/**
 * Crea una nueva dirección para el usuario.
 * @param address Datos de la dirección (sin id).
 * @returns true si éxito, false si error.
 */
export async function createMyAddress(address: Omit<MyAddress, 'id'>): Promise<boolean> {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return false;

    const { error } = await supabase
        .from('addresses')
        .insert([{ ...address, user_id: userId }]);

    if (error) {
        console.error('createMyAddress error:', error);
        return false;
    }
    return true;
}

/**
 * Actualiza una dirección existente del usuario.
 * @param id ID de la dirección a modificar.
 * @param updates Campos a actualizar.
 * @returns true si éxito, false si error.
 */
export async function updateMyAddress(
    id: string,
    updates: Partial<Omit<MyAddress, 'id'>>
): Promise<boolean> {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return false;

    const { error } = await supabase
        .from('addresses')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId);

    if (error) {
        console.error('updateMyAddress error:', error);
        return false;
    }
    return true;
}

/**
 * Marca una dirección como predeterminada.
 * Usa función edge para garantizar una sola dirección por defecto.
 * @param addressId ID de la dirección a establecer como predeterminada.
 * @returns true si éxito, false si error.
 */
export async function setDefaultAddress(addressId: string): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { error } = await supabase.functions.invoke('set-default-address', {
        body: { addressId },
    });

    if (error) {
        console.error('setDefaultAddress error:', error);
        return false;
    }
    return true;
}

/**
 * Elimina una dirección del usuario.
 * @param id ID de la dirección a eliminar.
 * @returns true si éxito, false si error.
 */
export async function deleteMyAddress(id: string): Promise<boolean> {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return false;

    const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

    if (error) {
        console.error('deleteMyAddress error:', error);
        return false;
    }
    return true;
}

// ── SOPORTE ─────────────────────────────────────────────────────────────

/**
 * Crea un ticket de soporte asociado al usuario.
 * @param ticket Datos del ticket (asunto, mensaje, opcionalmente pedido).
 * @returns true si éxito, false si error.
 */
export async function createSupportTicket(ticket: {
    order_id?: string,
    subject: string,
    message: string
}): Promise<boolean> {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return false;

    const { error } = await supabase
        .from('support_tickets')
        .insert([{
            user_id: auth.user.id,
            ...ticket
        }]);

    if (error) {
        console.error('Error creating support ticket:', error);
        return false;
    }

    return true;
}