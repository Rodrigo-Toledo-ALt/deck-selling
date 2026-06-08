// deckData.ts
// Tipos e interfaces para representar cartas, mazos y funciones auxiliares.
// Incluye datos de muestra para mostrar en la aplicación.

// ── TIPOS ───────────────────────────────────────────────────────────────

// Representa una cara de una carta (anverso o reverso)
export interface CardFace {
    name: string;        // Nombre de la carta en esta cara
    manaCost: string;    // Coste de maná (formato textual, ej: "{1}{U}{U}")
    image: string;       // URL de la imagen de esta cara
}

// Representa una carta en un mazo, incluyendo cantidad y posibles caras múltiples
export interface CardInfo {
    name: string;          // Nombre base de la carta (normalmente el de la primera cara)
    quantity: number;      // Número de copias en el mazo
    faces: CardFace[];     // Lista de caras (al menos una; dos para cartas dobles cara)
}

// Agrupa cartas por tipo para facilitar su visualización
export interface DeckData {
    commander: CardInfo[];
    creatures: CardInfo[];
    sorceries: CardInfo[];
    instants: CardInfo[];
    artifacts: CardInfo[];
    enchantments: CardInfo[];
    lands: CardInfo[];
    planeswalkers: CardInfo[];
    sideboard: CardInfo[];
}

// Representa un mazo completo con metadatos y contenido
export interface Deck {
    id: string;
    name: string;
    format: 'Commander'; // Único formato soportado
    archetype?: 'Aggro' | 'Control' | 'Combo' | 'Midrange' | 'Tempo' | 'Stax' | 'Tribal';
    colors: ('W' | 'U' | 'B' | 'R' | 'G')[]; // Colores del mazo
    description: string;
    imageUrl: string; // Imagen principal del mazo
    price: number;
    deckData: DeckData;
    featured?: boolean; // Indica si aparece en sección "Destacados"
}

// ── FUNCIONES AUXILIARES ────────────────────────────────────────────────

// Mapa de nombres de colores para mostrar en UI
export const colorNames: Record<string, string> = {
    W: 'White',
    U: 'Blue',
    B: 'Black',
    R: 'Red',
    G: 'Green'
};

/**
 * Convierte un array de colores en una cadena legible.
 * Ej: ['G', 'W'] → "Green/White"
 */
export const formatDeckColors = (colors: ('W' | 'U' | 'B' | 'R' | 'G')[]): string => {
    if (colors.length === 0) return 'Colorless';
    if (colors.length === 5) return 'Five Color';

    return colors.map(color => colorNames[color]).join('/');
};

// ── DATOS DE EJEMPLO ────────────────────────────────────────────────────

// Mazos de ejemplo para mostrar en la aplicación
export const decks: Deck[] = [
    // ... (contenido de los mazos)
];

/**
 * Filtra mazos marcados como "featured".
 */
export const getFeaturedDecks = (): Deck[] => {
    return decks.filter(deck => deck.featured);
};

/**
 * Busca un mazo por su ID.
 */
export const getDeckById = (id: string): Deck | undefined => {
    return decks.find(deck => deck.id === id);
};

/**
 * Filtra mazos por arquetipo. Si es "All", devuelve todos.
 */
export const getDecksByArchetype = (archetype: string): Deck[] => {
    if (archetype === "All") return decks;
    return decks.filter(deck => deck.archetype === archetype);
};