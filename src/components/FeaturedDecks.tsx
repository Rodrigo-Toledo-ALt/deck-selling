// FeaturedDecks.tsx
// Sección de la página principal que carga y muestra mazos destacados.
// - Obtiene los mazos desde el backend y pide URLs firmadas para la imagen principal.
// - Muestra skeletons mientras carga y un mensaje si no hay mazos.
// Autor: (tu nombre) — Nota: explicar en el TFG por qué usamos URLs firmadas (seguridad/expiración).

import React from 'react';
import { Link } from 'react-router-dom';
import DeckCard from './Decks/DeckCard.tsx';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { getFeaturedDecks, getSignedMainImageUrl, Deck } from '@/data/decks_remote';

// Extiende el tipo Deck para incluir la URL firmada opcional
type DeckWithSigned = Deck & { signedMainImageUrl?: string };

const FeaturedDecks: React.FC = () => {
    // Estado con los mazos ya enriquecidos con la URL firmada
    const [featuredDecks, setFeaturedDecks] = React.useState<DeckWithSigned[]>([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        // "mounted" evita actualizar el estado tras desmontar el componente.
        // En el TFG puedes comentar que esto previene warnings cuando la petición llega tarde.
        // Alternativa: usar AbortController o un hook de fetch que maneje cancelación.
        let mounted = true;

        (async () => {
            try {
                // 1) Obtener la lista de mazos destacados
                const decks = await getFeaturedDecks();

                // 2) Pedir URLs firmadas en paralelo (misma orden que 'decks')
                //    El segundo parámetro (3600) es TTL en segundos para la firma.
                const signed = await Promise.all(decks.map(d => getSignedMainImageUrl(d, 3600)));

                // 3) Fusionar datos originales con las URLs firmadas
                const merged = decks.map((d, i) => ({ ...d, signedMainImageUrl: signed[i] }));

                // 4) Solo actualizamos estado si el componente sigue montado
                if (mounted) setFeaturedDecks(merged);
            } catch (e) {
                // Log para depuración; en producción podrías mostrar un toast o UI de error
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
                {/* Cabecera de la sección + enlace al catálogo completo */}
                <div className="flex justify-between items-center mb-12">
                    <h2 className="text-3xl font-bold text-gradient">Featured Decks</h2>
                    <Link to="/catalog">
                        <Button variant="outline" className="flex items-center gap-2">
                            <span>View All Decks</span>
                            <ArrowRight size={16} />
                        </Button>
                    </Link>
                </div>

                {/*
                  Estados de la UI:
                  - loading: skeletons (placeholders)
                  - sin resultados: mensaje centrado
                  - con datos: grid de DeckCard
                */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Skeletons para mantener layout durante la carga */}
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
                            // Pasamos la URL firmada (si existe) como imageUrl.
                            // DeckCard usa fallback a deck.imageUrl si signedMainImageUrl está vacío.
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