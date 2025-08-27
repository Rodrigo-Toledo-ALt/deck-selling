import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
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
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/supabase/AuthProvider';

import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
    birthDate: z.date({
        required_error: 'Birth date is required',
    })
        .refine((date) => {
            const birthDate = new Date(date);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            // Check if the date is not in the future
            if (birthDate > today) return false;

            // Check if user is at least 18 years old
            if (age < 18) return false;
            if (age === 18 && monthDiff < 0) return false;
            if (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate()) return false;

            return true;
        }, {
            message: "You must be at least 18 years old and birth date cannot be in the future"
        })
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type RegisterValues = z.infer<typeof registerSchema>;

const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const Register = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { signUp } = useAuth();
    const [isLoading, setIsLoading] = React.useState(false);

    const form = useForm<RegisterValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
            birthDate: undefined
        }
    });

    const onSubmit = async (values: RegisterValues) => {
        setIsLoading(true);
        try {
            const metadata = {
                full_name: values.name,
                birthdate: values.birthDate ? values.birthDate.toISOString().split('T')[0] : null
            };

            const res = await signUp(values.email, values.password, metadata);
            console.log('signUp result:', res);

            if (res.error) {
                toast({
                    title: 'Registration failed',
                    description: res.error.message || 'Something went wrong',
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Registration successful',
                    description: 'Revisa tu email si se requiere verificación.',
                });
                navigate('/login');
            }
        } catch (err: any) {
            toast({ title: 'Registration error', description: err?.message ?? String(err), variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex items-center justify-center py-12">
                <div className="w-full max-w-md p-8 bg-card rounded-lg border border-border">
                    <h1 className="text-3xl font-bold text-center mb-8 text-gradient">Create an Account</h1>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>User name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

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
                                name="birthDate"
                                render={({ field }) => {
                                    // Estado local para controlar el mes mostrado en DayPicker
                                    const initialMonth = field.value ? new Date(field.value) : new Date();
                                    const [shownMonth, setShownMonth] = React.useState<Date>(initialMonth);

                                    // Generar rango de años (ajusta si quieres otro)
                                    const currentYear = new Date().getFullYear();
                                    const years = [];
                                    for (let y = 1900; y <= currentYear; y++) years.push(y);

                                    return (
                                        <FormItem>
                                            <FormLabel>Date of Birth</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            className={cn(
                                                                "w-full pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP")
                                                            ) : (
                                                                <span>Pick a date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-3" align="start">
                                                    <div className="flex gap-2 mb-2">
                                                        <select
                                                            aria-label="Month"
                                                            value={shownMonth.getMonth()}
                                                            onChange={(e) => {
                                                                const m = Number(e.target.value);
                                                                setShownMonth(new Date(shownMonth.getFullYear(), m, 1));
                                                            }}
                                                            className="border rounded px-2 py-1 bg-secondary"
                                                        >
                                                            {monthNames.map((m, idx) => (
                                                                <option key={m} value={idx}>{m}</option>
                                                            ))}
                                                        </select>

                                                        <select
                                                            aria-label="Year"
                                                            value={shownMonth.getFullYear()}
                                                            onChange={(e) => {
                                                                const y = Number(e.target.value);
                                                                setShownMonth(new Date(y, shownMonth.getMonth(), 1));
                                                            }}
                                                            className="border rounded px-2 py-1 bg-secondary"
                                                        >
                                                            {years.slice().reverse().map((y) => (
                                                                <option key={y} value={y}>{y}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <DayPicker
                                                        mode="single"
                                                        selected={field.value ?? undefined}
                                                        onSelect={(date) => {
                                                            // date puede ser undefined si se deselecciona
                                                            if (date) field.onChange(date);
                                                        }}
                                                        month={shownMonth}
                                                        onMonthChange={(date) => setShownMonth(date)}
                                                        fromDate={new Date(1900, 0, 1)}
                                                        toDate={new Date()}
                                                        modifiersClassNames={{
                                                            selected: 'bg-primary text-white rounded-full'
                                                        }}
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }}
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

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirm Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Registering...' : 'Register'}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-muted-foreground">
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary hover:underline">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Register;