import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from './supabase-client.ts';
import type { Session, User } from '@supabase/supabase-js';
import * as authController from './AuthController';

type AuthContextType = {
    user: User | null;
    session: Session | null;
    loading: boolean;
    role: string | null;
    signUp: typeof authController.signUp;
    signIn: typeof authController.signIn;
    signInWithMagicLink: typeof authController.signInWithMagicLink;
    signInWithProvider: typeof authController.signInWithProvider;
    signOut: typeof authController.signOut;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // 👉 Guardamos el último user.id procesado
    const lastUserIdRef = useRef<string | null>(null);

    const handleSession = async (s: Session | null) => {
        setSession(s ?? null);
        setUser(s?.user ?? null);

        // ⚡ Evitar repeticiones innecesarias
        if (s?.user?.id && s.user.id === lastUserIdRef.current) {
            console.log("⏩ Ignorando evento duplicado para:", s.user.id);
            setLoading(false);
            return;
        }

        lastUserIdRef.current = s?.user?.id ?? null;

        try {
            if (s?.user?.id) {
                console.log("⚡ Procesando sesión para:", s.user.id);

                await authController.createUserIfNotExists({
                    id: s.user.id,
                    email: s.user.email,
                    user_metadata: s.user.user_metadata,
                });

                const { data, error } = await supabase
                    .from('users')
                    .select('role')
                    .eq('id', s.user.id)
                    .maybeSingle();

                if (error) {
                    console.error("⚠️ Error al obtener role del usuario:", error);
                    setRole(null);
                } else {
                    console.log("🔑 role cargado:", data?.role ?? null);
                    setRole(data?.role ?? null);
                }
            } else {
                setRole(null);
            }
        } catch (err) {
            console.error("⚠️ Error en handleSession:", err);
            setRole(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        supabase.auth.getSession().then(({ data, error }) => {
            if (error) console.error("⚠️ Error en getSession:", error);
            handleSession(data?.session ?? null);
        });

        const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'INITIAL_SESSION') {
                handleSession(s);
            } else {
                console.log('ℹ️ Ignorado auth event:', event);
            }
        });

        return () => sub.subscription.unsubscribe();
    }, []);

    const signUp = authController.signUp;
    const signIn = authController.signIn;
    const signInWithMagicLink = authController.signInWithMagicLink;
    const signInWithProvider = authController.signInWithProvider;
    const signOut = async () => {
        await authController.signOut();
        setUser(null);
        setSession(null);
        setRole(null);
        setLoading(false);
        lastUserIdRef.current = null; // reset
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                loading,
                role,
                signUp,
                signIn,
                signInWithMagicLink,
                signInWithProvider,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}