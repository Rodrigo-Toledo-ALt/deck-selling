// src/supabase/AuthController.ts
import { supabase } from './supabase-client.ts'
import type { User } from '@supabase/supabase-js'

export async function signUp(email: string, password: string, metadata: Record<string, any> = {}) {
    const result = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metadata
        }
    })

    // Si la llamada devolvió error, lo devolvemos tal cual
    if (result.error) return result

    // Si hay usuario y además hay sesión (usuario ya autenticado en cliente),
    // intentamos crear la fila en la tabla `users`.
    const user = result.data?.user ?? null
    const session = result.data?.session ?? null

    if (user && session?.user) {
        try {
            // Importa o usa la función createUserIfNotExists que ya tienes en este módulo
            await createUserIfNotExists({
                id: user.id,
                email: user.email,
                user_metadata: user.user_metadata
            })
        } catch (err) {
            // No interrumpimos el flujo del signup por este fallo,
            // pero lo registramos para que puedas debuggear.
            console.error('createUserIfNotExists after signUp error', err)
        }
    } else {
        // Nota: si no hay session (p. ej. verificación por email pendiente), no intentamos insertar.
        // La inserción se realizará cuando haya sesión (onAuthStateChange en AuthProvider).
    }

    return result
}

export async function signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password })
}

export async function signInWithMagicLink(email: string) {
    return supabase.auth.signInWithOtp({ email })
}

export async function signInWithProvider(provider: 'github' | 'google' | 'azure' | 'facebook') {
    return supabase.auth.signInWithOAuth({ provider })
}

export async function signOut() {
    return supabase.auth.signOut()
}

/**
 * Crea la fila users si no existe. Llamar solo cuando exista session.user
 */
export async function createUserIfNotExists(user: { id: string; email?: string | null; user_metadata?: any }) {
    console.log('createUserIfNotExists called with user:', user);

    if (!user?.id) {
        console.warn('createUserIfNotExists: no user id');
        return { created: false, error: 'no-auth-user' };
    }

    // Verificar si existe
    const { data: existing, error: selErr } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

    console.log('createUserIfNotExists - select existing:', { existing, selErr });

    if (selErr) return { created: false, error: selErr };
    if (existing) return { created: false, data: existing };

    const payload = {
        id: user.id,
        username: user.email ? user.email.split('@')[0] : `user_${Date.now()}`,
        password_hash: null,
        role: 'customer',
        name: user.user_metadata?.full_name ?? null,
        email: user.email ?? null
    };

    console.log('createUserIfNotExists - insert payload:', payload);

    const { data: created, error: insErr } = await supabase
        .from('users')
        .insert(payload)
        .select()
        .single();

    console.log('createUserIfNotExists - insert result:', { created, insErr });

    if (insErr) {
        // imprime detalles para debug. Si es RLS, aquí verás el mensaje
        console.error('createUserIfNotExists insert error details:', insErr);
        return { created: false, error: insErr };
    }

    return { created: true, data: created };
}