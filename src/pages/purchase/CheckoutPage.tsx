// CheckoutPage.tsx
// Página de checkout (pasos):
// 1) Selección/creación y confirmación de dirección de envío
// 2) Pago con Stripe (Elements + CheckoutForm)

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import CheckoutForm from '@/components/CheckoutForm';
import { supabase } from '@/supabase/supabase-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
    getMyAddresses,
    createMyAddress,
    type MyAddress,
} from '@/data/account_remote';

const CheckoutPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // clientSecret y orderId vienen del paso anterior (webhook n8n -> /checkout)
    const { clientSecret, orderId } = location.state || {};
    console.log('location.state completo:', location.state);

    // Direcciónes del usuario y selección
    const [addresses, setAddresses] = useState<MyAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [savingAddress, setSavingAddress] = useState(false);
    const [addressConfirmed, setAddressConfirmed] = useState(false); // flag para pasar al paso pago

    // Dialog y formulario para añadir nueva dirección
    const [addrDialogOpen, setAddrDialogOpen] = useState(false);
    const [addrForm, setAddrForm] = useState<Omit<MyAddress, 'id' | 'is_default'>>({
        full_name: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
    });

    // Recarga direcciones desde el servicio y selecciona si hay una única dirección
    const reloadAddresses = async () => {
        const addrs = await getMyAddresses();
        setAddresses(addrs);
        if (addrs.length === 1) setSelectedAddressId(addrs[0].id);
    };

    // Al montar, cargar direcciones y seleccionar la por defecto si existe
    useEffect(() => {
        const fetchAddresses = async () => {
            const addrs = await getMyAddresses();
            setAddresses(addrs);
            const defaultAddr = addrs.find(a => a.is_default);
            if (defaultAddr) setSelectedAddressId(defaultAddr.id);
            else if (addrs.length === 1) setSelectedAddressId(addrs[0].id);
            setLoadingAddresses(false);
        };
        fetchAddresses();
    }, []);

    // Abrir dialog para añadir dirección (resetea el formulario)
    const openAddAddress = () => {
        setAddrForm({ full_name: '', address: '', city: '', state: '', postal_code: '', country: '' });
        setAddrDialogOpen(true);
    };

    // Enviar nueva dirección al backend (createMyAddress) y recargar lista
    const submitAddress = async () => {
        const ok = await createMyAddress(addrForm);
        if (ok) {
            await reloadAddresses();
            setAddrDialogOpen(false);
        }
    };

    // Confirmar dirección seleccionada para la orden:
    // guarda shipping_address_id en la tabla orders y activa el paso de pago
    const handleConfirmAddress = async () => {
        if (!selectedAddressId || !orderId) return;
        setSavingAddress(true);

        const { error } = await supabase
            .from('orders')
            .update({ shipping_address_id: selectedAddressId })
            .eq('id', orderId);

        setSavingAddress(false);
        if (error) {
            console.error('Error saving address:', error);
            return;
        }
        setAddressConfirmed(true);
    };

    // Si no hay clientSecret (flujo roto), mostrar mensaje de error simple
    if (!clientSecret) return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow flex items-center justify-center">
                <p className="text-muted-foreground">Error: no payment session found.</p>
            </main>
            <Footer />
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <div className="max-w-2xl mx-auto p-6 space-y-6">
                    <h1 className="text-2xl font-bold">Checkout</h1>

                    {/* PASO 1: Selección / creación de dirección */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping address</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {loadingAddresses ? (
                                <p className="text-sm text-muted-foreground">Loading addresses...</p>
                            ) : (
                                <>
                                    {addresses.length === 0 ? (
                                        <p className="text-sm text-muted-foreground">
                                            You have no saved addresses. Add one to continue.
                                        </p>
                                    ) : (
                                        // Lista de direcciones; se puede seleccionar salvo que ya esté confirmada
                                        <ul className="space-y-2">
                                            {addresses.map(a => (
                                                <li
                                                    key={a.id}
                                                    onClick={() => !addressConfirmed && setSelectedAddressId(a.id)}
                                                    className={`flex items-start gap-3 border rounded-md p-3 transition-colors ${
                                                        addressConfirmed
                                                            ? 'cursor-default opacity-60'
                                                            : 'cursor-pointer hover:border-primary/50'
                                                    } ${selectedAddressId === a.id ? 'border-primary bg-primary/5' : ''}`}
                                                >
                                                    <div className="mt-0.5 flex-shrink-0">
                                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                            selectedAddressId === a.id
                                                                ? 'border-primary'
                                                                : 'border-muted-foreground/40'
                                                        }`}>
                                                            {selectedAddressId === a.id && (
                                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="text-sm">
                                                        <div className="font-medium">{a.full_name}</div>
                                                        <div className="text-muted-foreground">{a.address}</div>
                                                        <div className="text-muted-foreground">
                                                            {a.city}, {a.state} {a.postal_code}, {a.country}
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}

                                    {/* Botón para añadir nueva dirección (abre dialog) */}
                                    {!addressConfirmed && (
                                        <Button variant="outline" onClick={openAddAddress} className="w-full">
                                            <Plus className="w-4 h-4 mr-1" /> Add new address
                                        </Button>
                                    )}

                                    {/* Confirmar dirección seleccionada o mostrar estado confirmado */}
                                    {!addressConfirmed ? (
                                        <Button
                                            onClick={handleConfirmAddress}
                                            disabled={!selectedAddressId || savingAddress}
                                            className="w-full"
                                        >
                                            {savingAddress ? 'Saving...' : 'Confirm address'}
                                        </Button>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-green-600 font-medium">✓ Address confirmed</p>
                                            <Button variant="ghost" size="sm" onClick={() => setAddressConfirmed(false)}>
                                                Change
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* PASO 2: Pago — se muestra solo cuando la dirección está confirmada */}
                    {addressConfirmed && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {/* Stripe Elements: recibe clientSecret y renderiza CheckoutForm */}
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <CheckoutForm orderId={orderId} />
                                </Elements>
                            </CardContent>
                        </Card>
                    )}

                    {/* Dialog para añadir nueva dirección (validación básica en el botón Add) */}
                    <Dialog open={addrDialogOpen} onOpenChange={setAddrDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Add address</DialogTitle>
                            </DialogHeader>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <div className="md:col-span-2">
                                    <Label>Full name</Label>
                                    <Input
                                        placeholder="Name and surname"
                                        value={addrForm.full_name}
                                        onChange={e => setAddrForm(v => ({ ...v, full_name: e.target.value }))}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <Label>Address</Label>
                                    <Input
                                        value={addrForm.address}
                                        onChange={e => setAddrForm(v => ({ ...v, address: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>City</Label>
                                    <Input
                                        value={addrForm.city}
                                        onChange={e => setAddrForm(v => ({ ...v, city: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>State</Label>
                                    <Input
                                        value={addrForm.state}
                                        onChange={e => setAddrForm(v => ({ ...v, state: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Postal code</Label>
                                    <Input
                                        value={addrForm.postal_code}
                                        onChange={e => setAddrForm(v => ({ ...v, postal_code: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <Label>Country</Label>
                                    <Input
                                        value={addrForm.country}
                                        onChange={e => setAddrForm(v => ({ ...v, country: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setAddrDialogOpen(false)}>Cancel</Button>
                                <Button
                                    onClick={submitAddress}
                                    disabled={
                                        !addrForm.full_name ||
                                        !addrForm.address ||
                                        !addrForm.city ||
                                        !addrForm.postal_code ||
                                        !addrForm.country
                                    }
                                >
                                    Add
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CheckoutPage;