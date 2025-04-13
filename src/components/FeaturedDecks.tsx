
import React from 'react';
import { Link } from 'react-router-dom';
import DeckCard from './DeckCard';
import { getFeaturedDecks } from '@/lib/decks';

const FeaturedDecks = () => {
  const featuredDecks = getFeaturedDecks();
  
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-3xl font-bold text-gradient">Featured Decks</h2>
          <Link 
            to="/catalog" 
            className="btn-outline"
          >
            View All Decks
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredDecks.map(deck => (
            <DeckCard key={deck.id} deck={deck} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedDecks;
