
import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import FeaturedDecks from '@/components/FeaturedDecks';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';





const Index = () => {

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-mtg-darkblue mix-blend-multiply opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-mtg-purple/30 to-mtg-blue/30"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 text-gradient">
                Premium MTG Proxy Decks
              </h1>
              <p className="text-lg md:text-xl mb-8 text-foreground/90">
                Discover high-quality proxies of complete Magic: The Gathering decks for casual play at an affordable price.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/catalog" className="btn-primary">
                  Browse Decks
                </Link>
                <Link to="/about" className="btn-outline">
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-secondary">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gradient">Why Choose Pauper Forge?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-xl font-bold mb-3">Complete Decks</h3>
                <p className="text-muted-foreground">
                  We offer complete 60+ card decks, not just individual cards. Everything you need to start playing right away.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-xl font-bold mb-3">Premium Quality</h3>
                <p className="text-muted-foreground">
                  Our proxies are printed on high-quality cardstock with vibrant colors and accurate card text.
                </p>
              </div>
              <div className="bg-card p-6 rounded-lg border border-border">
                <h3 className="text-xl font-bold mb-3">Affordable Price</h3>
                <p className="text-muted-foreground">
                  Get competitive and casual decks at a fraction of the cost of original cards.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Decks */}
        <FeaturedDecks />
        
        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-mtg-purple/20 to-mtg-blue/20 animate-gradient-shift">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6 text-gradient">Ready to Forge Your Deck?</h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto">
              Browse our collection of premium proxy decks and find the perfect fit for your playstyle. All decks are €60 with free shipping.
            </p>
            <Link to="/catalog" className="btn-primary">
              Shop Now
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
