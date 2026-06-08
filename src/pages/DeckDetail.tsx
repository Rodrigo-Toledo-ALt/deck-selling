import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DeckHeader from '@/components/Decks/DeckDetailCF/DeckHeader';
import CardList from '@/components/Decks/DeckDetailCF/CardList';
import ImageFlip from '@/components/ImageFlip';
import { renderManaCost } from '@/utils/mana.tsx';
import { Button } from '@/components/ui/button';
import { ShoppingCart, X } from 'lucide-react';
import { useAuth } from '@/supabase/AuthProvider';
import { addToCart } from '@/data/cart_remote';
import { addToLocalCart } from '@/data/local_cart';
import { useToast } from '@/components/ui/use-toast';
import {
    getDeckById,
    getSignedMainImageUrl,
    getSignedCardImageUrl,
    Deck,
    DeckData,
    CardInfo,
    CardFace,
} from '@/data/decks_remote';

type FaceWithSigned = CardFace & { signedUrl?: string };
type CardInfoWithSigned = Omit<CardInfo, 'faces'> & { faces: FaceWithSigned[] };
type DeckDataWithSigned = {
    [K in keyof DeckData]: CardInfoWithSigned[];
};

const DeckDetail: React.FC = () => {
    const { id } = useParams();
    const { user, role } = useAuth();
    const { toast } = useToast();

    const [deck, setDeck] = useState<Deck | null>(null);
    const [signedMainImage, setSignedMainImage] = useState<string>('');
    const [deckDataSigned, setDeckDataSigned] = useState<DeckDataWithSigned | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentCard, setCurrentCard] = useState<CardInfoWithSigned | null>(null);
    const [isFlip, setIsFlip] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [popupCard, setPopupCard] = useState<CardInfoWithSigned | null>(null);
    const [popupFaceIndex, setPopupFaceIndex] = useState(0);

    const handleAddToCart = async () => {
        if (!deck) return;
        setIsAdding(true);
        try {
            if (user) {
                await addToCart(deck.id, 1);
            } else {
                addToLocalCart(deck.id, deck.name, deck.price, signedMainImage || deck.imageUrl || null, 1);
            }
            window.dispatchEvent(new Event('cartUpdated'));
            toast({
                title: 'Added to cart',
                description: `${deck.name} has been added to your cart.`,
                duration: 3000,
            });
        } catch (err) {
            console.error('Error adding to cart:', err);
            toast({
                title: 'Error',
                description: 'Could not add item to cart. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsAdding(false);
        }
    };

    useEffect(() => {
        let alive = true;
        (async () => {
            if (!id) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const isAdmin = role === 'admin';
                const d = await getDeckById(id, isAdmin);
                if (!alive) return;

                if (!d) {
                    setDeck(null);
                    setDeckDataSigned(null);
                    setSignedMainImage('');
                    return;
                }

                setDeck(d);

                const mainUrl = await getSignedMainImageUrl(d, 3600);
                if (!alive) return;
                setSignedMainImage(mainUrl || '');

                const sections: (keyof DeckData)[] = [
                    'commander',
                    'planeswalkers',
                    'creatures',
                    'sorceries',
                    'instants',
                    'artifacts',
                    'lands',
                    'sideboard',
                    'tokens',
                    'others',
                ];

                const signedData: Partial<DeckDataWithSigned> = {};

                for (const section of sections) {
                    const list = (d.deckData as any)[section] as CardInfo[] | undefined;
                    const cardsWithSigned: CardInfoWithSigned[] = list && list.length
                        ? await Promise.all(
                            list.map(async (card) => {
                                const faces = await Promise.all(
                                    card.faces.map(async (face) => {
                                        const signedUrl = face.image
                                            ? await getSignedCardImageUrl(face.image, 3600)
                                            : '';
                                        return { ...face, signedUrl };
                                    })
                                );
                                return { ...card, faces };
                            })
                        )
                        : [];
                    (signedData as any)[section] = cardsWithSigned;
                }

                if (!alive) return;
                const s = signedData as DeckDataWithSigned;
                setDeckDataSigned(s);

                const firstCommander = s.commander?.[0];
                if (firstCommander) {
                    setCurrentCard({ ...firstCommander, faces: [firstCommander.faces[0]] });
                } else {
                    for (const key of ['creatures','sorceries','instants','artifacts','planeswalkers','lands','sideboard','tokens','others'] as (keyof DeckDataWithSigned)[]) {
                        const arr = s[key];
                        if (arr && arr.length > 0) {
                            setCurrentCard({ ...arr[0], faces: [arr[0].faces[0]] });
                            break;
                        }
                    }
                }
            } catch (e) {
                console.error('DeckDetail load error:', e);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [id, role]);

    const sections = useMemo(() => {
        const empty: { title: string; cards: CardInfoWithSigned[] }[] = [];
        if (!deckDataSigned) return empty;
        return [
            { title: 'Commander', cards: deckDataSigned.commander || [] },
            { title: 'Planeswalkers', cards: deckDataSigned.planeswalkers || [] },
            { title: 'Creatures', cards: deckDataSigned.creatures || [] },
            { title: 'Sorceries', cards: deckDataSigned.sorceries || [] },
            { title: 'Instants', cards: deckDataSigned.instants || [] },
            { title: 'Artifacts', cards: deckDataSigned.artifacts || [] },
            { title: 'Lands', cards: deckDataSigned.lands || [] },
            { title: 'Sideboard', cards: deckDataSigned.sideboard || [] },
            { title: 'Tokens', cards: deckDataSigned.tokens || [] },
        ].filter((s) => s.cards && s.cards.length > 0);
    }, [deckDataSigned]);

    const handleCardHover = (card: CardInfoWithSigned) => {
        setCurrentCard({ ...card, faces: [card.faces[0]] });
    };

    const handleCardLeave = () => {
        const commander = deckDataSigned?.commander?.[0];
        if (commander) {
            setCurrentCard({ ...commander, faces: [commander.faces[0]] });
        }
    };

    const handleCardClick = (card: CardInfoWithSigned) => {
        setPopupCard(card);
        setPopupFaceIndex(0);
    };

    const handleClosePopup = () => {
        setPopupCard(null);
        setPopupFaceIndex(0);
    };

    const handleFaceChange = (card: CardInfoWithSigned, activeFaceIndex: number) => {
        const activeFace = card.faces[activeFaceIndex];
        if (currentCard && currentCard.name === card.name && currentCard.faces[0] !== activeFace) {
            setIsFlip((v) => !v);
            setTimeout(() => {
                setCurrentCard({ ...card, faces: [activeFace] });
            }, 250);
        } else {
            setCurrentCard({ ...card, faces: [activeFace] });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background/95 text-foreground">
                <Navbar />
                <main className="mx-auto px-4 py-6 w-full">
                    <div className="text-center py-12">Loading deck...</div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!deck || !deckDataSigned) {
        return (
            <div className="min-h-screen bg-background/95 text-foreground">
                <Navbar />
                <main className="mx-auto px-4 py-6 w-full">
                    <div className="p-8 text-center text-xl">Deck not found</div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background/95 text-foreground">
            <Navbar />

            {/* Card Popup Modal */}
            {popupCard && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    onClick={handleClosePopup}
                >
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

                    <div
                        className="relative z-10 flex flex-col sm:flex-row gap-8 bg-card rounded-2xl shadow-2xl p-8 w-full border border-primary/40"
                        style={{
                            maxWidth: '1100px',
                            boxShadow: '0 0 0 1px hsl(var(--primary) / 0.3), 0 0 60px hsl(var(--primary) / 0.2), 0 30px 60px rgba(0,0,0,0.7)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={handleClosePopup}
                            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors rounded-full p-1.5 hover:bg-secondary"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Card image */}
                        <div className="flex flex-col items-center gap-3 shrink-0">
                            <div
                                className="rounded-xl shadow-2xl overflow-hidden"
                                style={{
                                    width: '420px',
                                    aspectRatio: '5/7',
                                    border: '3px solid #100c00',
                                    backgroundColor: '#100c00',
                                }}
                            >
                                <img
                                    src={popupCard.faces[popupFaceIndex]?.signedUrl || ''}
                                    alt={popupCard.name}
                                    className="w-full h-full object-contain rounded-xl"
                                    style={{ imageRendering: 'auto', display: 'block' }}
                                />
                            </div>
                            {popupCard.faces.length > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setPopupFaceIndex(0)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${popupFaceIndex === 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Front
                                    </button>
                                    <button
                                        onClick={() => setPopupFaceIndex(1)}
                                        className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${popupFaceIndex === 1 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
                                    >
                                        Back
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Card info */}
                        <div className="flex flex-col gap-4 flex-1 min-w-0 pt-1">
                            <div>
                                <h2 className="text-3xl font-bold text-foreground leading-tight">{popupCard.name}</h2>
                                <p className="text-base text-muted-foreground mt-1">{popupCard.faces[popupFaceIndex]?.typeLine || ''}</p>
                            </div>

                            <div className="flex items-center gap-1 flex-wrap">
                                {renderManaCost(popupCard.faces[popupFaceIndex]?.manaCost)}
                            </div>

                            {popupCard.faces[popupFaceIndex]?.oracleText && (
                                <div className="bg-secondary/60 rounded-lg p-4 border border-border/50">
                                    <p className="text-sm text-foreground/90 whitespace-pre-line leading-relaxed">
                                        {popupCard.faces[popupFaceIndex].oracleText}
                                    </p>
                                </div>
                            )}

                            {(popupCard.faces[popupFaceIndex]?.power || popupCard.faces[popupFaceIndex]?.toughness) && (
                                <div className="flex items-center gap-2 mt-auto">
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">P/T</span>
                                    <span className="bg-primary/10 border border-primary/30 text-primary font-bold px-3 py-1 rounded-full text-sm">
                                        {popupCard.faces[popupFaceIndex]?.power}/{popupCard.faces[popupFaceIndex]?.toughness}
                                    </span>
                                </div>
                            )}

                            {popupCard.faces[popupFaceIndex]?.loyalty && (
                                <div className="flex items-center gap-2 mt-auto">
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Loyalty</span>
                                    <span className="bg-primary/10 border border-primary/30 text-primary font-bold px-3 py-1 rounded-full text-sm">
                                        {popupCard.faces[popupFaceIndex].loyalty}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <main className="mx-auto px-4 py-6 w-full">
                <DeckHeader deck={deck} imageUrl={signedMainImage} />

                <div className="grid lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 mt-4 space-y-4">
                            {/* Card Display Box */}
                            <div className="bg-secondary border-0 rounded-lg shadow-lg p-4 text-center">
                                <div
                                    className="relative mx-auto w-full max-w-64 aspect-[5/7] rounded-lg overflow-hidden"
                                    style={{
                                        border: '3px solid #100c00',
                                        backgroundColor: '#100c00',
                                    }}
                                >
                                    <ImageFlip
                                        frontImage={currentCard?.faces[0].signedUrl || ''}
                                        backImage={currentCard?.faces[1]?.signedUrl || currentCard?.faces[0].signedUrl || ''}
                                        alt1={currentCard?.name || ''}
                                        alt2={currentCard?.name || ''}
                                        className="w-full h-full"
                                        duration="duration-700"
                                        isFlipped={isFlip}
                                    />
                                </div>
                                <div className="text-xl mt-4 font-bold">{currentCard?.name}</div>
                                <div className="text-muted-foreground">{currentCard?.faces?.[0]?.typeLine || ''}</div>
                                <div className="flex justify-center gap-2 mt-2">
                                    {currentCard ? renderManaCost(currentCard.faces[0].manaCost) : null}
                                </div>
                            </div>

                            {/* Purchase Section */}
                            <div className="bg-card border border-border rounded-lg p-4 shadow-md flex items-center justify-between gap-4">
                                <div className="flex flex-col">
                                    <span className="text-xs text-muted-foreground uppercase font-semibold">Total Price</span>
                                    <span className="font-bold text-2xl text-primary">€{deck.price}</span>
                                </div>
                                <Button
                                    size="lg"
                                    onClick={handleAddToCart}
                                    disabled={isAdding}
                                    className="flex-1 flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    {isAdding ? 'Adding...' : 'Add to Cart'}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                            {sections.map((section) => (
                                <div key={section.title} className="break-inside-avoid">
                                    <CardList
                                        title={section.title}
                                        cards={section.cards}
                                        onCardHover={handleCardHover}
                                        onCardLeave={handleCardLeave}
                                        onFaceChange={handleFaceChange}
                                        onCardClick={handleCardClick}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default DeckDetail;