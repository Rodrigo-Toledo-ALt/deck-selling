import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Drawer, DrawerContent, DrawerFooter, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { Plus, Edit, Trash2, Search } from 'lucide-react';

type Client = {
    id: string;
    name: string;
    email: string;
    phone?: string;
    company?: string;
    active: boolean;
    createdAt: string; // ISO
};

type UpsertClient = Omit<Client, 'id' | 'createdAt'> & { id?: string };

const mockFetchClients = async (): Promise<Client[]> => {
    // TODO: Reemplazar por fetch real a tu backend
    await new Promise(r => setTimeout(r, 250));
    return [
        {
            id: '1',
            name: 'Alice Johnson',
            email: 'alice@example.com',
            phone: '+1 555-0111',
            company: 'Astra Co',
            active: true,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        },
        {
            id: '2',
            name: 'Bob Smith',
            email: 'bob@example.com',
            phone: '+1 555-0222',
            company: 'Orbital LLC',
            active: false,
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        },
    ];
};

const mockCreateClient = async (payload: UpsertClient): Promise<Client> => {
    await new Promise(r => setTimeout(r, 250));
    return {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        ...payload,
    };
};

const mockUpdateClient = async (id: string, payload: UpsertClient): Promise<Client> => {
    await new Promise(r => setTimeout(r, 250));
    return {
        id,
        createdAt: new Date().toISOString(),
        ...payload,
    };
};

const mockDeleteClient = async (_id: string): Promise<void> => {
    await new Promise(r => setTimeout(r, 250));
};

const formatDate = (iso: string) => new Date(iso).toLocaleDateString();

const ClientManagement: React.FC = () => {
    const { toast } = useToast();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(false);

    // search & filters
    const [query, setQuery] = useState('');
    const [onlyActive, setOnlyActive] = useState<boolean>(false);

    // pagination
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // drawer (create/edit)
    const [openDrawer, setOpenDrawer] = useState(false);
    const [editing, setEditing] = useState<Client | null>(null);
    const [form, setForm] = useState<UpsertClient>({
        name: '',
        email: '',
        phone: '',
        company: '',
        active: true,
    });

    const resetForm = () =>
        setForm({
            name: '',
            email: '',
            phone: '',
            company: '',
            active: true,
        });

    const load = async () => {
        try {
            setLoading(true);
            const data = await mockFetchClients();
            setClients(data);
        } catch (e) {
            toast({ title: 'Error', description: 'Could not load clients', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const filtered = useMemo(() => {
        let list = clients;
        if (query.trim()) {
            const q = query.toLowerCase();
            list = list.filter(
                (c) =>
                    c.name.toLowerCase().includes(q) ||
                    c.email.toLowerCase().includes(q) ||
                    (c.company?.toLowerCase() || '').includes(q) ||
                    (c.phone || '').includes(q),
            );
        }
        if (onlyActive) list = list.filter((c) => c.active);
        return list.sort((a, b) => a.name.localeCompare(b.name));
    }, [clients, query, onlyActive]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const pageItems = filtered.slice((page - 1) * pageSize, page * pageSize);

    const onOpenCreate = () => {
        setEditing(null);
        resetForm();
        setOpenDrawer(true);
    };

    const onOpenEdit = (c: Client) => {
        setEditing(c);
        setForm({
            name: c.name,
            email: c.email,
            phone: c.phone || '',
            company: c.company || '',
            active: c.active,
        });
        setOpenDrawer(true);
    };

    const onDelete = async (id: string) => {
        const confirm = window.confirm('Delete this client?');
        if (!confirm) return;
        try {
            await mockDeleteClient(id);
            setClients((prev) => prev.filter((c) => c.id !== id));
            toast({ title: 'Deleted', description: 'Client removed successfully' });
        } catch (e) {
            toast({ title: 'Error', description: 'Could not delete client', variant: 'destructive' });
        }
    };

    const onSubmit = async () => {
        // basic validation
        if (!form.name.trim() || !form.email.trim()) {
            toast({ title: 'Missing fields', description: 'Name and Email are required', variant: 'destructive' });
            return;
        }
        try {
            if (editing) {
                const updated = await mockUpdateClient(editing.id, form);
                setClients((prev) => prev.map((c) => (c.id === editing.id ? updated : c)));
                toast({ title: 'Updated', description: 'Client updated successfully' });
            } else {
                const created = await mockCreateClient(form);
                setClients((prev) => [created, ...prev]);
                toast({ title: 'Created', description: 'Client created successfully' });
            }
            setOpenDrawer(false);
            setEditing(null);
            resetForm();
        } catch (e) {
            toast({ title: 'Error', description: 'Could not save client', variant: 'destructive' });
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <CardTitle>Clients</CardTitle>
                    <Button onClick={onOpenCreate}>
                        <Plus className="mr-2 h-4 w-4" /> New Client
                    </Button>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                    <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
                        <div className="flex items-center gap-2 w-full md:w-96">
                            <Search className="h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, company..."
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setPage(1);
                                }}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch id="onlyActive" checked={onlyActive} onCheckedChange={setOnlyActive} />
                            <Label htmlFor="onlyActive">Only active</Label>
                        </div>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Phone</TableHead>
                                    <TableHead>Company</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : pageItems.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            No results
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    pageItems.map((c) => (
                                        <TableRow key={c.id}>
                                            <TableCell className="font-medium">
                                                <div className="flex flex-col">
                                                    <span>{c.name}</span>
                                                    <span className="text-xs text-muted-foreground">Created: {formatDate(c.createdAt)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>{c.email}</TableCell>
                                            <TableCell>{c.phone || '-'}</TableCell>
                                            <TableCell>{c.company || '-'}</TableCell>
                                            <TableCell>
                                                {c.active ? (
                                                    <Badge variant="default">Active</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Inactive</Badge>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="sm" variant="outline" onClick={() => onOpenEdit(c)}>
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => onDelete(c.id)}>
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    Delete
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages} • {filtered.length} results
            </span>
                        <div className="space-x-2">
                            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                                Prev
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Drawer Create/Edit */}
            <Drawer open={openDrawer} onOpenChange={setOpenDrawer}>
                <DrawerContent>
                    <DrawerHeader>
                        <DrawerTitle>{editing ? 'Edit Client' : 'New Client'}</DrawerTitle>
                    </DrawerHeader>
                    <div className="px-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={form.name}
                                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                    placeholder="Jane Doe"
                                />
                            </div>
                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                    placeholder="jane@example.com"
                                />
                            </div>
                            <div>
                                <Label htmlFor="phone">Phone</Label>
                                <Input
                                    id="phone"
                                    value={form.phone}
                                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                                    placeholder="+1 555-0000"
                                />
                            </div>
                            <div>
                                <Label htmlFor="company">Company</Label>
                                <Input
                                    id="company"
                                    value={form.company}
                                    onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
                                    placeholder="Acme Inc."
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="active"
                                checked={form.active}
                                onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
                            />
                            <Label htmlFor="active">Active</Label>
                        </div>
                    </div>
                    <DrawerFooter>
                        <div className="flex justify-end gap-2 px-6 pb-4">
                            <Button variant="outline" onClick={() => setOpenDrawer(false)}>
                                Cancel
                            </Button>
                            <Button onClick={onSubmit}>{editing ? 'Save changes' : 'Create'}</Button>
                        </div>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
        </div>
    );
};

export default ClientManagement;