// src/pages/account/AccountProfile.tsx
import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
    getMe,
    updateMe,
    updateMyEmail,
    getMyAddresses,
    getMyPaymentMethods,
    changeMyPassword,
    createMyAddress,
    updateMyAddress,
    deleteMyAddress,
    createMyPaymentMethod,
    updateMyPaymentMethod,
    deleteMyPaymentMethod,
    type MeProfile,
    type MyAddress,
    type MyPaymentMethod,
} from '@/data/account_remote';
import Navbar from "@/components/Navbar.tsx";


const AccountProfile: React.FC = () => {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [profile, setProfile] = useState<MeProfile | null>(null);
    const [addresses, setAddresses] = useState<MyAddress[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<MyPaymentMethod[]>([]);
    const [username, setUsername] = useState('');
    const [emailDraft, setEmailDraft] = useState('');
    const [newPassword, setNewPassword] = useState('');

    // Address dialog state
    const [addrDialogOpen, setAddrDialogOpen] = useState(false);
    const [addrEditing, setAddrEditing] = useState<MyAddress | null>(null);
    const [addrForm, setAddrForm] = useState<Omit<MyAddress, 'id'>>({
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
    });

    // Payment method dialog state
    const [pmDialogOpen, setPmDialogOpen] = useState(false);
    const [pmEditing, setPmEditing] = useState<MyPaymentMethod | null>(null);
    const [pmForm, setPmForm] = useState<Omit<MyPaymentMethod, 'id'>>({
        card_type: '',
        expiry_date: '',
        billing_address_id: '',
    });

    useEffect(() => {
        (async () => {
            setLoading(true);
            const me = await getMe();
            const addrs = await getMyAddresses();
            const pms = await getMyPaymentMethods();
            if (me) {
                setProfile(me);
                setUsername(me.username);
                setEmailDraft(me.email);
            }
            setAddresses(addrs);
            setPaymentMethods(pms);
            setLoading(false);
        })();
    }, []);

    // PROFILE
    const onSaveProfile = async () => {
        try {
            setSaving(true);
            const ok = await updateMe({ username });
            if (!ok) throw new Error();
            setProfile(prev => (prev ? { ...prev, username } : prev));
            toast({ title: 'Saved', description: 'Your profile has been updated.' });
        } catch {
            toast({ title: 'Error', description: 'Could not update profile.', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const onChangeEmail = async () => {
        if (!emailDraft || emailDraft === profile?.email) return;
        try {
            const ok = await updateMyEmail(emailDraft);
            if (!ok) throw new Error();
            toast({
                title: 'Email update requested',
                description: 'Check your inbox to verify your new email address.',
            });
        } catch {
            toast({ title: 'Error', description: 'Could not update email.', variant: 'destructive' });
        }
    };

    // SECURITY
    const onChangePassword = async () => {
        if (!newPassword) return;
        try {
            const ok = await changeMyPassword(newPassword);
            if (!ok) throw new Error();
            toast({ title: 'Password changed', description: 'Use your new password next time.' });
            setNewPassword('');
        } catch {
            toast({ title: 'Error', description: 'Could not change password.', variant: 'destructive' });
        }
    };

    // Helpers
    const reloadAddresses = async () => setAddresses(await getMyAddresses());
    const reloadPaymentMethods = async () => setPaymentMethods(await getMyPaymentMethods());

    // Address dialog open/prepare
    const openAddAddress = () => {
        setAddrEditing(null);
        setAddrForm({ address: '', city: '', state: '', postal_code: '', country: '' });
        setAddrDialogOpen(true);
    };
    const openEditAddress = (a: MyAddress) => {
        setAddrEditing(a);
        setAddrForm({
            address: a.address,
            city: a.city,
            state: a.state,
            postal_code: a.postal_code,
            country: a.country,
        });
        setAddrDialogOpen(true);
    };

    // Address submit/delete
    const submitAddress = async () => {
        let ok = false;
        if (addrEditing) {
            ok = await updateMyAddress(addrEditing.id, addrForm);
            ok
                ? toast({ title: 'Address updated' })
                : toast({ title: 'Error', description: 'Could not update address', variant: 'destructive' });
        } else {
            ok = await createMyAddress(addrForm);
            ok
                ? toast({ title: 'Address added' })
                : toast({ title: 'Error', description: 'Could not add address', variant: 'destructive' });
        }
        if (ok) await reloadAddresses();
        setAddrDialogOpen(false);
        setAddrEditing(null);
    };

    const removeAddress = async (id: string) => {
        if (!confirm('Delete this address?')) return;
        const ok = await deleteMyAddress(id);
        if (ok) {
            toast({ title: 'Address deleted' });
            await reloadAddresses();
        } else {
            toast({ title: 'Error', description: 'Could not delete address', variant: 'destructive' });
        }
    };

    // Payment method dialog open/prepare
    const openAddPM = () => {
        setPmEditing(null);
        setPmForm({ card_type: '', expiry_date: '', billing_address_id: '' });
        setPmDialogOpen(true);
    };
    const openEditPM = (pm: MyPaymentMethod) => {
        setPmEditing(pm);
        setPmForm({
            card_type: pm.card_type,
            expiry_date: pm.expiry_date,
            billing_address_id: pm.billing_address_id,
        });
        setPmDialogOpen(true);
    };

    // Payment method submit/delete
    const submitPM = async () => {
        let ok = false;
        if (pmEditing) {
            ok = await updateMyPaymentMethod(pmEditing.id, pmForm);
            ok
                ? toast({ title: 'Payment method updated' })
                : toast({ title: 'Error', description: 'Could not update payment method', variant: 'destructive' });
        } else {
            ok = await createMyPaymentMethod(pmForm);
            ok
                ? toast({ title: 'Payment method added' })
                : toast({ title: 'Error', description: 'Could not add payment method', variant: 'destructive' });
        }
        if (ok) await reloadPaymentMethods();
        setPmDialogOpen(false);
        setPmEditing(null);
    };

    const removePM = async (id: string) => {
        if (!confirm('Delete this payment method?')) return;
        const ok = await deleteMyPaymentMethod(id);
        if (ok) {
            toast({ title: 'Payment method deleted' });
            await reloadPaymentMethods();
        } else {
            toast({ title: 'Error', description: 'Could not delete payment method', variant: 'destructive' });
        }
    };

    if (loading) return <div className="p-6 text-center">Loading...</div>;

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            <div className="container mx-auto max-w-9xl p-4 md:p-6 space-y-6">
                <h1 className="text-2xl font-semibold mb-2">My Account</h1>

                {/* PROFILE */}
                <Card>
                    <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="birthdate">Birthdate</Label>
                                <Input id="birthdate" value={profile?.birthdate ?? ''} disabled />
                                <p className="text-xs text-muted-foreground mt-1">This field cannot be changed.</p>
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="flex gap-2">
                                    <Input id="email" type="email" value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)} />
                                    <Button variant="outline" onClick={onChangeEmail} disabled={emailDraft === profile?.email}>
                                        Update email
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={onSaveProfile} disabled={saving}>Save</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* ADDRESSES */}
                <Card>
                    <CardHeader>
                        <CardTitle>Addresses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {addresses.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No addresses saved.</p>
                        ) : (
                            <ul className="space-y-2">
                                {addresses.map(a => (
                                    <li key={a.id} className="flex items-start justify-between gap-3 border rounded-md p-3">
                                        <div className="text-sm">
                                            <div>{a.address}</div>
                                            <div className="text-muted-foreground">{a.city}, {a.state} {a.postal_code}, {a.country}</div>
                                        </div>
                                        <div className="flex gap-2">
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

                        {/* Add under list */}
                        <div className="mt-4">
                            <Button onClick={openAddAddress}>
                                <Plus className="w-4 h-4 mr-1" /> Add address
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* PAYMENT METHODS */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment Methods</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {paymentMethods.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No payment methods.</p>
                        ) : (
                            <ul className="space-y-2">
                                {paymentMethods.map(pm => (
                                    <li key={pm.id} className="flex items-start justify-between gap-3 border rounded-md p-3">
                                        <div className="text-sm">
                                            <div>{pm.card_type} • Expires {pm.expiry_date}</div>
                                            <div className="text-muted-foreground">Billing address: {pm.billing_address_id}</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="outline" onClick={() => openEditPM(pm)}>
                                                <Pencil className="w-4 h-4" />
                                            </Button>
                                            <Button size="icon" variant="destructive" onClick={() => removePM(pm.id)}>
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}

                        {/* Add under list */}
                        <div className="mt-4">
                            <Button onClick={openAddPM}>
                                <Plus className="w-4 h-4 mr-1" /> Add payment method
                            </Button>
                        </div>

                        <p className="text-xs text-muted-foreground mt-3">
                            Only payment metadata is stored. Full card numbers are never shown.
                        </p>
                    </CardContent>
                </Card>

                {/* SECURITY */}
                <Card>
                    <CardHeader><CardTitle>Security</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="password">Change password</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="New password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <Button variant="outline" onClick={onChangePassword} disabled={!newPassword}>
                                    Change
                                </Button>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            You can also use the logout button in the navigation bar to end your current session.
                        </p>
                    </CardContent>
                </Card>

                {/* Address Dialog */}
                <Dialog open={addrDialogOpen} onOpenChange={setAddrDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{addrEditing ? 'Edit address' : 'Add address'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                                <Label>Address</Label>
                                <Input value={addrForm.address} onChange={e => setAddrForm(v => ({ ...v, address: e.target.value }))} />
                            </div>
                            <div>
                                <Label>City</Label>
                                <Input value={addrForm.city} onChange={e => setAddrForm(v => ({ ...v, city: e.target.value }))} />
                            </div>
                            <div>
                                <Label>State</Label>
                                <Input value={addrForm.state} onChange={e => setAddrForm(v => ({ ...v, state: e.target.value }))} />
                            </div>
                            <div>
                                <Label>Postal code</Label>
                                <Input value={addrForm.postal_code} onChange={e => setAddrForm(v => ({ ...v, postal_code: e.target.value }))} />
                            </div>
                            <div>
                                <Label>Country</Label>
                                <Input value={addrForm.country} onChange={e => setAddrForm(v => ({ ...v, country: e.target.value }))} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setAddrDialogOpen(false)}>Cancel</Button>
                            <Button
                                onClick={submitAddress}
                                disabled={!addrForm.address || !addrForm.city || !addrForm.postal_code || !addrForm.country}
                            >
                                {addrEditing ? 'Save' : 'Add'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Payment Method Dialog */}
                <Dialog open={pmDialogOpen} onOpenChange={setPmDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{pmEditing ? 'Edit payment method' : 'Add payment method'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <Label>Card brand</Label>
                                <Input placeholder="Visa, MasterCard…" value={pmForm.card_type} onChange={e => setPmForm(v => ({ ...v, card_type: e.target.value }))} />
                            </div>
                            <div>
                                <Label>Expiry (YYYY-MM)</Label>
                                <Input placeholder="YYYY-MM" value={pmForm.expiry_date} onChange={e => setPmForm(v => ({ ...v, expiry_date: e.target.value }))} />
                            </div>
                            <div className="md:col-span-2">
                                <Label>Billing address</Label>
                                <Input placeholder="address id" value={pmForm.billing_address_id} onChange={e => setPmForm(v => ({ ...v, billing_address_id: e.target.value }))} />
                                <p className="text-xs text-muted-foreground mt-1">Tip: cambia este input por un Select que liste tus direcciones.</p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setPmDialogOpen(false)}>Cancel</Button>
                            <Button
                                onClick={submitPM}
                                disabled={!pmForm.card_type || !pmForm.expiry_date || !pmForm.billing_address_id}
                            >
                                {pmEditing ? 'Save' : 'Add'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default AccountProfile;