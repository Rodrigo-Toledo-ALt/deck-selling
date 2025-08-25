// src/supabase/AuthController.ts
import { supabase } from './supabase-client.ts'
import type { User } from '@supabase/supabase-js'

export async function signUp(email: string, password: string) {
    return supabase.auth.signUp({ email, password })
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
    if (!user?.id) return { created: false, error: 'no-auth-user' }

    const { data: existing, error: selErr } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

    if (selErr) return { created: false, error: selErr }
    if (existing) return { created: false, data: existing }

    const payload = {
        id: user.id,
        username: user.email ? user.email.split('@')[0] : `user_${Date.now()}`,
        password_hash: null,
        role: 'customer',
        name: user.user_metadata?.full_name ?? null,
        email: user.email ?? null
    }

    const { data: created, error: insErr } = await supabase
        .from('users')
        .insert(payload)
        .select()
        .single()

    if (insErr) return { created: false, error: insErr }
    return { created: true, data: created }
}