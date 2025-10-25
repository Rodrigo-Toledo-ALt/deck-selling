import { supabase } from '@/lib/supabase';

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
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

export async function getMyAddresses(): Promise<MyAddress[]> {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return [];

    const { data, error } = await supabase
        .from('addresses')
        .select('id, address, city, state, postal_code, country')
        .eq('user_id', userId)
        .order('id', { ascending: true });

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

// ======================================================
// PAYMENT METHODS
// ======================================================

export interface MyPaymentMethod {
    id: string;
    card_type: string;
    expiry_date: string;
    billing_address_id: string;
}

export async function getMyPaymentMethods(): Promise<MyPaymentMethod[]> {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return [];

    const { data, error } = await supabase
        .from('payment_methods')
        .select('id, card_type, expiry_date, billing_address_id')
        .eq('user_id', userId)
        .order('id', { ascending: true });

    if (error) {
        console.error('getMyPaymentMethods error:', error);
        return [];
    }

    return data as MyPaymentMethod[];
}

export async function createMyPaymentMethod(
    pm: Omit<MyPaymentMethod, 'id'>
): Promise<boolean> {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return false;

    const { error } = await supabase
        .from('payment_methods')
        .insert([{ ...pm, user_id: userId }]);

    if (error) {
        console.error('createMyPaymentMethod error:', error);
        return false;
    }
    return true;
}

export async function updateMyPaymentMethod(
    id: string,
    updates: Partial<Omit<MyPaymentMethod, 'id'>>
): Promise<boolean> {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return false;

    const { error } = await supabase
        .from('payment_methods')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId);

    if (error) {
        console.error('updateMyPaymentMethod error:', error);
        return false;
    }
    return true;
}

export async function deleteMyPaymentMethod(id: string): Promise<boolean> {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return false;

    const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

    if (error) {
        console.error('deleteMyPaymentMethod error:', error);
        return false;
    }
    return true;
}