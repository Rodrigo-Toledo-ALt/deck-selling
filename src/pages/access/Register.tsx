// Register.tsx
// Página de registro de usuarios. Usa react-hook-form + zod para validación,
// un DayPicker popover para la fecha de nacimiento, y signUp del AuthProvider.
// Comentarios concisos para fácil lectura en el TFG.

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
} from '@/components/ui/form.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover.tsx';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast.ts';
import { cn } from '@/lib/utils.ts';
import Navbar from '@/components/Navbar.tsx';
import Footer from '@/components/Footer.tsx';
import { useAuth } from '@/supabase/AuthProvider.tsx';

import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';

// --- Esquema de validación (Zod)
// - birthDate: debe ser una fecha, no futura, y el usuario debe tener al menos 18 años
// - confirmPassword: validado con .refine para coincidir con password
const registerSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Introduce un email válido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    birthDate: z.date({
        required_error: 'La fecha de nacimiento es obligatoria',
    })
        .refine((date) => {
            const birthDate = new Date(date);
            const today = new Date();
            const age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            // No puede ser una fecha futura
            if (birthDate > today) return false;

            // Al menos 18 años (teniendo cuidado con mes/día)
            if (age < 18) return false;
            if (age === 18 && monthDiff < 0) return false;
            if (age === 18 && monthDiff === 0 && today.getDate() < birthDate.getDate()) return false;

            return true;
        }, {
            message: "Debes tener al menos 18 años y la fecha no puede ser futura"
        })
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

type RegisterValues = z.infer<typeof registerSchema>;

// Nombres de meses para el selector personalizado encima del DayPicker
const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const Register = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const { signUp } = useAuth();
    const [isLoading, setIsLoading] = React.useState(false);

    // Configurar react-hook-form con el resolver de zod
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

    // Handler de submit: llama a signUp y muestra mensajes toast.
    // También envía metadatos mínimos (full_name, birthdate en formato ISO).
    const onSubmit = async (values: RegisterValues) => {
        setIsLoading(true);
        try {
            const metadata = {
                full_name: values.name,
                // Almacena la fecha como YYYY-MM-DD o null
                birthdate: values.birthDate ? values.birthDate.toISOString().split('T')[0] : null
            };

            const res = await signUp(values.email, values.password, metadata);
            console.log('Resultado de signUp:', res);

            if (res.error) {
                toast({
                    title: 'Registro fallido',
                    description: res.error.message || 'Algo salió mal',
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Registro exitoso',
                    description: 'Revisa tu email si se requiere verificación.',
                });
                navigate('/login'); // Redirige al login tras registro exitoso
            }
        } catch (err: any) {
            toast({ title: 'Error en registro', description: err?.message ?? String(err), variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex items-center justify-center py-12">
                <div className="w-full max-w-md p-8 bg-card rounded-lg border border-border">
                    <h1 className="text-3xl font-bold text-center mb-8 text-gradient">Crear una cuenta</h1>

                    {/* Formulario conectado a react-hook-form */}
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Campo de nombre */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre de usuario</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Campo de email */}
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

                            {/* Campo de fecha de nacimiento con DayPicker dentro de un Popover.
                                Notas:
                                - field.value es una Date o undefined.
                                - shownMonth es un estado local para mantener sincronizado el selector de mes.
                                - fromDate/toDate limitan el rango seleccionable.
                            */}
                            <FormField
                                control={form.control}
                                name="birthDate"
                                render={({ field }) => {
                                    const initialMonth = field.value ? new Date(field.value) : new Date();
                                    const [shownMonth, setShownMonth] = React.useState<Date>(initialMonth);

                                    const currentYear = new Date().getFullYear();
                                    const years = [];
                                    for (let y = 1900; y <= currentYear; y++) years.push(y);

                                    return (
                                        <FormItem>
                                            <FormLabel>Fecha de nacimiento</FormLabel>
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
                                                                format(field.value, "PPP") // Fecha legible
                                                            ) : (
                                                                <span>Selecciona una fecha</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>

                                                <PopoverContent className="w-auto p-3" align="start">
                                                    {/* Selectores de mes/año para navegar rápidamente */}
                                                    <div className="flex gap-2 mb-2">
                                                        <select
                                                            aria-label="Mes"
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
                                                            aria-label="Año"
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
                                                            // onSelect puede recibir undefined; solo actualiza cuando hay fecha
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

                            {/* Campo de contraseña */}
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contraseña</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Confirmar contraseña */}
                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Confirmar contraseña</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="******" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Botón de enviar */}
                            <Button type="submit" className="w-full" disabled={isLoading}>
                                {isLoading ? 'Registrando...' : 'Registrarse'}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-6 text-center text-sm">
                        <p className="text-muted-foreground">
                            ¿Ya tienes una cuenta?{" "}
                            <Link to="/login" className="text-primary hover:underline">
                                Inicia sesión aquí
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