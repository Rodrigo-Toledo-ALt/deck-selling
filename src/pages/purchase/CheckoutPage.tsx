import { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import CheckoutForm from '@/components/CheckoutForm';
import { useLocation, useNavigate } from 'react-router-dom';
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
    const { clientSecret, orderId } = location.state || {};
    console.log('location.state completo:', location.state);

    const [addresses, setAddresses] = useState<MyAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [loadingAddresses, setLoadingAddresses] = useState(true);
    const [savingAddress, setSavingAddress] = useState(false);
    const [addressConfirmed, setAddressConfirmed] = useState(false);

    const [addrDialogOpen, setAddrDialogOpen] = useState(false);
    const [addrForm, setAddrForm] = useState<Omit<MyAddress, 'id' | 'is_default'>>({
        full_name: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
    });

    const reloadAddresses = async () => {
        const addrs = await getMyAddresses();
        setAddresses(addrs);
        if (addrs.length === 1) setSelectedAddressId(addrs[0].id);
    };

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

    const openAddAddress = () => {
        setAddrForm({ full_name: '', address: '', city: '', state: '', postal_code: '', country: '' });
        setAddrDialogOpen(true);
    };

    const submitAddress = async () => {
        const ok = await createMyAddress(addrForm);
        if (ok) {
            await reloadAddresses();
            setAddrDialogOpen(false);
        }
    };

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

                    {/* PASO 1: Dirección de envío */}
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

                                    {!addressConfirmed && (
                                        <Button variant="outline" onClick={openAddAddress} className="w-full">
                                            <Plus className="w-4 h-4 mr-1" /> Add new address
                                        </Button>
                                    )}

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

                    {/* PASO 2: Pago */}
                    {addressConfirmed && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Payment</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Elements stripe={stripePromise} options={{ clientSecret }}>
                                    <CheckoutForm orderId={orderId} />
                                </Elements>
                            </CardContent>
                        </Card>
                    )}

                    {/* Dialog nueva dirección */}
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