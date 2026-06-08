// AuthProvider.tsx
// Contexto de autenticación: expone user, session y helpers de login/logout para la app.

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase-client.ts'
import type { Session, User } from '@supabase/supabase-js'
import * as authController from './AuthController' // funciones concretas de autenticación (signIn, signUp, etc.)

// Tipo del contexto: usuario, sesión, loading y los métodos de auth reexportados
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

// Provider que inicializa la sesión y escucha cambios de auth
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true

        // Obtiene la sesión actual al montar (si existe) y crea el usuario en la BBDD si es nuevo
        supabase.auth.getSession().then(async ({ data }) => {
            if (!mounted) return
            const s = data?.session ?? null
            setSession(s)
            setUser(s?.user ?? null)
            setLoading(false)

            if (s?.user) {
                // Asegura que exista un registro de usuario en la tabla de la aplicación
                await authController.createUserIfNotExists(s.user)
            }
        })

        // Suscripción a cambios de estado de autenticación (login/logout, refresh)
        const { data: sub } = supabase.auth.onAuthStateChange(async (_event, s) => {
            if (!mounted) return
            setSession(s ?? null)
            setUser(s?.user ?? null)
            if (s?.user) {
                // Mismo comportamiento: crear usuario si no existe
                await authController.createUserIfNotExists(s.user)
            }
        })

        // Cleanup: marcar desmontado y cancelar la suscripción
        return () => {
            mounted = false
            sub.subscription.unsubscribe()
        }
    }, [])

    // Reexporta las funciones del authController (puedes envolverlas para toasts/uI)
    const signUp = authController.signUp
    const signIn = authController.signIn
    const signInWithMagicLink = authController.signInWithMagicLink
    const signInWithProvider = authController.signInWithProvider
    const signOut = async () => {
        await authController.signOut()
        // Limpiar estado local después del logout
        setUser(null)
        setSession(null)
    }

    return (
        <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithMagicLink, signInWithProvider, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

// Hook auxiliar para consumir el contexto (lanza error si se usa fuera del Provider)
export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used within AuthProvider')
    return ctx
}