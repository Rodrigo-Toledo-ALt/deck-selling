import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import DeckCard from '@/components/Decks/DeckCard.tsx';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import 'mana-font/css/mana.css';
import { useNavigate } from 'react-router-dom';

// NUEVO: importar desde decks_remote
import { getAllDecks, getSignedMainImageUrl, Deck } from '@/data/decks_remote';

const archetypeOptions = ['All', 'Aggro', 'Control', 'Combo', 'Midrange', 'Tempo', 'Stax', 'Tribal'];
const colorOptions = ['Any', 'White', 'Blue', 'Black', 'Red', 'Green', 'Colorless'];

const colorMap: Record<string, string> = {
    White: 'W',
    Blue: 'U',
    Black: 'B',
    Red: 'R',
    Green: 'G',
};

const ColorIcon = ({ color, selected }: { color: string; selected: boolean }) => {
    const manaClasses: Record<string, string> = {
        White: 'ms ms-w ms-cost',
        Blue: 'ms ms-u ms-cost',
        Black: 'ms ms-b ms-cost',
        Red: 'ms ms-r ms-cost',
        Green: 'ms ms-g ms-cost',
        Colorless: 'ms ms-c ms-cost',
        Any: 'ms ms-infinity ms-cost',
    };

    return (
        <div className={`mana-icon-button ${selected ? 'active' : ''}`}>
            <i className={`${manaClasses[color]} text-3xl`} title={color} />
        </div>
    );
};

type DeckWithSigned = Deck & { imageUrl?: string; archetype?: string };

const Catalog = () => {
    const [archetype, setArchetype] = useState('All');
    const [selectedColors, setSelectedColors] = useState<string[]>(['Any']);
    const [originalDecks, setOriginalDecks] = useState<DeckWithSigned[]>([]);
    const [filteredDecks, setFilteredDecks] = useState<DeckWithSigned[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 1) Cargar decks desde Supabase y resolver portada firmada
    useEffect(() => {
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const decks = await getAllDecks(); // trae id, name, description, price, colors, format, main_image_path, deckData...
                // Resolver signed URL de portada
                const urls = await Promise.all(decks.map((d) => getSignedMainImageUrl(d, 3600)));
                const merged: DeckWithSigned[] = decks.map((d, i) => ({
                    ...d,
                    imageUrl: urls[i] || '',
                    // Si tenías antes archetype en tu Deck local, aquí puedes derivarlo o dejar "Commander"
                    archetype: 'Commander',
                }));
                if (!alive) return;
                setOriginalDecks(merged);
                setFilteredDecks(merged);
            } catch (e) {
                console.error('Catalog getAllDecks error:', e);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, []);

    // 2) Aplicar filtros y búsqueda sobre originalDecks
    useEffect(() => {
        let results = [...originalDecks];

        if (archetype !== 'All') {
            results = results.filter((deck) => deck.archetype === archetype);
        }

        if (!selectedColors.includes('Any')) {
            results = results.filter((deck) => {
                // Colorless
                if (selectedColors.includes('Colorless')) {
                    if (selectedColors.length === 1) {
                        return deck.colors.length === 0;
                    } else {
                        return false;
                    }
                }
                // Debe incluir todos los colores seleccionados
                const deckColors = deck.colors;
                return selectedColors.every((color) => {
                    const colorCode = colorMap[color];
                    return colorCode && deckColors.includes(colorCode as any);
                });
            });
        }

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            results = results.filter(
                (deck) =>
                    deck.name.toLowerCase().includes(query) ||
                    (deck.description || '').toLowerCase().includes(query)
            );
        }

        setFilteredDecks(results);
    }, [archetype, selectedColors, searchQuery, originalDecks]);

    const resetFilters = () => {
        setArchetype('All');
        setSelectedColors(['Any']);
        setSearchQuery('');
    };

    const handleColorClick = (color: string) => {
        if (color === 'Any') {
            setSelectedColors(['Any']);
            return;
        }

        if (selectedColors.includes('Any')) {
            setSelectedColors([color]);
            return;
        }

        if (selectedColors.includes(color)) {
            const newColors = selectedColors.filter((c) => c !== color);
            setSelectedColors(newColors.length === 0 ? ['Any'] : newColors);
        } else {
            setSelectedColors([...selectedColors, color]);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
                <section className="py-12 bg-secondary">
                    <div className="container mx-auto px-4">
                        <h1 className="text-4xl font-bold mb-4 text-gradient">Commander Decks</h1>
                        <p className="text-lg text-muted-foreground mb-6">
                            Browse our collection of premium Commander MTG proxy decks. All decks are €60 with free shipping.
                        </p>
                    </div>
                </section>

                <section className="py-12">
                    <div className="container mx-auto px-4">
                        <div className="mb-8">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="text-muted-foreground h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search decks..."
                                    className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="mb-8">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6">
                                {/* Color Filter - Left Side */}
                                <div className="w-full md:w-1/2">
                                    <h3 className="font-medium mb-3">Filter by Color</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {colorOptions.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => handleColorClick(color)}
                                                className="focus:outline-none"
                                                aria-label={`Filter by ${color}`}
                                            >
                                                <ColorIcon color={color} selected={selectedColors.includes(color)} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Archetype Filter - Right Side */}
                                <div className="w-full md:w-1/2">
                                    <h3 className="font-medium mb-3">Filter by Archetype</h3>
                                    <ToggleGroup
                                        type="single"
                                        value={archetype}
                                        onValueChange={(value) => {
                                            if (value) setArchetype(value);
                                        }}
                                        className="flex flex-wrap gap-2"
                                    >
                                        {archetypeOptions.map((option) => (
                                            <ToggleGroupItem
                                                key={option}
                                                value={option}
                                                variant={option === 'All' ? 'default' : 'outline'}
                                                className={option === archetype ? 'bg-primary text-white' : ''}
                                            >
                                                {option}
                                            </ToggleGroupItem>
                                        ))}
                                    </ToggleGroup>
                                </div>
                            </div>

                            {(!selectedColors.includes('Any') || archetype !== 'All' || searchQuery) && (
                                <div className="mt-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h3 className="font-medium">Active Filters:</h3>
                                        <button onClick={resetFilters} className="text-sm text-primary flex items-center gap-1 hover:underline">
                                            <X size={14} /> Clear All
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {!selectedColors.includes('Any') &&
                                            selectedColors.map((color) => (
                                                <Badge key={color} variant="secondary" className="flex items-center gap-1">
                                                    Color: {color}
                                                    <button onClick={() => handleColorClick(color)}>
                                                        <X size={14} className="ml-1" />
                                                    </button>
                                                </Badge>
                                            ))}
                                        {archetype !== 'All' && (
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                Archetype: {archetype}
                                                <button onClick={() => setArchetype('All')}>
                                                    <X size={14} className="ml-1" />
                                                </button>
                                            </Badge>
                                        )}
                                        {searchQuery && (
                                            <Badge variant="secondary" className="flex items-center gap-1">
                                                Search: {searchQuery}
                                                <button onClick={() => setSearchQuery('')}>
                                                    <X size={14} className="ml-1" />
                                                </button>
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {[...Array(6)].map((_, i) => (
                                    <div key={i} className="animate-pulse h-64 bg-muted rounded-xl" />
                                ))}
                            </div>
                        ) : filteredDecks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {filteredDecks.map((deck) => (
                                    <DeckCard
                                        key={deck.id}
                                        deck={deck}
                                        imageUrl={deck.imageUrl || ''}
                                        onClick={() => navigate(`/deck/${deck.id}`)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-xl text-muted-foreground">No decks found matching your criteria</p>
                                <Button className="mt-4" variant="outline" onClick={resetFilters}>
                                    Reset Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default Catalog;