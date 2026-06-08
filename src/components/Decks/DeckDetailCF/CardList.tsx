// Importaciones necesarias de React y otros módulos
import React, { useState } from "react";
// Componentes de UI y datos
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { CardInfo } from "@/data/deckData.ts";
import { renderManaCost } from "@/utils/mana.tsx";
// Icono para cambiar de cara
import { GiReturnArrow } from "react-icons/gi";

// Definición de las propiedades que recibe el componente CardList
interface CardListProps {
    title: string; // Título de la lista de cartas
    cards: CardInfo[]; // Array de cartas a mostrar
    onCardHover: (card: CardInfo) => void; // Función que se ejecuta al pasar el ratón sobre una carta
    onCardLeave: () => void; // Función que se ejecuta al quitar el ratón de una carta
    onFaceChange?: (card: CardInfo, activeFaceIndex: number) => void; // Función opcional para cambiar la cara de una carta
    onCardClick?: (card: CardInfo) => void; // Función opcional que se ejecuta al hacer clic en una carta
}

// Componente CardList que muestra una lista de cartas
const CardList = ({ title, cards, onCardHover, onCardLeave, onFaceChange, onCardClick }: CardListProps) => {
    // Estado para controlar qué cara de cada carta está activa
    const [activeFaces, setActiveFaces] = useState<{ [cardIndex: number]: number }>({});

    // Función para alternar entre las caras de una carta
    const toggleFace = (cardIndex: number, facesCount: number) => {
        setActiveFaces((prev) => {
            // Obtiene la cara actual o la primera si no existe
            const currentFace = prev[cardIndex] ?? 0;
            // Calcula la siguiente cara (cíclicamente)
            const nextFace = (currentFace + 1) % facesCount;
            // Llama a la función onFaceChange si está definida
            onFaceChange?.(cards[cardIndex], nextFace);
            // Actualiza el estado con la nueva cara activa
            return { ...prev, [cardIndex]: nextFace };
        });
    };

    return (
        // Contenedor principal del componente
        <Card className="bg-card border-border -mb-4 break-inside-avoid border-0 bg-transparent">
            {/* Encabezado con el título y el número de cartas */}
            <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-foreground">
                    {title} ({cards.length})
                </CardTitle>
            </CardHeader>
            {/* Contenido con la lista de cartas */}
            <CardContent className="pt-0">
                <div className="space-y-1">
                    {/* Mapeo de las cartas para mostrar cada una */}
                    {cards.map((card, index) => {
                        // Obtiene la cara activa de la carta actual
                        const activeFaceIndex = activeFaces[index] ?? 0;
                        const face = card.faces[activeFaceIndex];

                        return (
                            // Contenedor de cada carta
                            <div
                                key={index}
                                className="flex items-center justify-between py-1 px-2 rounded text-sm hover:bg-accent cursor-pointer transition-colors border-t"
                                // Eventos de ratón
                                onMouseEnter={() => {
                                    onCardHover(card);
                                    onFaceChange?.(card, activeFaceIndex);
                                }}
                                onMouseLeave={onCardLeave}
                                onClick={() => onCardClick?.(card)}
                            >
                                {/* Información de la carta (cantidad y nombre) */}
                                <div className="flex items-center gap-2 flex-1">
                                    <span className="text-muted-foreground w-4">{card.quantity}</span>
                                    <span className="text-foreground hover:text-primary transition-colors">
                                        {card.name}
                                    </span>
                                </div>
                                {/* Coste de maná y botón de cambio de cara si es necesario */}
                                <div className="flex items-center gap-1">
                                    {renderManaCost(face.manaCost)}
                                    {card.faces.length > 1 && (
                                        // Botón para cambiar de cara
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Evita que el clic se propague al contenedor
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