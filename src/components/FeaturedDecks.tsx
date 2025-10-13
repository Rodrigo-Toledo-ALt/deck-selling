// src/components/FeaturedDecks.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import DeckCard from './DeckCard';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { getFeaturedDecks, getSignedMainImageUrl, Deck } from '@/data/decks_remote';

type DeckWithSigned = Deck & { signedMainImageUrl?: string };

const FeaturedDecks: React.FC = () => {
    const [featuredDecks, setFeaturedDecks] = React.useState<DeckWithSigned[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const decks = await getFeaturedDecks();
                const signed = await Promise.all(decks.map(d => getSignedMainImageUrl(d, 3600)));
                const merged = decks.map((d, i) => ({ ...d, signedMainImageUrl: signed[i] }));
                if (mounted) setFeaturedDecks(merged);
            } catch (e) {
                console.error(e);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => { mounted = false; };
    }, []);

    return (
        <section className="py-16">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-3xl font-bold text-gradient">Featured Decks</h2>
                    <Link to="/catalog">
                        <Button variant="outline" className="flex items-center gap-2">
                            <span>View All Decks</span>
                            <ArrowRight size={16} />
                        </Button>
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse h-64 bg-muted rounded-xl" />
                        ))}
                    </div>
                ) : featuredDecks.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        No featured decks available at the moment.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {featuredDecks.map((deck) => (
                            <DeckCard
                                key={deck.id}
                                deck={deck}
                                imageUrl={deck.signedMainImageUrl || ''}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedDecks;