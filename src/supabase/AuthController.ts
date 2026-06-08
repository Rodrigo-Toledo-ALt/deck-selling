// AuthController.ts
// Funciones auxiliares de autenticación: signUp, signIn, signOut y createUserIfNotExists.
// Se encargan de interactuar con Supabase Auth y mantener sincronizada la tabla `users`.

import { supabase } from './supabase-client.ts'
import type { User } from '@supabase/supabase-js'

// Registro de nuevo usuario (email/password)
export async function signUp(email: string, password: string, metadata: Record<string, any> = {}) {
    const result = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: metadata
        }
    })

    // Devuelve error si lo hay (ej: email ocupado)
    if (result.error) return result

    // Si el registro fue exitoso y el usuario ya está logueado (sesión activa),
    // creamos su entrada en la tabla `users` para tener su perfil en la app
    const user = result.data?.user ?? null
    const session = result.data?.session ?? null

    if (user && session?.user) {
        try {
            // Crear registro en tabla `users` si no existe
            await createUserIfNotExists({
                id: user.id,
                email: user.email,
                user_metadata: user.user_metadata
            })
        } catch (err) {
            // Fallo al crear usuario no debe impedir el registro
            console.error('createUserIfNotExists after signUp error', err)
        }
    } else {
        // Usuario registrado pero sin sesión (verificación pendiente): se creará más tarde
    }

    return result
}

// Login con email/password
export async function signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password })
}

// Login mediante link mágico (enviado por email)
export async function signInWithMagicLink(email: string) {
    return supabase.auth.signInWithOtp({ email })
}

// Login mediante proveedor externo (OAuth)
export async function signInWithProvider(provider: 'github' | 'google' | 'azure' | 'facebook') {
    return supabase.auth.signInWithOAuth({ provider })
}

// Logout: cierra sesión en Supabase
export async function signOut() {
    return supabase.auth.signOut()
}

/**
 * Crea la fila en la tabla `users` si no existe. Solo llamar cuando hay sesión activa.
 */
export async function createUserIfNotExists(user: { id: string; email?: string | null; user_metadata?: any }) {
    console.log('⚡ createUserIfNotExists called with user:', user);

    if (!user?.id) {
        console.warn('⛔ createUserIfNotExists: no user id');
        return { created: false, error: 'no-auth-user' };
    }

    // Comprobación de existencia para evitar duplicados
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

    // Preparar datos para insertar (valores por defecto + metadatos)
    const payload = {
        id: user.id,
        username: user.user_metadata?.full_name ?? null,
        role: 'customer',   // Rol predeterminado para nuevos usuarios
        email: user.email ?? null,
        birthdate: user.user_metadata?.birthdate ?? null
    };

    // Insertar nuevo usuario en la tabla `users`
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