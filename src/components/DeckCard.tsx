
import React from 'react';
import { Link } from 'react-router-dom';
import { Deck, formatDeckColors } from '@/lib/decks';

interface DeckCardProps {
  deck: Deck;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck }) => {
  return (
    <Link to={`/deck/${deck.id}`} className="block">
      <div className="bg-card rounded-lg overflow-hidden card-hover border border-border">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={deck.imageUrl} 
            alt={deck.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
            <div className="p-4">
              <h3 className="text-white text-xl font-bold">{deck.name}</h3>
              <p className="text-white/80 text-sm mt-1">{formatDeckColors(deck.colors)} • {deck.format}</p>
            </div>
          </div>
        </div>
        <div className="p-4">
          <p className="text-sm text-muted-foreground line-clamp-2">{deck.description}</p>
          <div className="mt-4 flex justify-between items-center">
            <span className="font-bold text-lg">€{deck.price}</span>
            <button className="btn-primary text-sm px-3 py-1">View Deck</button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default DeckCard;
