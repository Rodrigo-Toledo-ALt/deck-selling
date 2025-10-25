// PaymentMethodFormDialog.tsx
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { MyPaymentMethod } from '@/data/account_remote';

interface Props {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    initial?: MyPaymentMethod | null;
    onSubmit: (payload: Omit<MyPaymentMethod, 'id'>, id?: string) => Promise<void>;
}

const PaymentMethodFormDialog: React.FC<Props> = ({ open, onOpenChange, initial, onSubmit }) => {
    const [card_type, setCardType] = useState('');
    const [expiry_date, setExpiryDate] = useState(''); // YYYY-MM
    const [billing_address_id, setBillingAddressId] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (initial) {
            setCardType(initial.card_type);
            setExpiryDate(initial.expiry_date);
            setBillingAddressId(initial.billing_address_id);
        } else {
            setCardType('');
            setExpiryDate('');
            setBillingAddressId('');
        }
    }, [initial, open]);

    const submit = async () => {
        setSaving(true);
        await onSubmit({ card_type, expiry_date, billing_address_id }, initial?.id);
        setSaving(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{initial ? 'Edit payment method' : 'Add payment method'}</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <Label>Card brand</Label>
                        <Input placeholder="Visa, MasterCard…" value={card_type} onChange={e => setCardType(e.target.value)} />
                    </div>
                    <div>
                        <Label>Expiry</Label>
                        <Input placeholder="YYYY-MM" value={expiry_date} onChange={e => setExpiryDate(e.target.value)} />
                    </div>
                    <div className="md:col-span-2">
                        <Label>Billing address ID</Label>
                        <Input placeholder="address id" value={billing_address_id} onChange={e => setBillingAddressId(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={submit} disabled={saving || !card_type || !expiry_date || !billing_address_id}>
                        {initial ? 'Save' : 'Add'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentMethodFormDialog;