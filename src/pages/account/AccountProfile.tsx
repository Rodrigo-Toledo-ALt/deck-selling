// AccountProfile.tsx
// Página del perfil de usuario: permite editar perfil, gestionar direcciones,
// cambiar contraseña/email, enviar tickets de soporte y desactivar la cuenta.
// Usa servicios remotos (account_remote) y Supabase directamente.

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    getMe,
    updateMe,
    updateMyEmail,
    getMyAddresses,
    changeMyPassword,
    createMyAddress,
    updateMyAddress,
    deleteMyAddress,
    setDefaultAddress,
    type MeProfile,
    type MyAddress,
} from '@/data/account_remote';
import Navbar from "@/components/Navbar.tsx";
import { supabase } from '@/lib/supabase';

// Representa un pedido del usuario (para vincularlo a tickets de soporte)
type OrderShort = {
    id: string;
    order_date?: string | null;
    total_amount?: number | null;
};

const AccountProfile: React.FC = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<MeProfile | null>(null);
    const [addresses, setAddresses] = useState<MyAddress[]>([]);
    const [username, setUsername] = useState('');
    const [emailDraft, setEmailDraft] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Estados para pedidos (soporte)
    const [orders, setOrders] = useState<OrderShort[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    // Estados para ticket de soporte
    const [selectedOrder, setSelectedOrder] = useState<string>(''); // ID del pedido
    const [supportSubject, setSupportSubject] = useState('');
    const [supportMessage, setSupportMessage] = useState('');
    const [sendingSupport, setSendingSupport] = useState(false);

    // Estados para diálogo de dirección
    const [addrDialogOpen, setAddrDialogOpen] = useState(false);
    const [addrEditing, setAddrEditing] = useState<MyAddress | null>(null); // null = nueva dirección
    const [addrForm, setAddrForm] = useState<Omit<MyAddress, 'id' | 'is_default'>>({
        full_name: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
    });

    // Diálogo de desactivar cuenta
    const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

    // --- Efecto inicial: cargar perfil y direcciones ---
    useEffect(() => {
        (async () => {
            setLoading(true);
            const me = await getMe();
            const addrs = await getMyAddresses();
            if (me) {
                setProfile(me);
                setUsername(me.username);
                setEmailDraft(me.email);
            }
            setAddresses(addrs);
            setLoading(false);
        })();

        // Cargar pedidos por separado (menos crítico)
        fetchMyOrders();
    }, []);

    // --- Cargar pedidos del usuario (para el desplegable de soporte) ---
    const fetchMyOrders = async () => {
        try {
            setOrdersLoading(true);
            const { data: auth } = await supabase.auth.getUser();
            const userId = auth.user?.id;
            if (!userId) return;

            const { data, error } = await supabase
                .from('orders')
                .select('id, order_date, total_amount')
                .eq('user_id', userId)
                .order('order_date', { ascending: false });

            if (error) {
                console.error('fetchMyOrders error:', error);
                return;
            }
            setOrders((data ?? []) as OrderShort[]);
        } catch (err) {
            console.error('fetchMyOrders unexpected error:', err);
        } finally {
            setOrdersLoading(false);
        }
    };

    // --- PERFIL ---

    // Guardar cambios en el nombre de usuario
    const onSaveProfile = async () => {
        try {
            setSaving(true);
            const ok = await updateMe({ username });
            if (!ok) throw new Error();
            setProfile(prev => (prev ? { ...prev, username } : prev));
            toast({ title: 'Guardado', description: 'Tu perfil ha sido actualizado.' });
        } catch {
            toast({ title: 'Error', description: 'No se pudo actualizar el perfil.', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    // Solicitar cambio de email (requiere verificación)
    const onChangeEmail = async () => {
        if (!emailDraft || emailDraft === profile?.email) return;
        try {
            const ok = await updateMyEmail(emailDraft);
            if (!ok) throw new Error();
            toast({
                title: 'Actualización de email solicitada',
                description: 'Revisa tu bandeja de entrada para verificar el nuevo email.',
            });
        } catch {
            toast({ title: 'Error', description: 'No se pudo actualizar el email.', variant: 'destructive' });
        }
    };

    // --- SEGURIDAD ---

    // Cambiar contraseña
    const onChangePassword = async () => {
        if (!newPassword) return;
        try {
            const ok = await changeMyPassword(newPassword);
            if (!ok) throw new Error();
            toast({ title: 'Contraseña cambiada', description: 'Usa tu nueva contraseña la próxima vez.' });
            setNewPassword(''); // Limpiar campo
        } catch {
            toast({ title: 'Error', description: 'No se pudo cambiar la contraseña.', variant: 'destructive' });
        }
    };

    // Recargar direcciones desde el servidor
    const reloadAddresses = async () => setAddresses(await getMyAddresses());

    // --- DIRECCIONES ---

    // Abrir diálogo para añadir nueva dirección
    const openAddAddress = () => {
        setAddrEditing(null);
        setAddrForm({ full_name: '', address: '', city: '', state: '', postal_code: '', country: '' });
        setAddrDialogOpen(true);
    };

    // Abrir diálogo para editar dirección existente
    const openEditAddress = (a: MyAddress) => {
        setAddrEditing(a);
        setAddrForm({
            full_name: a.full_name,
            address: a.address,
            city: a.city,
            state: a.state,
            postal_code: a.postal_code,
            country: a.country,
        });
        setAddrDialogOpen(true);
    };

    // Marcar dirección como predeterminada
    const onSetDefault = async (id: string) => {
        const ok = await setDefaultAddress(id);
        if (ok) {
            toast({ title: 'Dirección por defecto actualizada' });
            await reloadAddresses(); // Recargar para reflejar cambios
        } else {
            toast({ title: 'Error', description: 'No se pudo establecer la dirección por defecto', variant: 'destructive' });
        }
    };

    // Guardar dirección (crear o actualizar)
    const submitAddress = async () => {
        let ok = false;
        if (addrEditing) {
            // Modo edición
            ok = await updateMyAddress(addrEditing.id, addrForm);
            ok
                ? toast({ title: 'Dirección actualizada' })
                : toast({ title: 'Error', description: 'No se pudo actualizar la dirección', variant: 'destructive' });
        } else {
            // Modo creación
            ok = await createMyAddress(addrForm);
            ok
                ? toast({ title: 'Dirección añadida' })
                : toast({ title: 'Error', description: 'No se pudo añadir la dirección', variant: 'destructive' });
        }
        if (ok) await reloadAddresses(); // Recargar lista
        setAddrDialogOpen(false);
        setAddrEditing(null);
    };

    // Eliminar dirección con confirmación
    const removeAddress = async (id: string) => {
        if (!confirm('¿Eliminar esta dirección?')) return;
        const ok = await deleteMyAddress(id);
        if (ok) {
            toast({ title: 'Dirección eliminada' });
            await reloadAddresses(); // Recargar lista
        } else {
            toast({ title: 'Error', description: 'No se pudo eliminar la dirección', variant: 'destructive' });
        }
    };

    // --- DESACTIVAR CUENTA ---

    // Desactiva la cuenta del usuario actual en la BD
    const deactivateAccount = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { error } = await supabase
            .from('users')
            .update({
                status: 'inactive',
                inactivated_at: new Date().toISOString(),
                deactivated_by: session.user.id,       // Quién lo hizo
                deactivated_by_role: 'user'             // Rol del que lo hizo
            })
            .eq('id', session.user.id); // Solo el propio usuario

        if (error) {
            toast({
                title: 'Error',
                description: 'No se pudo desactivar la cuenta',
                variant: 'destructive'
            });
        } else {
            toast({
                title: 'Cuenta desactivada',
                description: 'Tu cuenta ha sido desactivada. Puedes contactar soporte para reactivarla.'
            });
            // Opcional: cerrar sesión y redirigir
            await supabase.auth.signOut();
            window.location.href = '/';
        }
        setShowDeactivateDialog(false);
    };

    // --- SOPORTE ---

    // Enviar ticket de soporte a la tabla 'support_tickets'
    const submitSupportTicket = async () => {
        if (!supportSubject.trim() || !supportMessage.trim()) {
            toast({ title: 'Faltan datos', description: 'Asunto y mensaje son obligatorios', variant: 'destructive' });
            return;
        }
        try {
            setSendingSupport(true);
            const { data: auth } = await supabase.auth.getUser();
            const userId = auth.user?.id;
            if (!userId) {
                toast({ title: 'Error', description: 'No estás autenticado', variant: 'destructive' });
                setSendingSupport(false);
                return;
            }

            const payload = {
                user_id: userId,
                order_id: selectedOrder || null, // Opcional
                subject: supportSubject,
                message: supportMessage,
                status: 'open',
                created_at: new Date().toISOString()
            };

            const { error } = await supabase.from('support_tickets').insert([payload]);

            if (error) {
                console.error('create support ticket error:', error);
                toast({ title: 'Error', description: 'No se pudo enviar la solicitud', variant: 'destructive' });
            } else {
                toast({ title: 'Solicitud enviada', description: 'Te contactaremos lo antes posible.' });
                // Resetear formulario
                setSelectedOrder('');
                setSupportSubject('');
                setSupportMessage('');
            }
        } catch (err) {
            console.error('submitSupportTicket unexpected error:', err);
            toast({ title: 'Error', description: 'Error inesperado al enviar la solicitud', variant: 'destructive' });
        } finally {
            setSendingSupport(false);
        }
    };

    // --- RENDER ---

    if (loading) return <div className="p-6 text-center">Loading...</div>;

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <div className="container mx-auto max-w-9xl p-4 md:p-6 space-y-6">
                <h1 className="text-2xl font-semibold mb-2">Mi Cuenta</h1>

                {/* PERFIL */}
                <Card>
                    <CardHeader><CardTitle>Perfil</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Nombre de usuario */}
                            <div>
                                <Label htmlFor="username">Nombre de usuario</Label>
                                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </div>
                            {/* Fecha de nacimiento (solo lectura) */}
                            <div>
                                <Label htmlFor="birthdate">Fecha de nacimiento</Label>
                                <Input id="birthdate" value={profile?.birthdate ?? ''} disabled />
                                <p className="text-xs text-muted-foreground mt-1">Este campo no se puede cambiar.</p>
                            </div>
                            {/* Email con botón de actualización */}
                            <div className="md:col-span-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="flex gap-2">
                                    <Input id="email" type="email" value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)} />
                                    <Button variant="outline" onClick={onChangeEmail} disabled={emailDraft === profile?.email}>
                                        Actualizar email
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={onSaveProfile} disabled={saving}>Guardar</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* DIRECCIONES */}
                <Card>
                    <CardHeader><CardTitle>Direcciones</CardTitle></CardHeader>
                    <CardContent>
                        {addresses.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No hay direcciones guardadas.</p>
                        ) : (
                            <ul className="space-y-2">
                                {addresses.map(a => (
                                    <li
                                        key={a.id}
                                        // Hacer clic en la dirección la marca como predeterminada (salvo que ya lo sea)
                                        onClick={() => !a.is_default && onSetDefault(a.id)}
                                        className={`flex items-start gap-3 border rounded-md p-3 transition-colors ${
                                            a.is_default
                                                ? 'border-primary bg-primary/5 cursor-default'
                                                : 'cursor-pointer hover:border-primary/50 hover:bg-muted/30'
                                        }`}
                                    >
                                        {/* Selector visual (círculo) */}
                                        <div className="mt-0.5 flex-shrink-0">
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                a.is_default
                                                    ? 'border-primary'
                                                    : 'border-muted-foreground/40'
                                            }`}>
                                                {a.is_default && (
                                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Datos de la dirección */}
                                        <div className="text-sm flex-1">
                                            <div className="font-medium">{a.full_name}</div>
                                            <div className="text-muted-foreground">{a.address}</div>
                                            <div className="text-muted-foreground">{a.city}, {a.state} {a.postal_code}, {a.country}</div>
                                        </div>

                                        {/* Acciones: editar/eliminar (evita propagar clic al li) */}
                                        <div className="flex gap-2" onClick={e => e.stopPropagation()}>
                                            <Button size="icon" variant="outline" onClick={() => openEditAddress(a)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="destructive" onClick={() => removeAddress(a.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <div className="mt-4">
                            <Button onClick={openAddAddress}><Plus className="w-4 h-4 mr-1" /> Añadir dirección</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* SOPORTE / CONTACTO */}
                <Card>
                    <CardHeader><CardTitle>Soporte y Contacto</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {/* Selector de pedido (opcional) */}
                        <div>
                            <Label>Pedido (opcional)</Label>
                            <select
                                className="w-full p-2 bg-background border rounded-md"
                                value={selectedOrder}
                                onChange={(e) => setSelectedOrder(e.target.value)}
                            >
                                <option value="">General / Ninguno</option>
                                {orders.map(o => (
                                    <option key={o.id} value={o.id}>
                                        {`Pedido #${o.id.slice(0, 8)}${o.order_date ? ` - ${new Date(o.order_date).toLocaleDateString()}` : ''}`}
                                    </option>
                                ))}
                            </select>
                            {ordersLoading && <p className="text-xs text-muted-foreground mt-1">Cargando pedidos...</p>}
                        </div>

                        {/* Asunto del ticket */}
                        <div>
                            <Label>Asunto</Label>
                            <Input value={supportSubject} onChange={(e) => setSupportSubject(e.target.value)} placeholder="Ej: Cancelar pedido" />
                        </div>

                        {/* Mensaje del ticket */}
                        <div>
                            <Label>Mensaje</Label>
                            <textarea
                                className="w-full p-2 bg-background border rounded-md min-h-[100px]"
                                value={supportMessage}
                                onChange={(e) => setSupportMessage(e.target.value)}
                                placeholder="Explícanos brevemente qué ha pasado..."
                            />
                        </div>

                        {/* Botón de envío */}
                        <div className="flex justify-end">
                            <Button
                                onClick={submitSupportTicket}
                                disabled={sendingSupport || !supportSubject.trim() || !supportMessage.trim()}
                            >
                                {sendingSupport ? 'Enviando...' : 'Enviar solicitud'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* SEGURIDAD */}
                <Card>
                    <CardHeader><CardTitle>Seguridad</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {/* Cambiar contraseña */}
                        <div>
                            <Label htmlFor="password">Cambiar contraseña</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Nueva contraseña"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <Button variant="outline" onClick={onChangePassword} disabled={!newPassword}>Cambiar</Button>
                            </div>
                        </div>

                        {/* DESACTIVAR CUENTA */}
                        <div className="border-t pt-4 mt-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium text-destructive">Desactivar Cuenta</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Desactiva tu cuenta permanentemente. Puedes contactar soporte para reactivarla después.
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowDeactivateDialog(true)}
                                >
                                    Desactivar Cuenta
                                </Button>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            También puedes usar el botón de cerrar sesión en la barra de navegación para terminar tu sesión actual.
                        </p>
                    </CardContent>
                </Card>

                {/* Diálogo: Añadir/Editar Dirección */}
                <Dialog open={addrDialogOpen} onOpenChange={setAddrDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{addrEditing ? 'Editar dirección' : 'Añadir dirección'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                                <Label>Nombre completo</Label>
                                <Input
                                    placeholder="Nombre y apellidos"
                                    value={addrForm.full_name}
                                    onChange={e => setAddrForm(v => ({ ...v, full_name: e.target.value }))}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Dirección</Label>
                                <Input
                                    value={addrForm.address}
                                    onChange={e => setAddrForm(v => ({ ...v, address: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label>Ciudad</Label>
                                <Input
                                    value={addrForm.city}
                                    onChange={e => setAddrForm(v => ({ ...v, city: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label>Provincia</Label>
                                <Input
                                    value={addrForm.state}
                                    onChange={e => setAddrForm(v => ({ ...v, state: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label>Código postal</Label>
                                <Input
                                    value={addrForm.postal_code}
                                    onChange={e => setAddrForm(v => ({ ...v, postal_code: e.target.value }))}
                                />
                            </div>
                            <div>
                                <Label>País</Label>
                                <Input
                                    value={addrForm.country}
                                    onChange={e => setAddrForm(v => ({ ...v, country: e.target.value }))}
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setAddrDialogOpen(false)}>Cancelar</Button>
                            <Button
                                onClick={submitAddress}
                                disabled={!addrForm.address || !addrForm.city || !addrForm.postal_code || !addrForm.country}
                            >
                                {addrEditing ? 'Guardar' : 'Añadir'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Diálogo: Confirmar Desactivación de Cuenta */}
                <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Desactivar Cuenta</DialogTitle>
                            <DialogDescription>
                                ¿Estás seguro de que quieres desactivar tu cuenta? Esto hará que:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>No puedas iniciar sesión</li>
                                    <li>Tu historial de pedidos se mantenga por motivos legales</li>
                                    <li>Se detengan todas las comunicaciones por email</li>
                                </ul>
                                <p className="mt-2 font-medium">Esta acción se puede revertir contactando con soporte.</p>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
                                Cancelar
                            </Button>
                            <Button variant="destructive" onClick={deactivateAccount}>
                                Sí, Desactivar Cuenta
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default AccountProfile;