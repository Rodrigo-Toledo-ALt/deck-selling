// users_remote.ts
// Gestiona la obtención de datos de clientes (usuarios) desde Supabase.
// Incluye listado básico, detalle completo (direcciones, pagos, pedidos) y cambio de estado.

import { supabase } from '@/lib/supabase';

// ── TIPOS ───────────────────────────────────────────────────────────────

// Representa un usuario en la tabla 'users'
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

// Dirección de envío/facturación de un cliente
export interface Address {
    id: string;
    address: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
}

// Método de pago guardado de un cliente
export interface PaymentMethod {
    id: string;
    card_type: string;    // Ej: Visa, Mastercard
    expiry_date: string;  // Formato: MM/YY
}

// Item dentro de un pedido
export interface OrderItem {
    id: string;
    product_id?: string | null;   // ID del producto (opcional)
    product_name?: string | null; // Nombre del producto (opcional)
    quantity?: number | null;     // Cantidad comprada
    price?: number | null;        // Precio unitario
}

// Pedido realizado por un cliente
export interface Order {
    id: string;
    order_date: string | null; // Fecha del pedido
    total_amount: number;      // Total pagado
    items: OrderItem[];         // Artículos del pedido
}

// Cliente con datos mínimos (para listados)
export interface Client {
    id: string;
    username: string;
    email: string;
    role: 'customer' | 'admin';
    created_at?: string;
    birthdate?: string | null;
    ordersCount?: number; // Número de pedidos realizados
    status: 'active' | 'inactive';
    inactivated_at?: string | null;
    deactivated_by?: string | null;
    deactivated_by_role?: 'user' | 'admin' | 'system' | null;
}

// Cliente con datos completos (detalle)
export interface ClientDetail {
    id: string;
    username: string;
    email: string;
    role: 'customer' | 'admin';
    created_at?: string;
    birthdate?: string | null;
    addresses: Address[];         // Direcciones guardadas
    payment_methods: PaymentMethod[]; // Métodos de pago guardados
    orders: Order[];               // Historial de pedidos
    status: 'active' | 'inactive';
    inactivated_at?: string | null;
    deactivated_by?: string | null;
    deactivated_by_role?: 'user' | 'admin' | 'system' | null;
}

// ── CONSULTAS ───────────────────────────────────────────────────────────

// Selección base de campos de usuario
const userBaseSelect = `
  id, username, email, role, created_at, birthdate, status, inactivated_at, deactivated_by, deactivated_by_role
`;

/**
 * Obtiene todos los clientes con el número de pedidos realizados.
 */
export async function getAllClients(): Promise<Client[]> {
    // 1) Obtener todos los usuarios
    const { data: users, error: usersErr } = await supabase.from('users').select(userBaseSelect);
    if (usersErr) {
        console.error('getAllClients users error:', usersErr);
        return [];
    }
    const list = (users ?? []) as UserRow[];
    if (!list.length) return [];

    // 2) Contar pedidos por usuario
    const userIds = list.map(u => u.id);
    const { data: orders, error: ordersErr } = await supabase
        .from('orders')
        .select('id, user_id')
        .in('user_id', userIds);
    if (ordersErr) console.error('getAllClients orders error:', ordersErr);

    // Crear mapa de conteo de pedidos por usuario
    const ordersByUser = new Map<string, number>();
    (orders ?? []).forEach((o: any) => {
        ordersByUser.set(o.user_id, (ordersByUser.get(o.user_id) ?? 0) + 1);
    });

    // 3) Combinar datos y devolver
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
 * Obtiene el detalle completo de un cliente por ID.
 * Incluye direcciones, métodos de pago y pedidos con artículos.
 */
export async function getClientById(id: string): Promise<ClientDetail | undefined> {
    // 1) Obtener datos básicos del usuario
    const { data: user, error: userErr } = await supabase
        .from('users')
        .select(userBaseSelect)
        .eq('id', id)
        .single();
    if (userErr || !user) {
        console.error('getClientById user error:', userErr);
        return undefined;
    }

    // 2) Obtener direcciones del cliente
    const { data: addresses, error: addrErr } = await supabase
        .from('addresses')
        .select('id, address, city, state, postal_code, country')
        .eq('user_id', id);
    if (addrErr) console.error('addresses error:', addrErr);

    // 3) Obtener métodos de pago del cliente
    const { data: pms, error: pmErr } = await supabase
        .from('payment_methods')
        .select('id, card_type, expiry_date')
        .eq('user_id', id);
    if (pmErr) console.error('payment_methods error:', pmErr);

    // 4) Obtener pedidos del cliente
    const { data: orders, error: ordersErr } = await supabase
        .from('orders')
        .select('id, order_date, total_amount')
        .eq('user_id', id)
        .order('order_date', { ascending: false }); // Más recientes primero
    if (ordersErr) console.error('orders error:', ordersErr);

    // 5) Obtener artículos de cada pedido y sus nombres de producto
    const orderIds = (orders ?? []).map((o: any) => o.id);
    const itemsByOrder = new Map<string, OrderItem[]>();

    if (orderIds.length > 0) {
        // IMPORTANTE: se une con tabla 'products' para obtener nombre
        const { data: items, error: itemsErr } = await supabase
            .from('order_items')
            .select('id, order_id, product_id, quantity, price, product:products(name)')
            .in('order_id', orderIds);

        if (itemsErr) {
            console.error('order_items error:', itemsErr);
        } else {
            for (const it of items ?? []) {
                // Extraer nombre del producto o usar valor por defecto
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

                // Agregar item al pedido correspondiente
                const arr = itemsByOrder.get(it.order_id) ?? [];
                arr.push(entry);
                itemsByOrder.set(it.order_id, arr);
            }
        }
    }

    // 6) Combinar pedidos con sus artículos
    const ordersEnriched: Order[] = (orders ?? []).map((o: any) => ({
        id: o.id,
        order_date: o.order_date ?? null,
        total_amount: Number(o.total_amount ?? 0),
        items: itemsByOrder.get(o.id) ?? [],
    }));

    // 7) Devolver objeto completo
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
 * Activa o desactiva un usuario.
 * Solo puede ser llamado por un admin.
 */
export async function toggleUserStatus(userId: string, newStatus: 'active' | 'inactive'): Promise<boolean> {
    // 1) Verificar sesión activa
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    // 2) Verificar que el usuario actual sea admin
    const { data: currentUser } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

    if (currentUser?.role !== 'admin') {
        console.error('Unauthorized: Only admins can toggle user status');
        return false;
    }

    // 3) Preparar datos para actualizar
    const updates: any = {
        status: newStatus,
        inactivated_at: newStatus === 'inactive' ? new Date().toISOString() : null,
        deactivated_by: newStatus === 'inactive' ? session.user.id : null,
        deactivated_by_role: newStatus === 'inactive' ? 'admin' : null
    };

    // 4) Actualizar estado en BD
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