
import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DeckCard from '@/components/DeckCard';
import { decks, Deck } from '@/lib/decks';

const formatOptions = ['All', 'Standard', 'Modern', 'Commander', 'Pioneer', 'Legacy', 'Pauper'];
const colorOptions = ['Any', 'White', 'Blue', 'Black', 'Red', 'Green', 'Multicolor', 'Colorless'];

const colorMap: Record<string, string> = {
  'White': 'W',
  'Blue': 'U',
  'Black': 'B',
  'Red': 'R',
  'Green': 'G'
};

const Catalog = () => {
  const [format, setFormat] = useState('All');
  const [color, setColor] = useState('Any');
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>(decks);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    let results = [...decks];
    
    // Filter by format
    if (format !== 'All') {
      results = results.filter(deck => deck.format === format);
    }
    
    // Filter by color
    if (color !== 'Any') {
      if (color === 'Multicolor') {
        results = results.filter(deck => deck.colors.length > 1);
      } else if (color === 'Colorless') {
        results = results.filter(deck => deck.colors.length === 0);
      } else {
        const colorCode = colorMap[color];
        results = results.filter(deck => deck.colors.includes(colorCode as any));
      }
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        deck => 
          deck.name.toLowerCase().includes(query) || 
          deck.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredDecks(results);
  }, [format, color, searchQuery]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="py-12 bg-secondary">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4 text-gradient">Deck Catalog</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Browse our collection of premium MTG proxy decks. All decks are €60 with free shipping.
            </p>
          </div>
        </section>
        
        <section className="py-12">
          <div className="container mx-auto px-4">
            {/* Filters */}
            <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="search" className="block mb-2 font-medium">Search</label>
                <input
                  id="search"
                  type="text"
                  placeholder="Search decks..."
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="format" className="block mb-2 font-medium">Format</label>
                <select
                  id="format"
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                >
                  {formatOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="color" className="block mb-2 font-medium">Color</label>
                <select
                  id="color"
                  className="w-full px-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                >
                  {colorOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Results */}
            {filteredDecks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredDecks.map(deck => (
                  <DeckCard key={deck.id} deck={deck} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No decks found matching your criteria</p>
                <button 
                  className="mt-4 btn-outline"
                  onClick={() => {
                    setFormat('All');
                    setColor('Any');
                    setSearchQuery('');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Catalog;
