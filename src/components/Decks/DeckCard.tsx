// src/components/DeckCard.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Deck, formatDeckColors } from '@/data/decks.ts';
import { Button } from '@/components/ui/button.tsx';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '@/supabase/AuthProvider';
import { addToCart } from '@/data/cart_remote';
import { addToLocalCart } from '@/data/local_cart';
import { useToast } from '@/components/ui/use-toast';

interface DeckCardProps {
    deck: Deck;
    imageUrl?: string;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck, imageUrl }) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isAdding, setIsAdding] = useState(false);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault(); // Evitar navegación del Link
        e.stopPropagation();

        setIsAdding(true);
        try {
            if (user) {
                await addToCart(deck.id, 1);
            } else {
                addToLocalCart(
                    deck.id,
                    deck.name,
                    deck.price,
                    imageUrl || deck.imageUrl || null,
                    1
                );
            }
            toast({
                title: 'Added to cart',
                description: `${deck.name} has been added to your cart.`,
                duration: 3000,
            });
        } catch (err) {
            console.error('Error adding to cart:', err);
            toast({
                title: 'Error',
                description: 'Could not add item to cart. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsAdding(false);
        }
    };

    return (
        <Link to={`/deck/${deck.id}`} className="block">
            <div className="bg-card rounded-lg overflow-hidden card-hover border border-border">
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={imageUrl || deck.imageUrl || ''}
                        alt={deck.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                        <div className="p-4">
                            <h3 className="text-white text-xl font-bold">{deck.name}</h3>
                            <p className="text-white/80 text-sm mt-1">
                                {formatDeckColors(deck.colors)} • {deck.archetype || 'Commander'}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{deck.description}</p>
                    <div className="mt-4 flex justify-between items-center gap-2">
                        <span className="font-bold text-lg">€{deck.price}</span>
                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleAddToCart}
                                disabled={isAdding}
                                className="flex items-center gap-1"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                {isAdding ? '...' : 'Add'}
                            </Button>
                            <Button size="sm" variant="default">
                                View
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default DeckCard;