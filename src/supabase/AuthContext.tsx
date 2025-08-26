// src/supabase/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase-client.ts'
import type { Session, User } from '@supabase/supabase-js'
import * as authController from './AuthController' // import as namespace

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

        supabase.auth.getSession().then(async ({ data }) => {
            if (!mounted) return
            const s = data?.session ?? null
            setSession(s)
            setUser(s?.user ?? null)
            setLoading(false)

            if (s?.user) {
                await authController.createUserIfNotExists(s.user)
            }
        })

        const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
            if (!mounted) return
            setSession(s ?? null)
            setUser(s?.user ?? null)
            if (s?.user) {
                await authController.createUserIfNotExists(s.user)
            }
        })

        return () => {
            mounted = false
            sub.subscription.unsubscribe()
        }
    }, [])

    // Reexporta (o envuelve si quieres añadir toasts/uI)
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