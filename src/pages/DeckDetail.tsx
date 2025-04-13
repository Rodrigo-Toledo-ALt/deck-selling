
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getDeckById, formatDeckColors, colorNames } from '@/lib/decks';
import { useToast } from "@/components/ui/use-toast";
import { ShoppingCart, AlertCircle } from 'lucide-react';

// Helper component for color symbols
const ColorSymbol = ({ color }: { color: string }) => {
  const bgColor = {
    W: 'bg-yellow-200',
    U: 'bg-blue-500',
    B: 'bg-gray-800',
    R: 'bg-red-500',
    G: 'bg-green-500'
  }[color] || 'bg-gray-400';
  
  return (
    <span className={`inline-block ${bgColor} rounded-full w-6 h-6 mx-0.5 border border-white/20`}></span>
  );
};

const DeckDetail = () => {
  const { id } = useParams<{ id: string }>();
  const deck = getDeckById(id || '');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  
  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Simulate adding to cart with delay
    setTimeout(() => {
      setIsAdding(false);
      toast({
        title: "Added to cart",
        description: `${deck?.name} has been added to your cart`,
        duration: 3000,
      });
      
      // Optionally navigate to cart
      // navigate('/cart');
    }, 800);
  };
  
  if (!deck) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
            <h1 className="text-3xl font-bold mb-4">Deck Not Found</h1>
            <p className="text-muted-foreground mb-6">The deck you're looking for doesn't exist or has been removed.</p>
            <Link to="/catalog" className="btn-primary">
              Browse Decks
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <Link to="/catalog" className="text-primary hover:underline mb-6 inline-block">
            ← Back to Catalog
          </Link>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Deck Image and Info */}
            <div>
              <div className="rounded-lg overflow-hidden border border-border mb-6">
                <img 
                  src={deck.imageUrl} 
                  alt={deck.name} 
                  className="w-full h-[400px] object-cover"
                />
              </div>
              
              <h1 className="text-3xl font-bold mb-2">{deck.name}</h1>
              
              <div className="flex items-center mb-4">
                {deck.colors.map(color => (
                  <ColorSymbol key={color} color={color} />
                ))}
                <span className="ml-2 text-muted-foreground">
                  {formatDeckColors(deck.colors)} • {deck.format}
                </span>
              </div>
              
              <p className="text-lg mb-6 text-foreground/90">{deck.description}</p>
              
              <div className="bg-card p-6 rounded-lg border border-border mb-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xl font-bold">€{deck.price}</span>
                  <span className="text-green-500">In Stock</span>
                </div>
                
                <button 
                  className={`w-full btn-primary flex items-center justify-center ${isAdding ? 'opacity-80' : ''}`}
                  onClick={handleAddToCart}
                  disabled={isAdding}
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isAdding ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
              
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-xl font-bold mb-4">Deck Details</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Format:</span>
                    <span>{deck.format}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Colors:</span>
                    <span>{formatDeckColors(deck.colors)}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-muted-foreground">Card Count:</span>
                    <span>{deck.cards.reduce((acc, card) => acc + card.quantity, 0)}</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Card List */}
            <div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h2 className="text-2xl font-bold mb-6">Card List</h2>
                
                <div className="flex flex-col divide-y divide-border">
                  {deck.cards.map((card, index) => (
                    <div key={index} className="py-3 flex justify-between">
                      <span>{card.name}</span>
                      <span className="text-muted-foreground">x{card.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DeckDetail;
