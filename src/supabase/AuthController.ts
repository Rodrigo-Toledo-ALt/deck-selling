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
    console.log('⚡ createUserIfNotExists called with user:', user);

    if (!user?.id) {
        console.warn('⛔ createUserIfNotExists: no user id');
        return { created: false, error: 'no-auth-user' };
    }

    // --- SELECT para comprobar si ya existe ---
    console.log("➡️ Checking if user exists:", user.id);
    const { data: existing, error: selErr } = await supabase
        .from('users')
        .select('id, role, email')
        .eq('id', user.id)
        .maybeSingle();
    console.log("⬅️ Result of SELECT:", { existing, selErr });

    if (selErr) {
        console.error('🚨 Error checking user existence:', selErr);
        return { created: false, error: selErr };
    }

    if (existing) {
        console.log('ℹ️ User already exists, skipping insert:', existing);
        return { created: false, data: existing };
    }

    // --- INSERT solo si no existía ---
    const payload = {
        id: user.id,
        username: user.user_metadata?.full_name ?? null,
        role: 'customer',   // 👈 rol por defecto
        email: user.email ?? null,
        birthdate: user.user_metadata?.birthdate ?? null
    };

    console.log('➡️ Inserting new user with payload:', payload);
    const { data: created, error: insErr } = await supabase
        .from('users')
        .insert(payload)
        .select()
        .single();

    console.log('⬅️ Result of INSERT:', { created, insErr });

    if (insErr) {
        console.error('🚨 Error inserting user into users table:', insErr);
        return { created: false, error: insErr };
    }

    console.log('✅ User created successfully:', created);
    return { created: true, data: created };
}