import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AdminLayout from '@/components/AdminLayout';

// NUEVO: trae de Supabase
import { getAllDecks, getSignedMainImageUrl, Deck } from '@/data/decks_remote';

type DeckRow = Deck & { imageUrl?: string; archetype?: string };

const DeckManagement: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [decks, setDecks] = useState<DeckRow[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                const list = await getAllDecks();
                // Firmar portada para la miniatura
                const urls = await Promise.all(list.map(d => getSignedMainImageUrl(d, 3600)));
                const rows: DeckRow[] = list.map((d, i) => ({
                    ...d,
                    imageUrl: urls[i] || '',
                    archetype: 'Commander', // si luego guardas arquetipo en DB, cámbialo aquí
                }));
                if (!alive) return;
                setDecks(rows);
            } catch (e) {
                console.error('DeckManagement load error:', e);
                toast({ title: 'Error', description: 'Could not load decks from Supabase', variant: 'destructive' });
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [toast]);

    const handleEditDeck = (deckId: string) => {
        navigate(`/admin/decks/edit/${deckId}`);
    };

    const handleDeleteDeck = async (deckId: string) => {
        if (!window.confirm('Are you sure you want to delete this deck?')) return;

        // Opcional: borrar en Supabase
        // const { error } = await supabase.from('products').delete().eq('id', deckId);
        // if (error) {
        //   toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
        //   return;
        // }

        setDecks(prev => prev.filter(d => d.id !== deckId));
        toast({ title: 'Deck deleted', description: 'The deck has been successfully deleted' });
    };

    const handleCreateDeck = () => {
        navigate('/admin/decks/create');
    };

    return (
        <AdminLayout>
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gradient">Manage Decks</h1>
                    <Button onClick={handleCreateDeck} className="flex items-center gap-2">
                        <Plus size={16} />
                        <span>Create New Deck</span>
                    </Button>
                </div>

                <div className="bg-card rounded-lg border border-border overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Archetype</TableHead>
                                <TableHead>Colors</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                [...Array(6)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><div className="w-16 h-12 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                                        <TableCell />
                                    </TableRow>
                                ))
                            ) : decks.map((deck) => (
                                <TableRow key={deck.id}>
                                    <TableCell>
                                        {deck.imageUrl ? (
                                            <img
                                                src={deck.imageUrl}
                                                alt={deck.name}
                                                className="w-16 h-12 object-cover rounded"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-16 h-12 bg-muted rounded" />
                                        )}
                                    </TableCell>
                                    <TableCell className="font-medium">{deck.name}</TableCell>
                                    <TableCell>{deck.archetype || 'Commander'}</TableCell>
                                    <TableCell>{deck.colors.join(', ')}</TableCell>
                                    <TableCell>€{deck.price}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" onClick={() => handleEditDeck(deck.id)}>
                                                <Pencil size={16} />
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={() => handleDeleteDeck(deck.id)}>
                                                <Trash2 size={16} />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AdminLayout>
    );
};

export default DeckManagement;