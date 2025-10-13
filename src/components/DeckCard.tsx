// src/components/DeckCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Deck, formatDeckColors } from '@/data/decks.ts';
import { Button } from '@/components/ui/button';

interface DeckCardProps {
    deck: Deck;
    imageUrl?: string;  // <-- añadir esta prop opcional
}

const DeckCard: React.FC<DeckCardProps> = ({ deck, imageUrl }) => {
    return (
        <Link to={`/deck/${deck.id}`} className="block">
            <div className="bg-card rounded-lg overflow-hidden card-hover border border-border">
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={imageUrl || deck.imageUrl || ''}  // <-- usar imageUrl prop primero
                        alt={deck.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                        <div className="p-4">
                            <h3 className="text-white text-xl font-bold">{deck.name}</h3>
                            <p className="text-white/80 text-sm mt-1">{formatDeckColors(deck.colors)} • {deck.archetype || 'Commander'}</p>
                        </div>
                    </div>
                </div>
                <div className="p-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{deck.description}</p>
                    <div className="mt-4 flex justify-between items-center">
                        <span className="font-bold text-lg">€{deck.price}</span>
                        <Button size="sm" variant="default">View Deck</Button>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default DeckCard;