
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShoppingCart, AlertCircle, Trash2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

// Mock cart data for demonstration
const initialCart = [
  {
    id: "burn-modern",
    name: "Modern Burn",
    price: 60,
    quantity: 1,
    imageUrl: "https://images.unsplash.com/photo-1582066278208-7447bfc01a8c?q=80&w=900"
  }
];

const Cart = () => {
  const [cart, setCart] = useState(initialCart);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;
  
  const handleRemoveItem = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
    toast({
      title: "Item removed",
      description: "The item has been removed from your cart.",
      duration: 3000,
    });
  };
  
  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setCart(cart.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };
  
  const handleCheckout = () => {
    setIsCheckingOut(true);
    
    // Simulate checkout process
    setTimeout(() => {
      toast({
        title: "Order placed!",
        description: "Your order has been successfully placed. Thank you for your purchase!",
        duration: 5000,
      });
      setCart([]);
      setIsCheckingOut(false);
      navigate('/');
    }, 1500);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="py-12 bg-secondary">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4 text-gradient">Your Cart</h1>
            <p className="text-lg text-muted-foreground">
              Review your items before checkout
            </p>
          </div>
        </section>
        
        <section className="py-12">
          <div className="container mx-auto px-4">
            {cart.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                  <div className="bg-card rounded-lg border border-border overflow-hidden">
                    <div className="p-6 border-b border-border">
                      <h2 className="text-2xl font-bold">Cart Items ({cart.length})</h2>
                    </div>
                    
                    <div className="divide-y divide-border">
                      {cart.map(item => (
                        <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <div className="w-20 h-20 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={item.imageUrl} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          
                          <div className="flex-grow">
                            <h3 className="font-bold text-lg">{item.name}</h3>
                            <p className="text-muted-foreground">€{item.price}</p>
                          </div>
                          
                          <div className="flex items-center">
                            <button 
                              className="px-3 py-1 border border-border rounded-l-md"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                            >
                              -
                            </button>
                            <span className="px-4 py-1 border-y border-border">{item.quantity}</span>
                            <button 
                              className="px-3 py-1 border border-border rounded-r-md"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          
                          <button 
                            className="text-destructive hover:text-destructive/80"
                            onClick={() => handleRemoveItem(item.id)}
                            aria-label="Remove item"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Order Summary */}
                <div>
                  <div className="bg-card rounded-lg border border-border sticky top-24">
                    <div className="p-6 border-b border-border">
                      <h2 className="text-2xl font-bold">Order Summary</h2>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>€{subtotal}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Shipping</span>
                        <span>{shipping === 0 ? 'Free' : `€${shipping}`}</span>
                      </div>
                      
                      <div className="border-t border-border pt-4 flex justify-between font-bold">
                        <span>Total</span>
                        <span>€{total}</span>
                      </div>
                      
                      <button 
                        className={`w-full btn-primary mt-6 flex items-center justify-center ${isCheckingOut ? 'opacity-80' : ''}`}
                        onClick={handleCheckout}
                        disabled={isCheckingOut}
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {isCheckingOut ? 'Processing...' : 'Checkout'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="flex justify-center mb-4">
                  <AlertCircle className="w-16 h-16 text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
                <p className="text-muted-foreground mb-6">Looks like you haven't added any items to your cart yet.</p>
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/catalog')}
                >
                  Browse Decks
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

export default Cart;
