import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CardInfo } from "@/data/deckData.ts";
import { renderManaCost } from "@/utils/methods.tsx";
import { GiReturnArrow } from "react-icons/gi";
    

interface CardListProps {
    title: string;
    cards: CardInfo[];
    onCardHover: (card: CardInfo) => void;
    onCardLeave: () => void;
    onFaceChange?: (card: CardInfo, activeFaceIndex: number) => void; // nuevo
}

const CardList = ({ title, cards, onCardHover, onCardLeave, onFaceChange }: CardListProps) => {
    const [activeFaces, setActiveFaces] = useState<{ [cardIndex: number]: number }>({});

    const toggleFace = (cardIndex: number, facesCount: number) => {
        setActiveFaces((prev) => {
            const currentFace = prev[cardIndex] ?? 0;
            const nextFace = (currentFace + 1) % facesCount;
            // Notificar al padre qué carta y cuál cara quedó activa
            onFaceChange?.(cards[cardIndex], nextFace);
            return { ...prev, [cardIndex]: nextFace };
        });
    };

    return (
        <Card className="bg-card border-border -mb-4 break-inside-avoid border-0 bg-transparent">
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">
                    {title} ({cards.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="space-y-1">
                    {cards.map((card, index) => {
                        const activeFaceIndex = activeFaces[index] ?? 0;
                        const face = card.faces[activeFaceIndex];

                        return (
                            <div
                                key={index}
                                className="flex items-center justify-between py-1 px-2 rounded text-sm hover:bg-accent cursor-pointer transition-colors border-t"
                                onMouseEnter={() => {
                                    onCardHover(card);
                                    // Alinear cara activa en el padre mientras se hace hover
                                    onFaceChange?.(card, activeFaceIndex);
                                }}
                                onMouseLeave={onCardLeave}
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    <span className="text-muted-foreground w-4">{card.quantity}</span>
                                    <span className="text-foreground hover:text-primary transition-colors">
                    {card.name}
                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                    {renderManaCost(face.manaCost)}
                                    {card.faces.length > 1 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFace(index, card.faces.length);
                                            }}
                                            className="ml-2 px-2 py-0.5 text-xs rounded bg-gray-700 hover:bg-gray-600 text-white flex items-center justify-center"
                                            aria-label="Cambiar cara"
                                        >
                                            <GiReturnArrow size={18} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

export default CardList;