// src/data/users_remote.ts
import { supabase } from '@/lib/supabase';

export interface UserRow {
    id: string;
    username: string;
    email: string;
    role: 'customer' | 'admin';
    created_at: string | null;
    birthdate: string | null;
    status: 'active' | 'inactive';
    inactivated_at?: string | null;
    deactivated_by?: string | null;
    deactivated_by_role?: 'user' | 'admin' | 'system' | null;
}

export interface Address {
    id: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

export interface PaymentMethod {
    id: string;
    card_type: string;
    expiry_date: string;
}

export interface OrderItem {
    id: string;
    product_id?: string | null;
    product_name?: string | null;
    quantity?: number | null;
    price?: number | null;
}

export interface Order {
    id: string;
    order_date: string | null;
    total_amount: number;
    items: OrderItem[];
}

export interface Client {
    id: string;
    username: string;
    email: string;
    role: 'customer' | 'admin';
    created_at?: string;
    birthdate?: string | null;
    ordersCount?: number;
    status: 'active' | 'inactive';
    inactivated_at?: string | null;
    deactivated_by?: string | null;
    deactivated_by_role?: 'user' | 'admin' | 'system' | null;
}

export interface ClientDetail {
    id: string;
    username: string;
    email: string;
    role: 'customer' | 'admin';
    created_at?: string;
    birthdate?: string | null;
    addresses: Address[];
    payment_methods: PaymentMethod[];
    orders: Order[];
    status: 'active' | 'inactive';
    inactivated_at?: string | null;
    deactivated_by?: string | null;
    deactivated_by_role?: 'user' | 'admin' | 'system' | null;
}

const userBaseSelect = `
  id, username, email, role, created_at, birthdate, status, inactivated_at, deactivated_by, deactivated_by_role
`;

/**
 * getAllClients - sin cambios
 */
export async function getAllClients(): Promise<Client[]> {
    const { data: users, error: usersErr } = await supabase.from('users').select(userBaseSelect);
    if (usersErr) {
        console.error('getAllClients users error:', usersErr);
        return [];
    }
    const list = (users ?? []) as UserRow[];
    if (!list.length) return [];

    const userIds = list.map(u => u.id);
    const { data: orders, error: ordersErr } = await supabase
        .from('orders')
        .select('id, user_id')
        .in('user_id', userIds);
    if (ordersErr) console.error('getAllClients orders error:', ordersErr);

    const ordersByUser = new Map<string, number>();
    (orders ?? []).forEach((o: any) => {
        ordersByUser.set(o.user_id, (ordersByUser.get(o.user_id) ?? 0) + 1);
    });

    return list.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        role: u.role,
        created_at: u.created_at ?? undefined,
        birthdate: u.birthdate,
        ordersCount: ordersByUser.get(u.id) ?? 0,
        status: u.status,
        inactivated_at: u.inactivated_at,
        deactivated_by: u.deactivated_by,
        deactivated_by_role: u.deactivated_by_role,
    }));
}

/**
 * getClientById
 * - trae user, addresses, payment_methods, orders
 * - por cada order trae order_items + product (products.name)
 * - normaliza cada item para exponer product_name
 */
export async function getClientById(id: string): Promise<ClientDetail | undefined> {
    // Usuario
    const { data: user, error: userErr } = await supabase
        .from('users')
        .select(userBaseSelect)
        .eq('id', id)
        .single();
    if (userErr || !user) {
        console.error('getClientById user error:', userErr);
        return undefined;
    }

    // Direcciones
    const { data: addresses, error: addrErr } = await supabase
        .from('addresses')
        .select('id, address, city, state, postal_code, country')
        .eq('user_id', id);
    if (addrErr) console.error('addresses error:', addrErr);

    // Métodos de pago (sin card_number)
    const { data: pms, error: pmErr } = await supabase
        .from('payment_methods')
        .select('id, card_type, expiry_date')
        .eq('user_id', id);
    if (pmErr) console.error('payment_methods error:', pmErr);

    // Pedidos (orders)
    const { data: orders, error: ordersErr } = await supabase
        .from('orders')
        .select('id, order_date, total_amount')
        .eq('user_id', id)
        .order('order_date', { ascending: false });
    if (ordersErr) console.error('orders error:', ordersErr);

    // Si no hay pedidos, devolvemos vacío en orders
    const orderIds = (orders ?? []).map((o: any) => o.id);
    const itemsByOrder = new Map<string, OrderItem[]>();

    if (orderIds.length > 0) {
        // IMPORTANTE: pedimos order_items e incluimos product: products(name)
        // Ajusta 'products(name)' si tu tabla products usa otra columna (p.ej. title)
        const { data: items, error: itemsErr } = await supabase
            .from('order_items')
            .select('id, order_id, product_id, quantity, price, product:products(name)')
            .in('order_id', orderIds);

        if (itemsErr) {
            console.error('order_items error:', itemsErr);
        } else {
            for (const it of items ?? []) {
                const productName =
                    (it.product && (it.product.name ?? it.product.title ?? null)) ??
                    null;

                const entry: OrderItem = {
                    id: it.id,
                    product_id: it.product_id ?? null,
                    product_name: productName ?? '(unknown)',
                    quantity: typeof it.quantity === 'number' ? it.quantity : Number(it.quantity ?? 0),
                    price: it.price !== null && it.price !== undefined ? Number(it.price) : 0,
                };

                const arr = itemsByOrder.get(it.order_id) ?? [];
                arr.push(entry);
                itemsByOrder.set(it.order_id, arr);
            }
        }
    }

    const ordersEnriched: Order[] = (orders ?? []).map((o: any) => ({
        id: o.id,
        order_date: o.order_date ?? null,
        total_amount: Number(o.total_amount ?? 0),
        items: itemsByOrder.get(o.id) ?? [],
    }));

    return {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at ?? undefined,
        birthdate: user.birthdate,
        addresses: (addresses ?? []) as Address[],
        payment_methods: (pms ?? []).map((pm: any) => ({
            id: pm.id,
            card_type: pm.card_type,
            expiry_date: pm.expiry_date,
        })),
        orders: ordersEnriched,
        status: user.status,
        inactivated_at: user.inactivated_at,
        deactivated_by: user.deactivated_by,
        deactivated_by_role: user.deactivated_by_role,
    };
}

/**
 * toggleUserStatus - sin cambios
 */
export async function toggleUserStatus(userId: string, newStatus: 'active' | 'inactive'): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    // Verificar que el usuario actual sea admin
    const { data: currentUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

    if (currentUser?.role !== 'admin') {
        console.error('Unauthorized: Only admins can toggle user status');
        return false;
    }

    const updates: any = {
        status: newStatus,
        inactivated_at: newStatus === 'inactive' ? new Date().toISOString() : null,
        deactivated_by: newStatus === 'inactive' ? session.user.id : null,
        deactivated_by_role: newStatus === 'inactive' ? 'admin' : null
    };

    const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId);

    if (error) {
        console.error('toggleUserStatus error:', error);
        return false;
    }

    return true;
}