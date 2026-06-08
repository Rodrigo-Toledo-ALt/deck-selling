// Login.tsx
// Página de login: formulario con validación (zod + react-hook-form), autenticación via AuthProvider
// y comprobación de estado de usuario en la tabla `users` (desactiva sesiones de usuarios inactivos).

import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast.ts';
import Navbar from '@/components/Navbar.tsx';
import Footer from '@/components/Footer.tsx';
import { useAuth } from "@/supabase/AuthProvider.tsx";
import { supabase } from '@/lib/supabase';

// --- Validación del formulario con Zod (mensajes concisos para UI)
const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters')
});
type LoginValues = z.infer<typeof loginSchema>;

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const { signIn } = useAuth();
    const [isLoading, setIsLoading] = React.useState(false);

    // Lee ?redirect=cart (o cualquier ruta) para redirigir tras login
    const redirectTo = new URLSearchParams(location.search).get('redirect');

    // Configura react-hook-form usando el resolver de Zod
    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' }
    });

    // Envía credenciales al proveedor de auth
    const onSubmit = async (values: LoginValues) => {
        setIsLoading(true);
        try {
            const res = await signIn(values.email, values.password);

            if (res.error) {
                // Mostrar error proporcionado por el proveedor
                toast({
                    title: "Login failed",
                    description: res.error.message ?? 'Something went wrong',
                    variant: "destructive",
                });
                return;
            }

            if (res.data?.session) {
                // Verifica el estado del usuario en la tabla 'users'
                // Si el usuario está inactivo, fuerza signOut y muestra aviso
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('status')
                    .eq('id', res.data.session.user.id)
                    .single();

                if (userError || userData?.status !== 'active') {
                    await supabase.auth.signOut(); // Cierra sesión si no está activo

                    toast({
                        title: "Account Inactive",
                        description: "Your account has been deactivated. Please contact support.",
                        variant: "destructive",
                    });
                    setIsLoading(false);
                    return;
                }

                // Login correcto: notificación y redirección (si procede)
                toast({
                    title: "Login successful",
                    description: "Welcome back!",
                });
                navigate(redirectTo ? `/${redirectTo}` : '/');
                return;
            }

            // Caso: no session (p.ej. login por magic link)
            toast({
                title: "Check your email",
                description: "If your account requires confirmation, check your inbox.",
            });
        } catch (err: any) {
            // Errores imprevistos
            toast({
                title: "Login error",
                description: err?.message ?? String(err),
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // --- JSX: layout simple con Navbar, formulario central y Footer
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex items-center justify-center py-12">
                <div className="w-full max-w-md p-8 bg-card rounded-lg border border-border">
                    <h1 className="text-3xl font-bold text-center mb-8 text-gradient">Login to Pauper Forge</h1>

                    {/* Form conectado a react-hook-form */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input placeholder="you@example.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Logging in...' : 'Login'}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-muted-foreground">
                            Don't have an account?{" "}
                            <Link to="/register" className="text-primary hover:underline">
                                Register here
                            </Link>
                        </p>
                    </div>

                    {/* Información de testing (solo UI) */}
                    <div className="mt-4 p-4 bg-secondary/50 rounded-md">
                        <p className="text-sm text-muted-foreground mb-2">Test accounts:</p>
                        <p className="text-xs text-muted-foreground">Admin: admin@pauperforge.com / admin123</p>
                        <p className="text-xs text-muted-foreground">User: user@example.com / user123</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Login;