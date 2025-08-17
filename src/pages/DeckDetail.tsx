import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import CardList from "@/components/CardList";
import { renderManaCost } from "@/lib/methods";

import { deckData } from "@/lib/deckData";
import Navbar from "@/components/Navbar.tsx";
import Footer from "@/components/Footer.tsx";
import DeckHeader from "@/components/DeckDetailCF/DeckHeader.tsx";

const Index = () => {
    const [currentCard, setCurrentCard] = useState(deckData.commander[0]);

    const commanderImage = deckData.commander[0].image;

    // Sample deck data

    const sections = [ // Define the sections of the deck for filter the tags to appear in the UI
        { title: "Commander", cards: deckData.commander },
        { title: "Planeswalkers", cards: deckData.planeswalkers },
        { title: "Creatures", cards: deckData.creatures },
        { title: "Sorceries", cards: deckData.sorceries },
        { title: "Instants", cards: deckData.instants },
        { title: "Artifacts", cards: deckData.artifacts },
        { title: "Lands", cards: deckData.lands },
        { title: "Sideboard", cards: deckData.sideboard },
    ];

    const handleCardHover = (card) => {
        setCurrentCard(card);
    };

    const handleCardLeave = () => {
        setCurrentCard(deckData.commander[0]);
    };

    return (
        <div className="min-h-screen  bg-background/95 text-foreground">

            <Navbar />
            {/* Main Content */}
            <main className=" mx-auto px-4 py-6 w-full">

                {/* Component shaded with a gradient background with commander photo */}

               <DeckHeader>

               </DeckHeader>


                <div className="grid lg:grid-cols-4 gap-6 ">
                    {/* Left Column - Card Display */}
                    <div className="lg:col-span-1">
                        <Card className="bg-secondary border-0 sticky top-20 mt-4">
                            <CardHeader className="text-center">
                                <div
                                    className="relative mx-auto w-full max-w-64 aspect-[5/7] rounded-lg overflow-hidden border-2 border-border shadow-lg">
                                    <img
                                        src={currentCard.image}
                                        alt={currentCard.name}
                                        className="w-full h-full object-cover transition-all duration-300"
                                    />
                                </div>
                                <CardTitle className="text-xl mt-4">{currentCard.name}</CardTitle>
                                <CardDescription>
                                    {/* Aquí podrías mostrar el tipo si lo tienes, o un placeholder */}
                                    Legendary Creature — Human Wizard
                                </CardDescription>
                                <div className="flex justify-center gap-2 mt-2">
                                    {renderManaCost(currentCard.manaCost)}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Buy Price:</span>
                                        <span className="text-price-buy font-bold">$24.99</span>
                                    </div>
                                    <div className="flex justify-center mt-4">
                                        <Button size="sm" className="bg-price-buy hover:bg-price-buy/90 w-32">
                                            Buy
                                        </Button>

                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Columns - Card Lists */}
                    <div className="lg:col-span-3">
                        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 ">
                            {[
                                {title: "Commander", cards: deckData.commander},
                                {title: "Planeswalkers", cards: deckData.planeswalkers},
                                {title: "Creatures", cards: deckData.creatures},
                                {title: "Sorceries", cards: deckData.sorceries},
                                {title: "Instants", cards: deckData.instants},
                                {title: "Artifacts", cards: deckData.artifacts},
                                {title: "Lands", cards: deckData.lands},
                                {title: "Sideboard", cards: deckData.sideboard},
                            ]
                                .filter(section => section.cards && section.cards.length > 0)
                                .map(section => (
                                    <div key={section.title} className=" break-inside-avoid">
                                        <CardList
                                            title={section.title}
                                            cards={section.cards}
                                            onCardHover={handleCardHover}
                                            onCardLeave={handleCardLeave}
                                        />
                                    </div>
                                ))}
                        </div>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );
};

export default Index;
