import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DeckCard from '@/components/DeckCard';
import { decks, Deck, colorNames } from '@/lib/decks';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

const archetypeOptions = ['All', 'Aggro', 'Control', 'Combo', 'Midrange', 'Tempo', 'Stax', 'Tribal'];
const colorOptions = ['Any', 'White', 'Blue', 'Black', 'Red', 'Green', 'Multicolor', 'Colorless'];

const colorMap: Record<string, string> = {
  'White': 'W',
  'Blue': 'U',
  'Black': 'B',
  'Red': 'R',
  'Green': 'G'
};

const ColorIcon = ({ color, selected }: { color: string, selected: boolean }) => {
  const colorClasses: Record<string, string> = {
    'White': 'bg-white',
    'Blue': 'bg-blue-500',
    'Black': 'bg-black',
    'Red': 'bg-red-600',
    'Green': 'bg-green-600',
    'Multicolor': 'bg-gradient-to-br from-white via-red-500 to-green-500',
    'Colorless': 'bg-gray-400',
    'Any': 'bg-gradient-to-r from-[#685BC7] via-[#A472E3] to-[#B827E3]',
  };

  return (
    <div className={`color-icon-button ${selected ? 'active' : ''}`}>
      <div 
        className={`w-7 h-7 rounded-full ${colorClasses[color]} flex items-center justify-center`}
        title={color}
      >
        {color === 'Any' && <span className="text-xs text-white font-bold">All</span>}
      </div>
    </div>
  );
};

const Catalog = () => {
  const [archetype, setArchetype] = useState('All');
  const [selectedColor, setSelectedColor] = useState('Any');
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>(decks);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    let results = [...decks];
    
    if (archetype !== 'All') {
      results = results.filter(deck => deck.archetype === archetype);
    }
    
    if (selectedColor !== 'Any') {
      if (selectedColor === 'Multicolor') {
        results = results.filter(deck => deck.colors.length > 1);
      } else if (selectedColor === 'Colorless') {
        results = results.filter(deck => deck.colors.length === 0);
      } else {
        const colorCode = colorMap[selectedColor];
        results = results.filter(deck => deck.colors.includes(colorCode as any));
      }
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        deck => 
          deck.name.toLowerCase().includes(query) || 
          deck.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredDecks(results);
  }, [archetype, selectedColor, searchQuery]);
  
  const resetFilters = () => {
    setArchetype('All');
    setSelectedColor('Any');
    setSearchQuery('');
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="py-12 bg-secondary">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4 text-gradient">Commander Decks</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Browse our collection of premium Commander MTG proxy decks. All decks are €60 with free shipping.
            </p>
          </div>
        </section>
        
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="text-muted-foreground h-5 w-5" />
                </div>
                <input
                  type="text"
                  placeholder="Search decks..."
                  className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="mb-8 space-y-6">
              <div>
                <h3 className="font-medium mb-3">Filter by Color</h3>
                <div className="flex flex-wrap gap-3">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className="focus:outline-none"
                      aria-label={`Filter by ${color}`}
                    >
                      <ColorIcon color={color} selected={selectedColor === color} />
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">Filter by Archetype</h3>
                <ToggleGroup 
                  type="single" 
                  value={archetype}
                  onValueChange={(value) => {
                    if (value) setArchetype(value);
                  }}
                  className="flex flex-wrap gap-2"
                >
                  {archetypeOptions.map(option => (
                    <ToggleGroupItem 
                      key={option} 
                      value={option}
                      variant={option === 'All' ? 'default' : 'outline'}
                      className={option === archetype ? 'bg-primary text-white' : ''}
                    >
                      {option}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
              
              {(selectedColor !== 'Any' || archetype !== 'All' || searchQuery) && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-medium">Active Filters:</h3>
                    <button
                      onClick={resetFilters}
                      className="text-sm text-primary flex items-center gap-1 hover:underline"
                    >
                      <X size={14} /> Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedColor !== 'Any' && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Color: {selectedColor}
                        <button onClick={() => setSelectedColor('Any')}>
                          <X size={14} className="ml-1" />
                        </button>
                      </Badge>
                    )}
                    {archetype !== 'All' && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Archetype: {archetype}
                        <button onClick={() => setArchetype('All')}>
                          <X size={14} className="ml-1" />
                        </button>
                      </Badge>
                    )}
                    {searchQuery && (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        Search: {searchQuery}
                        <button onClick={() => setSearchQuery('')}>
                          <X size={14} className="ml-1" />
                        </button>
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {filteredDecks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredDecks.map(deck => (
                  <DeckCard key={deck.id} deck={deck} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No decks found matching your criteria</p>
                <Button 
                  className="mt-4"
                  variant="outline"
                  onClick={resetFilters}
                >
                  Reset Filters
                </Button>
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
