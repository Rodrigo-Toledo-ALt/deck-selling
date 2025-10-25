// src/data/users_remote.ts
import { supabase } from '@/lib/supabase';

export interface UserRow {
    id: string;
    username: string;
    email: string;
    role: 'customer' | 'admin';
    created_at: string | null;
    birthdate: string | null;
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
    product_id: string;
    product_name: string;
    quantity: number;
    price: number;
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
}

const userBaseSelect = `
  id, username, email, role, created_at, birthdate
`;

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
    }));
}

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

    // Pedidos
    const { data: orders, error: ordersErr } = await supabase
        .from('orders')
        .select('id, order_date, total_amount')
        .eq('user_id', id)
        .order('order_date', { ascending: false });
    if (ordersErr) console.error('orders error:', ordersErr);

    const orderIds = (orders ?? []).map((o: any) => o.id);
    const itemsByOrder = new Map<string, OrderItem[]>();

    if (orderIds.length > 0) {
        const { data: items, error: itemsErr } = await supabase
            .from('order_items')
            .select('id, order_id, product_id, quantity, price, products(name)')
            .in('order_id', orderIds);

        if (itemsErr) {
            console.error('order_items error:', itemsErr);
        } else {
            for (const it of items ?? []) {
                const entry: OrderItem = {
                    id: it.id,
                    product_id: it.product_id,
                    product_name: it.products?.name ?? '(unknown)',
                    quantity: it.quantity,
                    price: Number(it.price),
                };
                const arr = itemsByOrder.get(it.order_id) ?? [];
                arr.push(entry);
                itemsByOrder.set(it.order_id, arr);
            }
        }
    }

    const ordersEnriched: Order[] = (orders ?? []).map((o: any) => ({
        id: o.id,
        order_date: o.order_date,
        total_amount: Number(o.total_amount),
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
    };
}