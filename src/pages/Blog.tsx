
import React from 'react';
import { Button } from '@/components/ui/button';
import { CalendarDays, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const blogPosts = [
  {
    id: 1,
    title: 'Understanding Magic: The Gathering Color Identities',
    excerpt: 'Learn about the five colors of Magic and what they represent in gameplay and philosophy.',
    date: 'April 5, 2025',
    imageUrl: '/placeholder.svg',
    category: 'Game Mechanics'
  },
  {
    id: 2,
    title: 'Top Budget Decks for Casual Play in 2025',
    excerpt: 'Discover affordable yet competitive decks that won't break the bank but will impress at your local game night.',
    date: 'March 28, 2025',
    imageUrl: '/placeholder.svg',
    category: 'Deck Building'
  },
  {
    id: 3,
    title: 'The History of Proxy Cards in Magic',
    excerpt: 'Explore the evolution of proxy cards and their role in making the game more accessible to players.',
    date: 'March 15, 2025',
    imageUrl: '/placeholder.svg',
    category: 'MTG History'
  }
];

const Blog = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {/* Hero section */}
        <section className="bg-card py-16 mb-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gradient text-center">
              MTG Insights & Strategies
            </h1>
            <p className="text-lg max-w-2xl mx-auto text-center text-muted-foreground">
              Stay updated with the latest Magic: The Gathering trends, deck strategies, and community insights.
            </p>
          </div>
        </section>

        {/* Blog posts */}
        <section className="container mx-auto px-4 mb-20">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            {blogPosts.map((post) => (
              <div key={post.id} className="bg-card rounded-lg overflow-hidden border border-border card-hover">
                <div className="aspect-video w-full bg-muted relative">
                  <img 
                    src={post.imageUrl} 
                    alt={post.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-4 right-4 bg-primary/90 text-primary-foreground text-xs px-3 py-1 rounded-full">
                    {post.category}
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <CalendarDays size={16} className="mr-2" />
                    <span>{post.date}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3">{post.title}</h3>
                  <p className="text-muted-foreground mb-5">{post.excerpt}</p>
                  
                  <Button variant="link" className="p-0 h-auto font-medium text-primary flex items-center" asChild>
                    <Link to={`/blog/${post.id}`}>
                      Read More <ArrowRight size={16} className="ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
