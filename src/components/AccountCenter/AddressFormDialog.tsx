// AddressFormDialog.tsx
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MyAddress } from '@/data/account_remote';

interface Props {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initial?: MyAddress | null;
    onSubmit: (payload: Omit<MyAddress, 'id'>, id?: string) => Promise<void>;
}

const AddressFormDialog: React.FC<Props> = ({ open, onOpenChange, initial, onSubmit }) => {
    const [address, setAddress] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');
    const [postal_code, setPostalCode] = useState('');
    const [country, setCountry] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (initial) {
            setAddress(initial.address);
            setCity(initial.city);
            setState(initial.state);
            setPostalCode(initial.postal_code);
            setCountry(initial.country);
        } else {
            setAddress('');
            setCity('');
            setState('');
            setPostalCode('');
            setCountry('');
        }
    }, [initial, open]);

    const submit = async () => {
        setSaving(true);
        await onSubmit({ address, city, state, postal_code, country }, initial?.id);
        setSaving(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initial ? 'Edit address' : 'Add address'}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                        <Label>Address</Label>
                        <Input value={address} onChange={e => setAddress(e.target.value)} />
                    </div>
                    <div>
                        <Label>City</Label>
                        <Input value={city} onChange={e => setCity(e.target.value)} />
                    </div>
                    <div>
                        <Label>State</Label>
                        <Input value={state} onChange={e => setState(e.target.value)} />
                    </div>
                    <div>
                        <Label>Postal code</Label>
                        <Input value={postal_code} onChange={e => setPostalCode(e.target.value)} />
                    </div>
                    <div>
                        <Label>Country</Label>
                        <Input value={country} onChange={e => setCountry(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={submit} disabled={saving || !address || !city || !postal_code || !country}>
                        {initial ? 'Save' : 'Add'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default AddressFormDialog;