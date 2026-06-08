import { supabase } from '@/supabase/supabase-client.ts';

// ======================================================
// USER PROFILE
// ======================================================

export interface MeProfile {
    id: string;
    username: string;
    email: string;
    birthdate: string | null; // readonly
    created_at?: string | null;
}

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

export async function updateMyEmail(newEmail: string): Promise<boolean> {
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) {
        console.error('updateMyEmail error:', error);
        return false;
    }
    return true;
}

export async function changeMyPassword(newPassword: string): Promise<boolean> {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
        console.error('changeMyPassword error:', error);
        return false;
    }
    return true;
}

// ======================================================
// ADDRESSES
// ======================================================

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

export async function getMyAddresses(): Promise<MyAddress[]> {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return [];

    const { data, error } = await supabase
        .from('addresses')
        .select('id, full_name, address, city, state, postal_code, country, is_default')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });

    if (error) {
        console.error('getMyAddresses error:', error);
        return [];
    }

    return data as MyAddress[];
}

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

    // OPCIONAL: Llamada a tu Webhook de n8n
    // fetch('https://tu-n8n-aws.com/webhook/support', {
    //    method: 'POST',
    //    body: JSON.stringify({ user_email: auth.user.email, ...ticket })
    // });

    return true;
}