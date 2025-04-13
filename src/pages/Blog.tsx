
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Sample blog posts data
const blogPosts = [
  {
    id: 1,
    title: 'How to Start Commander as a Beginner',
    excerpt: 'Commander can be intimidating for new players. Here's how to get started with your first deck...',
    content: 'Commander can be intimidating for new players. Here's how to get started with your first deck. The Commander format, also known as Elder Dragon Highlander (EDH), is a popular Magic: The Gathering format that emphasizes multiplayer gameplay, politics, and big, splashy plays...',
    author: 'Pauper Forge Team',
    date: '2025-03-28',
    category: 'Guides',
    imageUrl: '/placeholder.svg',
  },
  {
    id: 2,
    title: 'Top 5 Budget Commander Decks for 2025',
    excerpt: 'Looking to play Commander without breaking the bank? Check out these powerful budget options...',
    content: 'Looking to play Commander without breaking the bank? Check out these powerful budget options. In this article, we'll explore five Commander decks that can hold their own at most tables without requiring expensive cards...',
    author: 'Pauper Forge Team',
    date: '2025-04-01',
    category: 'Deck Tech',
    imageUrl: '/placeholder.svg',
  },
  {
    id: 3,
    title: 'Understanding Proxy Quality and Production',
    excerpt: 'Learn about the process behind creating high-quality MTG proxies and what makes them different...',
    content: 'Learn about the process behind creating high-quality MTG proxies and what makes them different. At Pauper Forge, we take pride in the quality of our proxy cards. This article breaks down our production process and explains the differences between various proxy types available on the market...',
    author: 'Pauper Forge Team',
    date: '2025-04-10',
    category: 'Behind the Scenes',
    imageUrl: '/placeholder.svg',
  },
];

// Categories for the tabs
const categories = ['All', 'Guides', 'Deck Tech', 'Behind the Scenes'];

const Blog = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <section className="py-12 bg-secondary">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4 text-gradient">Blog</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Stay updated with the latest Commander strategies, deck techs, and MTG proxy news
            </p>
          </div>
        </section>
        
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Tabs defaultValue="All" className="mb-12">
              <TabsList className="mx-auto flex justify-center mb-8">
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                ))}
              </TabsList>
              
              {categories.map((category) => (
                <TabsContent key={category} value={category}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogPosts
                      .filter(post => category === 'All' || post.category === category)
                      .map(post => (
                        <div key={post.id} className="bg-card rounded-lg overflow-hidden border border-border card-hover">
                          <div className="relative h-48 overflow-hidden">
                            <img 
                              src={post.imageUrl} 
                              alt={post.title} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="p-6">
                            <div className="flex items-center text-sm text-muted-foreground mb-3">
                              <span className="flex items-center">
                                <User size={14} className="mr-1" />
                                {post.author}
                              </span>
                              <span className="mx-2">•</span>
                              <span className="flex items-center">
                                <CalendarDays size={14} className="mr-1" />
                                {new Date(post.date).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold mb-2">{post.title}</h3>
                            <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                            <Button 
                              className="w-full"
                              variant="outline"
                            >
                              Read More
                            </Button>
                          </div>
                        </div>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
