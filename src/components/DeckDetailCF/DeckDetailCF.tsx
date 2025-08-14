import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ShoppingCart, AlertCircle } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CardList from './CardList';
import { adaptDatabaseToDeckData, getCommanderImage, getTotalCardCount } from '@/utils/deckAdapter';
import { getProductById } from '@/data/sampleProducts';

// Simulación de API call - reemplazar con llamada real a la base de datos
const fetchProductById = async (id: string) => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Usar los datos de ejemplo que coinciden con la estructura de la BD
  const product = getProductById(id);
  if (!product) {
    throw new Error(`Product with id ${id} not found`);
  }
  
  return product;
};

// Helper component for color symbols (manteniendo compatibilidad con el primer repo)
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

const DeckDetailCF = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [product, setProduct] = useState<any>(null);
  const [deckData, setDeckData] = useState<any>(null);
  const [currentCardImage, setCurrentCardImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError("No product ID provided");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const productData = await fetchProductById(id);
        setProduct(productData);
        
        const adaptedDeckData = adaptDatabaseToDeckData(productData);
        setDeckData(adaptedDeckData);
        
        // Set initial card image to commander or first available card
        const commanderImage = getCommanderImage(adaptedDeckData);
        setCurrentCardImage(commanderImage);
        
        setError(null);
      } catch (err) {
        console.error('Error loading product:', err);
        setError("Failed to load product");
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const handleCardHover = (imageUrl: string) => {
    setCurrentCardImage(imageUrl);
  };

  const handleCardLeave = () => {
    if (deckData) {
      const commanderImage = getCommanderImage(deckData);
      setCurrentCardImage(commanderImage);
    }
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    
    // Simulate adding to cart with delay
    setTimeout(() => {
      setIsAdding(false);
      toast({
        title: "Added to cart",
        description: `${product?.name} has been added to your cart`,
        duration: 3000,
      });
    }, 800);
  };

  const formatDeckColors = (colors: string[]) => {
    const colorNames: { [key: string]: string } = {
      W: 'White',
      U: 'Blue', 
      B: 'Black',
      R: 'Red',
      G: 'Green'
    };
    return colors.map(color => colorNames[color] || color).join(', ');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Loading deck details...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product || !deckData) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center">
            <AlertCircle className="w-16 h-16 text-muted-foreground mb-4" />
            <h1 className="text-3xl font-bold mb-4">Deck Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || "The deck you're looking for doesn't exist or has been removed."}
            </p>
            <Link to="/catalog" className="btn-primary">
              Browse Decks
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalCards = getTotalCardCount(deckData);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Link to="/catalog" className="text-primary hover:underline">
                ← Back to Catalog
              </Link>
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">M</span>
              </div>
              <h1 className="text-2xl font-bold">{product.name}</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-muted-foreground">Format: {product.format}</span>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3">
            <Button className="bg-primary hover:bg-primary/90">
              ▶ Playtest
            </Button>
            <Button 
              variant="outline"
              onClick={handleAddToCart}
              disabled={isAdding}
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              {isAdding ? 'Adding...' : `💰 Buy Deck - €${product.price}`}
            </Button>
            <Button variant="outline">
              ⬇ Download
            </Button>
            <Button variant="outline">
              ⋯ More
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Column - Card Display */}
          <div className="lg:col-span-1">
            <Card className="bg-card border-border">
              <CardHeader className="text-center">
                <div className="relative mx-auto w-full max-w-64 aspect-[5/7] rounded-lg overflow-hidden border-2 border-border shadow-lg">
                  <img
                    src={currentCardImage}
                    alt="Card"
                    className="w-full h-full object-cover transition-all duration-300"
                  />
                </div>
                <CardTitle className="text-xl mt-4">
                  {deckData.commander.length > 0 ? deckData.commander[0].name : product.name}
                </CardTitle>
                <CardDescription>
                  {deckData.commander.length > 0 ? "Legendary Creature — Commander" : product.description}
                </CardDescription>
                <div className="flex justify-center gap-2 mt-2">
                  {product.colors.map((color: string) => (
                    <ColorSymbol key={color} color={color} />
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Price:</span>
                    <span className="text-price-buy font-bold">€{product.price}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cards:</span>
                    <span className="font-bold">{totalCards}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Format:</span>
                    <span className="font-bold">{product.format}</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    <Button 
                      size="sm" 
                      className="bg-price-buy hover:bg-price-buy/90"
                      onClick={handleAddToCart}
                      disabled={isAdding}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {isAdding ? 'Adding...' : 'Add to Cart'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Columns - Card Lists */}
          <div className="lg:col-span-3">
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {deckData.commander.length > 0 && (
                <CardList
                  title="Commander"
                  cards={deckData.commander}
                  onCardHover={handleCardHover}
                  onCardLeave={handleCardLeave}
                />
              )}
              {deckData.planeswalkers.length > 0 && (
                <CardList
                  title="Planeswalkers"
                  cards={deckData.planeswalkers}
                  onCardHover={handleCardHover}
                  onCardLeave={handleCardLeave}
                />
              )}
              {deckData.creatures.length > 0 && (
                <CardList
                  title="Creatures"
                  cards={deckData.creatures}
                  onCardHover={handleCardHover}
                  onCardLeave={handleCardLeave}
                />
              )}
              {deckData.sorceries.length > 0 && (
                <CardList
                  title="Sorceries"
                  cards={deckData.sorceries}
                  onCardHover={handleCardHover}
                  onCardLeave={handleCardLeave}
                />
              )}
              {deckData.instants.length > 0 && (
                <CardList
                  title="Instants"
                  cards={deckData.instants}
                  onCardHover={handleCardHover}
                  onCardLeave={handleCardLeave}
                />
              )}
              {deckData.artifacts.length > 0 && (
                <CardList
                  title="Artifacts"
                  cards={deckData.artifacts}
                  onCardHover={handleCardHover}
                  onCardLeave={handleCardLeave}
                />
              )}
              {deckData.lands.length > 0 && (
                <CardList
                  title="Lands"
                  cards={deckData.lands}
                  onCardHover={handleCardHover}
                  onCardLeave={handleCardLeave}
                />
              )}
              {deckData.sideboard.length > 0 && (
                <CardList
                  title="Sideboard"
                  cards={deckData.sideboard}
                  onCardHover={handleCardHover}
                  onCardLeave={handleCardLeave}
                />
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default DeckDetailCF;