
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

  const onSubmit = (values: LoginValues) => {
    console.log(values);
    
    // Mock login logic (replace with real auth later)
    if (values.email === 'admin@pauperforge.com' && values.password === 'admin123') {
      // Admin login
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userEmail', values.email);
      toast({
        title: "Admin login successful",
        description: "Welcome to the admin dashboard",
      });
      navigate('/admin/decks');
    } else if (values.email === 'user@example.com' && values.password === 'user123') {
      // Regular user login
      localStorage.setItem('userRole', 'user');
      localStorage.setItem('userEmail', values.email);
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      navigate('/');
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive"
      });
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
