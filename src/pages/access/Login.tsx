// src/pages/Login.tsx
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

    // Lee ?redirect=cart (o cualquier ruta)
    const redirectTo = new URLSearchParams(location.search).get('redirect');

    const form = useForm<LoginValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' }
    });

    const onSubmit = async (values: LoginValues) => {
        setIsLoading(true);
        try {
            const res = await signIn(values.email, values.password);

            if (res.error) {
                toast({
                    title: "Login failed",
                    description: res.error.message ?? 'Something went wrong',
                    variant: "destructive",
                });
                return;
            }

            if (res.data?.session) {
                toast({
                    title: "Login successful",
                    description: "Welcome back!",
                });
                // Si venía del carrito, redirige al carrito; si no, al home
                navigate(redirectTo ? `/${redirectTo}` : '/');
                return;
            }

            toast({
                title: "Check your email",
                description: "If your account requires confirmation, check your inbox.",
            });
        } catch (err: any) {
            toast({
                title: "Login error",
                description: err?.message ?? String(err),
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex items-center justify-center py-12">
                <div className="w-full max-w-md p-8 bg-card rounded-lg border border-border">
                    <h1 className="text-3xl font-bold text-center mb-8 text-gradient">Login to Pauper Forge</h1>

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