// src/supabase/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase-client.ts'
import type { Session, User } from '@supabase/supabase-js'
import * as authController from './AuthController' // reutilizamos todo el controller

type AuthContextType = {
    user: User | null
    session: Session | null
    loading: boolean
    signUp: typeof authController.signUp
    signIn: typeof authController.signIn
    signInWithMagicLink: typeof authController.signInWithMagicLink
    signInWithProvider: typeof authController.signInWithProvider
    signOut: typeof authController.signOut
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        // Recupera la sesión inicial
        supabase.auth.getSession().then(async ({ data }) => {
            if (!mounted) return
            const s = data?.session ?? null
            setSession(s)
            setUser(s?.user ?? null)
            setLoading(false)

            if (s?.user) {
                console.log('AuthProvider: calling createUserIfNotExists for', s.user.id);
                try {
                    const r = await authController.createUserIfNotExists(s.user)
                    console.log('AuthProvider.createUserIfNotExists result:', r);
                } catch (err) {
                    console.error('init createUserIfNotExists error', err)
                }
            }
        })

        // Escucha cambios de auth (login/logout)
        const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
            console.log('onAuthStateChange event:', _event, s);
            setSession(s ?? null);
            setUser(s?.user ?? null);
            if (s?.user) {
                try {
                    const r = await authController.createUserIfNotExists(s.user);
                    console.log('onAuthStateChange createUserIfNotExists result:', r);
                } catch (err) {
                    console.error('onAuthStateChange createUserIfNotExists error', err);
                }
            }
        });

        return () => {
            mounted = false
            sub.subscription.unsubscribe()
        }
    }, [])

    // Reexportamos las funciones del controller (puedes envolverlas si necesitas UI/toasts)
    const signUp = authController.signUp
    const signIn = authController.signIn
    const signInWithMagicLink = authController.signInWithMagicLink
    const signInWithProvider = authController.signInWithProvider
    const signOut = async () => {
        await authController.signOut()
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