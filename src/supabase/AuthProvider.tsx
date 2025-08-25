// src/supabase/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase-client'
import type { Session, User } from '@supabase/supabase-js'
import { createUserIfNotExists } from './AuthController' // ajusta la ruta si es necesario

type AuthContextType = {
    user: User | null
    session: Session | null
    loading: boolean
    signUp: (email: string, password: string) => Promise<any>
    signIn: (email: string, password: string) => Promise<any>
    signInWithMagicLink: (email: string) => Promise<any>
    signInWithProvider: (provider: 'github' | 'google' | 'azure' | 'facebook') => Promise<void>
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        // Recupera sesión inicial
        supabase.auth.getSession().then(async ({ data }) => {
            if (!mounted) return
            const initialSession = data?.session ?? null
            setSession(initialSession)
            setUser(initialSession?.user ?? null)
            setLoading(false)

            // Si ya hay sesión al cargar, asegurar existencia de fila users
            if (initialSession?.user) {
                try {
                    await createUserIfNotExists({
                        id: initialSession.user.id,
                        email: initialSession.user.email,
                        user_metadata: initialSession.user.user_metadata
                    })
                } catch (e) {
                    console.error('init createUserIfNotExists error', e)
                }
            }
        })

        // Escucha cambios de auth (login/logout)
        const { data: listener } = supabase.auth.onAuthStateChange(async (_event, sess) => {
            if (!mounted) return
            setSession(sess ?? null)
            setUser(sess?.user ?? null)

            if (sess?.user) {
                try {
                    await createUserIfNotExists({
                        id: sess.user.id,
                        email: sess.user.email,
                        user_metadata: sess.user.user_metadata
                    })
                } catch (err) {
                    console.error('onAuthStateChange createUserIfNotExists error', err)
                }
            }
        })

        return () => {
            mounted = false
            listener.subscription.unsubscribe()
        }
    }, [])

    // Métodos expuestos (puedes seguir usándolos o moverlos a AuthController)
    const signUp = async (email: string, password: string) => {
        return supabase.auth.signUp({ email, password })
    }

    const signIn = async (email: string, password: string) => {
        return supabase.auth.signInWithPassword({ email, password })
    }

    const signInWithMagicLink = async (email: string) => {
        return supabase.auth.signInWithOtp({ email })
    }

    const signInWithProvider = async (provider: 'github' | 'google' | 'azure' | 'facebook') => {
        await supabase.auth.signInWithOAuth({ provider: provider as any })
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
    }

    return (
        <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithMagicLink, signInWithProvider, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}