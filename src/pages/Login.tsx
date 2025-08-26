import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {useAuth} from "@/supabase/AuthProvider.tsx";




const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

type LoginValues = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

    const { signIn } = useAuth();
    const [isLoading, setIsLoading] = React.useState(false);


    const onSubmit = async (values: LoginValues) => {
        setIsLoading(true);
        try {
            const res = await signIn(values.email, values.password);
            // res expected shape: { data, error } from supabase
            if (res.error) {
                toast({
                    title: "Login failed",
                    description: res.error.message ?? 'Something went wrong',
                    variant: "destructive",
                });
                return;
            }

            // Si hay session => login exitoso inmediato
            if (res.data?.session) {
                toast({
                    title: "Login successful",
                    description: "Welcome back!",
                });
                // La suscripción en AuthProvider actualizará user/session automáticamente.
                navigate('/');
                return;
            }

            // Si no hay session (p.ej. magic link / email confirmation required)
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
              
              <Button type="submit" className="w-full">Login</Button>
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
