import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { decks } from '@/data/decks.ts';
import Navbar from '@/components/Navbar.tsx';
import Footer from '@/components/Footer.tsx';
import DeckHeader from '@/components/DeckDetailCF/DeckHeader.tsx';
import CardList from '@/components/DeckDetailCF/CardList.tsx';
import ImageFlip from '@/components/ImageFlip.tsx';
import { renderManaCost } from '@/utils/methods.tsx';

const DeckDetail = () => {
    const { id } = useParams();
    const deck = decks.find(d => d.id === id);

    if (!deck) return <div className="p-8 text-center text-xl">Deck not found</div>;

    // Estado para la carta actual y el flip
    const [currentCard, setCurrentCard] = useState(deck.deckData.commander[0]);
    const [isFlip, setIsFlip] = useState(false);

    const handleCardHover = (card) => {
        setCurrentCard({ ...card, faces: [card.faces[0]] });
    };

    const handleCardLeave = () => {
        setCurrentCard(deck.deckData.commander[0]);
    };

    const handleFaceChange = (card, activeFaceIndex) => {
        const activeFace = card.faces[activeFaceIndex];
        if (currentCard.name === card.name && currentCard.faces[0] !== activeFace) {
            setIsFlip((v) => !v);
            setTimeout(() => {
                setCurrentCard({ ...card, faces: [activeFace] });
            }, 250);
        } else {
            setCurrentCard({ ...card, faces: [activeFace] });
        }
    };

    return (
        <div className="min-h-screen bg-background/95 text-foreground">
            <Navbar />

            <main className="mx-auto px-4 py-6 w-full">
                <DeckHeader deck={deck} />

                <div className="grid lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-secondary border-0 sticky top-20 mt-4 rounded-lg shadow-lg">
                            <div className="text-center p-4">
                                <div className="relative mx-auto w-full max-w-64 aspect-[5/7] rounded-lg overflow-hidden border-2 border-border shadow-lg">
                                    <ImageFlip
                                        frontImage={currentCard.faces[0].image}
                                        backImage={currentCard.faces[1]?.image || currentCard.faces[0].image}
                                        alt1={currentCard.name}
                                        alt2={currentCard.name}
                                        className="w-full h-full"
                                        duration="duration-700"
                                        isFlipped={isFlip}
                                    />
                                </div>
                                <div className="text-xl mt-4 font-bold">{currentCard.name}</div>
                                <div className="text-muted-foreground">Legendary Creature — Human Wizard</div>
                                <div className="flex justify-center gap-2 mt-2">
                                    {renderManaCost(currentCard.faces[0].manaCost)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
                            {[
                                { title: "Commander", cards: deck.deckData.commander },
                                { title: "Planeswalkers", cards: deck.deckData.planeswalkers },
                                { title: "Creatures", cards: deck.deckData.creatures },
                                { title: "Sorceries", cards: deck.deckData.sorceries },
                                { title: "Instants", cards: deck.deckData.instants },
                                { title: "Artifacts", cards: deck.deckData.artifacts },
                                { title: "Lands", cards: deck.deckData.lands },
                                { title: "Sideboard", cards: deck.deckData.sideboard },
                            ]
                                .filter((section) => section.cards && section.cards.length > 0)
                                .map((section) => (
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