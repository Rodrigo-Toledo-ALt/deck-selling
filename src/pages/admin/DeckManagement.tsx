// DeckManagement.tsx
// Página admin para listar, crear, editar, ocultar y borrar mazos.
// Comentarios breves en español para que se entienda rápido en el TFG.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import AdminLayout from '@/components/AdminLayout';
import { getAllDecks, getSignedMainImageUrl, Deck, setDeckVisibility, deleteDeck } from '@/data/decks_remote';
import Navbar from "@/components/Navbar.tsx";

type DeckRow = Deck & { imageUrl?: string; archetype?: string };

const DeckManagement: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();

    // Lista de mazos con campos adicionales para la UI
    const [decks, setDecks] = useState<DeckRow[]>([]);
    const [loading, setLoading] = useState(true);

    // Carga inicial: obtiene todos los mazos y firma la URL de la imagen principal
    useEffect(() => {
        let alive = true; // evita actualizar estado si el componente se desmonta
        (async () => {
            try {
                setLoading(true);
                const list = await getAllDecks(true); // obtiene datos desde Supabase
                // Pedimos URLs firmadas en paralelo para mostrar thumbnails
                const urls = await Promise.all(list.map(d => getSignedMainImageUrl(d, 3600)));
                const rows: DeckRow[] = list.map((d, i) => ({
                    ...d,
                    imageUrl: urls[i] || '',
                    archetype: 'Commander', // valor por defecto en la UI
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

    const handleEditDeck = (deckId: string) => navigate(`/admin/decks/edit/${deckId}`);

    // Borrado con confirm y actualización local de la lista si tiene éxito
    const handleDeleteDeck = async (deckId: string) => {
        if (!window.confirm('Are you sure you want to delete this deck?')) return;
        try {
            await deleteDeck(deckId);
            setDecks(prev => prev.filter(d => d.id !== deckId)); // remover localmente
            toast({ title: 'Deck deleted', description: 'The deck has been successfully deleted.' });
        } catch (e: any) {
            console.error('handleDeleteDeck error:', e);
            toast({
                title: 'Cannot delete deck',
                description: e?.message ?? 'An error occurred while deleting the deck.',
                variant: 'destructive',
            });
        }
    };

    const handleCreateDeck = () => navigate('/admin/decks/create');

    // Toggle de visibilidad: llama al servicio y actualiza el estado local
    const handleToggleVisibility = async (deckId: string, currentVisibility: boolean) => {
        try {
            const nextVisibility = !currentVisibility;
            await setDeckVisibility(deckId, nextVisibility);
            setDecks(prev =>
                prev.map(deck => deck.id === deckId ? { ...deck, is_visible: nextVisibility } : deck)
            );
            toast({
                title: nextVisibility ? 'Deck visible' : 'Deck hidden',
                description: nextVisibility
                    ? 'The deck is now visible in the catalog.'
                    : 'The deck is now hidden from users.',
            });
        } catch (e) {
            console.error('handleToggleVisibility error:', e);
            toast({ title: 'Error', description: 'Could not update deck visibility.', variant: 'destructive' });
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
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
                                    <TableHead>Visibility</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    // Esqueleto de carga para la tabla
                                    [...Array(6)].map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><div className="w-16 h-12 bg-muted animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                                            <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                                            <TableCell />
                                        </TableRow>
                                    ))
                                ) : decks.map((deck) => (
                                    <TableRow key={deck.id}>
                                        <TableCell>
                                            {deck.imageUrl ? (
                                                // Thumbnail con lazy loading
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
                                        <TableCell>
                                            {/* Botón que alterna visibilidad */}
                                            <Button
                                                variant={deck.is_visible ? 'default' : 'secondary'}
                                                size="sm"
                                                onClick={() => handleToggleVisibility(deck.id, deck.is_visible)}
                                                className="flex items-center gap-2"
                                            >
                                                {deck.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                                                {deck.is_visible ? 'Visible' : 'Hidden'}
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                {/* Abrir vista pública, editar y borrar */}
                                                <Button variant="outline" size="sm" onClick={() => navigate(`/deck/${deck.id}`)}>
                                                    <ExternalLink size={16} />
                                                </Button>
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
        </div>
    );
};

export default DeckManagement;