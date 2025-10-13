import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DeckHeader from '@/components/DeckDetailCF/DeckHeader';
import CardList from '@/components/DeckDetailCF/CardList';
import ImageFlip from '@/components/ImageFlip';
import { renderManaCost } from '@/utils/methods';
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

    const [deck, setDeck] = useState<Deck | null>(null);
    const [signedMainImage, setSignedMainImage] = useState<string>('');
    const [deckDataSigned, setDeckDataSigned] = useState<DeckDataWithSigned | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentCard, setCurrentCard] = useState<CardInfoWithSigned | null>(null);
    const [isFlip, setIsFlip] = useState(false);

    useEffect(() => {
        let alive = true;
        (async () => {
            if (!id) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const d = await getDeckById(id);
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
        return () => {
            alive = false;
        };
    }, [id]);

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

            <main className="mx-auto px-4 py-6 w-full">
                <DeckHeader deck={deck} imageUrl={signedMainImage} />

                <div className="grid lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-secondary border-0 sticky top-20 mt-4 rounded-lg shadow-lg">
                            <div className="text-center p-4">
                                <div className="relative mx-auto w-full max-w-64 aspect-[5/7] rounded-lg overflow-hidden border-2 border-border shadow-lg">
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