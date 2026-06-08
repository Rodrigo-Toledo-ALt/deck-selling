// src/components/DeckCard.tsx
// Tarjeta resumen de un mazo (deck): muestra imagen, nombre, colores, precio y permite añadir al carrito.
// Usado en vistas de catálogo o búsqueda.

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
// Utilidades y tipos compartidos
import { Deck, formatDeckColors } from '@/data/decks.ts';
// Componentes UI
import { Button } from '@/components/ui/button.tsx';
import { ShoppingCart } from 'lucide-react';
// Manejo de sesión
import { useAuth } from '@/supabase/AuthProvider';
// Funciones de carrito (remoto y local)
import { addToCart } from '@/data/cart_remote';
import { addToLocalCart } from '@/data/local_cart';
// Notificaciones
import { useToast } from '@/components/ui/use-toast';

interface DeckCardProps {
    deck: Deck;           // Datos del mazo
    imageUrl?: string;    // Imagen alternativa (ej: preview en tiempo real)
}

const DeckCard: React.FC<DeckCardProps> = ({ deck, imageUrl }) => {
    const { user } = useAuth();     // Usuario logueado o null
    const { toast } = useToast();   // Sistema de notificaciones
    const [isAdding, setIsAdding] = useState(false); // Estado para evitar doble-click

    // Añade el mazo al carrito (remoto o local según login)
    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();   // Evita navegar al hacer clic en "Add"
        e.stopPropagation();  // Impide abrir el detalle del deck

        setIsAdding(true);
        try {
            if (user) {
                // Usuario autenticado: guarda en Supabase
                await addToCart(deck.id, 1);
            } else {
                // Sin login: guarda en localStorage
                addToLocalCart(
                    deck.id,
                    deck.name,
                    deck.price,
                    imageUrl || deck.imageUrl || null,
                    1
                );
            }

            // Notificamos cambios al resto de la app (carrito badge, etc.)
            window.dispatchEvent(new Event('cartUpdated'));

            // Feedback visual positivo
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

    return (
        // Enlace al detalle del mazo
        <Link to={`/deck/${deck.id}`} className="block">
            <div className="bg-card rounded-lg overflow-hidden card-hover border border-border">
                {/* Imagen destacada con gradiente para mejorar contraste del texto */}
                <div className="relative h-48 overflow-hidden">
                    <img
                        src={imageUrl || deck.imageUrl || ''}
                        alt={deck.name}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end">
                        <div className="p-4">
                            <h3 className="text-white text-xl font-bold">{deck.name}</h3>
                            <p className="text-white/80 text-sm mt-1">
                                {formatDeckColors(deck.colors)} • {deck.archetype || 'Commander'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Información adicional y acciones */}
                <div className="p-4">
                    {/* Descripción limitada a 2 líneas */}
                    <p className="text-sm text-muted-foreground line-clamp-2">{deck.description}</p>

                    <div className="mt-4 flex justify-between items-center gap-2">
                        {/* Precio del mazo */}
                        <span className="font-bold text-lg">€{deck.price}</span>

                        <div className="flex gap-2">
                            {/* Botón para añadir al carrito */}
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleAddToCart}
                                disabled={isAdding}
                                className="flex items-center gap-1"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                {isAdding ? '...' : 'Add'}
                            </Button>

                            {/* Botón para ver detalles */}
                            <Button size="sm" variant="default">
                                View
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default DeckCard;