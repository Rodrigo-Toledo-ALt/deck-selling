// AccountProfile.tsx
// User profile page: edit profile, manage addresses,
// change password/email, submit support tickets and deactivate account.
// Uses remote services (account_remote) and Supabase directly.

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

// Represents a short order object (for linking to support tickets)
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

    // Orders state (for support)
    const [orders, setOrders] = useState<OrderShort[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    // Support ticket state
    const [selectedOrder, setSelectedOrder] = useState<string>(''); // order id
    const [supportSubject, setSupportSubject] = useState('');
    const [supportMessage, setSupportMessage] = useState('');
    const [sendingSupport, setSendingSupport] = useState(false);

    // Address dialog state
    const [addrDialogOpen, setAddrDialogOpen] = useState(false);
    const [addrEditing, setAddrEditing] = useState<MyAddress | null>(null); // null = new address
    const [addrForm, setAddrForm] = useState<Omit<MyAddress, 'id' | 'is_default'>>({
        full_name: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
    });

    // Deactivate account dialog
    const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

    // --- Initial effect: load profile and addresses ---
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

        // Load orders separately (less critical)
        fetchMyOrders();
    }, []);

    // --- Load user's orders (for support dropdown) ---
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

    // --- PROFILE ---

    // Save username changes
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

    // Request email change (requires verification)
    const onChangeEmail = async () => {
        if (!emailDraft || emailDraft === profile?.email) return;
        try {
            const ok = await updateMyEmail(emailDraft);
            if (!ok) throw new Error();
            toast({
                title: 'Email change requested',
                description: 'Check your inbox to verify the new email.',
            });
        } catch {
            toast({ title: 'Error', description: 'Could not request email change.', variant: 'destructive' });
        }
    };

    // --- SECURITY ---

    // Change password
    const onChangePassword = async () => {
        if (!newPassword) return;
        try {
            const ok = await changeMyPassword(newPassword);
            if (!ok) throw new Error();
            toast({ title: 'Password changed', description: 'Use your new password next time.' });
            setNewPassword(''); // clear field
        } catch {
            toast({ title: 'Error', description: 'Could not change the password.', variant: 'destructive' });
        }
    };

    // Reload addresses from server
    const reloadAddresses = async () => setAddresses(await getMyAddresses());

    // --- ADDRESSES ---

    // Open dialog to add new address
    const openAddAddress = () => {
        setAddrEditing(null);
        setAddrForm({ full_name: '', address: '', city: '', state: '', postal_code: '', country: '' });
        setAddrDialogOpen(true);
    };

    // Open dialog to edit existing address
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

    // Mark address as default
    const onSetDefault = async (id: string) => {
        const ok = await setDefaultAddress(id);
        if (ok) {
            toast({ title: 'Default address updated' });
            await reloadAddresses(); // refresh to reflect changes
        } else {
            toast({ title: 'Error', description: 'Could not set default address', variant: 'destructive' });
        }
    };

    // Save address (create or update)
    const submitAddress = async () => {
        let ok = false;
        if (addrEditing) {
            // Edit mode
            ok = await updateMyAddress(addrEditing.id, addrForm);
            ok
                ? toast({ title: 'Address updated' })
                : toast({ title: 'Error', description: 'Could not update the address', variant: 'destructive' });
        } else {
            // Create mode
            ok = await createMyAddress(addrForm);
            ok
                ? toast({ title: 'Address added' })
                : toast({ title: 'Error', description: 'Could not add the address', variant: 'destructive' });
        }
        if (ok) await reloadAddresses(); // refresh list
        setAddrDialogOpen(false);
        setAddrEditing(null);
    };

    // Delete address with confirmation
    const removeAddress = async (id: string) => {
        if (!confirm('Delete this address?')) return;
        const ok = await deleteMyAddress(id);
        if (ok) {
            toast({ title: 'Address removed' });
            await reloadAddresses(); // refresh list
        } else {
            toast({ title: 'Error', description: 'Could not remove the address', variant: 'destructive' });
        }
    };

    // --- DEACTIVATE ACCOUNT ---

    // Deactivate the current user's account in the DB
    const deactivateAccount = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { error } = await supabase
            .from('users')
            .update({
                status: 'inactive',
                inactivated_at: new Date().toISOString(),
                deactivated_by: session.user.id,       // who did it
                deactivated_by_role: 'user'            // role of actor
            })
            .eq('id', session.user.id); // only the user themself

        if (error) {
            toast({
                title: 'Error',
                description: 'Could not deactivate the account',
                variant: 'destructive'
            });
        } else {
            toast({
                title: 'Account deactivated',
                description: 'Your account has been deactivated. You can contact support to reactivate it.'
            });
            // Optional: sign out and redirect
            await supabase.auth.signOut();
            window.location.href = '/';
        }
        setShowDeactivateDialog(false);
    };

    // --- SUPPORT ---

    // Submit a support ticket to 'support_tickets' table
    const submitSupportTicket = async () => {
        if (!supportSubject.trim() || !supportMessage.trim()) {
            toast({ title: 'Missing data', description: 'Subject and message are required', variant: 'destructive' });
            return;
        }
        try {
            setSendingSupport(true);
            const { data: auth } = await supabase.auth.getUser();
            const userId = auth.user?.id;
            if (!userId) {
                toast({ title: 'Error', description: 'You are not authenticated', variant: 'destructive' });
                setSendingSupport(false);
                return;
            }

            const payload = {
                user_id: userId,
                order_id: selectedOrder || null, // optional
                subject: supportSubject,
                message: supportMessage,
                status: 'open',
                created_at: new Date().toISOString()
            };

            const { error } = await supabase.from('support_tickets').insert([payload]);

            if (error) {
                console.error('create support ticket error:', error);
                toast({ title: 'Error', description: 'Could not send the request', variant: 'destructive' });
            } else {
                toast({ title: 'Request sent', description: 'We will contact you as soon as possible.' });
                // Reset form
                setSelectedOrder('');
                setSupportSubject('');
                setSupportMessage('');
            }
        } catch (err) {
            console.error('submitSupportTicket unexpected error:', err);
            toast({ title: 'Error', description: 'Unexpected error while sending the request', variant: 'destructive' });
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
                <h1 className="text-2xl font-semibold mb-2">My Account</h1>

                {/* PROFILE */}
                <Card>
                    <CardHeader><CardTitle>Profile</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Username */}
                            <div>
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
                            </div>
                            {/* Date of birth (read-only) */}
                            <div>
                                <Label htmlFor="birthdate">Date of birth</Label>
                                <Input id="birthdate" value={profile?.birthdate ?? ''} disabled />
                                <p className="text-xs text-muted-foreground mt-1">This field cannot be changed.</p>
                            </div>
                            {/* Email with update button */}
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
                    <CardHeader><CardTitle>Addresses</CardTitle></CardHeader>
                    <CardContent>
                        {addresses.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No addresses saved.</p>
                        ) : (
                            <ul className="space-y-2">
                                {addresses.map(a => (
                                    <li
                                        key={a.id}
                                        // Clicking the address marks it as default (unless it already is)
                                        onClick={() => !a.is_default && onSetDefault(a.id)}
                                        className={`flex items-start gap-3 border rounded-md p-3 transition-colors ${
                                            a.is_default
                                                ? 'border-primary bg-primary/5 cursor-default'
                                                : 'cursor-pointer hover:border-primary/50 hover:bg-muted/30'
                                        }`}
                                    >
                                        {/* Visual selector (circle) */}
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

                                        {/* Address details */}
                                        <div className="text-sm flex-1">
                                            <div className="font-medium">{a.full_name}</div>
                                            <div className="text-muted-foreground">{a.address}</div>
                                            <div className="text-muted-foreground">{a.city}, {a.state} {a.postal_code}, {a.country}</div>
                                        </div>

                                        {/* Actions: edit/delete (stop propagation from li) */}
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
                            <Button onClick={openAddAddress}><Plus className="w-4 h-4 mr-1" /> Add address</Button>
                        </div>
                    </CardContent>
                </Card>

                {/* SUPPORT / CONTACT */}
                <Card>
                    <CardHeader><CardTitle>Support & Contact</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {/* Order selector (optional) */}
                        <div>
                            <Label>Order (optional)</Label>
                            <select
                                className="w-full p-2 bg-background border rounded-md"
                                value={selectedOrder}
                                onChange={(e) => setSelectedOrder(e.target.value)}
                            >
                                <option value="">General / None</option>
                                {orders.map(o => (
                                    <option key={o.id} value={o.id}>
                                        {`Order #${o.id.slice(0, 8)}${o.order_date ? ` - ${new Date(o.order_date).toLocaleDateString()}` : ''}`}
                                    </option>
                                ))}
                            </select>
                            {ordersLoading && <p className="text-xs text-muted-foreground mt-1">Loading orders...</p>}
                        </div>

                        {/* Ticket subject */}
                        <div>
                            <Label>Subject</Label>
                            <Input value={supportSubject} onChange={(e) => setSupportSubject(e.target.value)} placeholder="e.g. Cancel order" />
                        </div>

                        {/* Ticket message */}
                        <div>
                            <Label>Message</Label>
                            <textarea
                                className="w-full p-2 bg-background border rounded-md min-h-[100px]"
                                value={supportMessage}
                                onChange={(e) => setSupportMessage(e.target.value)}
                                placeholder="Briefly explain what happened..."
                            />
                        </div>

                        {/* Submit button */}
                        <div className="flex justify-end">
                            <Button
                                onClick={submitSupportTicket}
                                disabled={sendingSupport || !supportSubject.trim() || !supportMessage.trim()}
                            >
                                {sendingSupport ? 'Sending...' : 'Submit request'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* SECURITY */}
                <Card>
                    <CardHeader><CardTitle>Security</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        {/* Change password */}
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
                                <Button variant="outline" onClick={onChangePassword} disabled={!newPassword}>Change</Button>
                            </div>
                        </div>

                        {/* DEACTIVATE ACCOUNT */}
                        <div className="border-t pt-4 mt-6">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="font-medium text-destructive">Deactivate Account</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Deactivate your account permanently. You can contact support to reactivate it later.
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowDeactivateDialog(true)}
                                >
                                    Deactivate Account
                                </Button>
                            </div>
                        </div>

                        <p className="text-xs text-muted-foreground">
                            You can also use the sign out button in the navigation bar to end your current session.
                        </p>
                    </CardContent>
                </Card>

                {/* Dialog: Add/Edit Address */}
                <Dialog open={addrDialogOpen} onOpenChange={setAddrDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{addrEditing ? 'Edit address' : 'Add address'}</DialogTitle>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="md:col-span-2">
                                <Label>Full name</Label>
                                <Input
                                    placeholder="First and last name"
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
                                disabled={!addrForm.address || !addrForm.city || !addrForm.postal_code || !addrForm.country}
                            >
                                {addrEditing ? 'Save' : 'Add'}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Dialog: Confirm Deactivate Account */}
                <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Deactivate Account</DialogTitle>
                            <DialogDescription>
                                Are you sure you want to deactivate your account? This will:
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Prevent you from signing in</li>
                                    <li>Keep your order history for legal reasons</li>
                                    <li>Stop all email communications</li>
                                </ul>
                                <p className="mt-2 font-medium">This action can be reverted by contacting support.</p>
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowDeactivateDialog(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={deactivateAccount}>
                                Yes, Deactivate Account
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default AccountProfile;