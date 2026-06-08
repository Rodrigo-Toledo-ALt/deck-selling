// decks_remote.ts
// Gestiona operaciones relacionadas con mazos de Commander almacenados en Supabase.
// Incluye carga, filtrado, visibilidad, eliminación y generación de URLs firmadas para imágenes.

import { supabase } from '@/lib/supabase';

// ── TIPOS ───────────────────────────────────────────────────────────────

// Colores válidos para mazos Commander
export type DeckColor = 'W' | 'U' | 'B' | 'R' | 'G';

// Una cara de una carta (anverso/reverso)
export interface CardFace {
    name: string;        // Nombre de la carta en esta cara
    manaCost: string;    // Coste de maná (ej: "{2}{R}")
    image: string;       // URL de la imagen
    typeLine?: string;   // Tipo opcional (ej: "Instant")
}

// Carta en un mazo con cantidad y caras
export interface CardInfo {
    name: string;          // Nombre base de la carta
    quantity: number;      // Cantidad en el mazo
    faces: CardFace[];     // Caras (una o dos)
}

// Agrupa cartas por categoría
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
    tokens?: CardInfo[];   // Opcional
    others?: CardInfo[];   // Otros tipos
}

// Representa un mazo completo
export interface Deck {
    id: string;
    name: string;
    format: 'Commander'; // Solo Commander por ahora
    colors: DeckColor[]; // Colores del mazo
    description: string;
    main_image_path: string; // Ruta a imagen principal
    price: number;
    deckData: DeckData;
    author_name?: string | null;    // Opcional
    author_website?: string | null; // Opcional
    created_at?: string;            // Fecha de creación
    is_visible: boolean;            // Visible en tienda
}

// Fila raw de la tabla 'products'
type ProductRow = {
    id: string;
    name: string;
    description: string | null;
    price: number;
    deck_cards: any; // JSON
    main_image_path: string | null;
    colors: string | null;
    format: string | null;
    author_name: string | null;
    author_website: string | null;
    created_at: string | null;
    is_visible: boolean;
};

// ── FUNCIONES AUXILIARES ────────────────────────────────────────────────

/**
 * Parsea una cadena de colores ("WUBRG", "W, U, B", etc.) a un array tipado.
 * Retorna [] si la entrada es inválida.
 */
function parseColors(input: string | null | undefined): DeckColor[] {
    if (!input) return [];
    const s = input.trim();
    // Divide por comas, espacios o caracteres individuales
    const tokens = (s.includes(',') || s.includes(' ')) ? s.split(/[,\s]+/) : s.split('');
    return tokens
        .map((c) => c.trim().toUpperCase())
        .filter((c): c is DeckColor => ['W', 'U', 'B', 'R', 'G'].includes(c));
}

// Campos seleccionados en consultas a 'products'
const baseSelect = `
  id,
  name,
  description,
  price,
  deck_cards,
  main_image_path,
  colors,
  format,
  author_name,
  author_website,
  created_at,
  is_visible
`;

/**
 * Transforma una fila de 'products' en un objeto Deck.
 * Retorna null si el formato no es 'Commander'.
 */
function mapProductToDeck(row: ProductRow): Deck | null {
    if (!row.format || row.format !== 'Commander') return null;

    // Maneja el JSON de cartas con valores por defecto
    const d = row.deck_cards && typeof row.deck_cards === 'object' ? row.deck_cards : {};
    const deckData: DeckData = {
        commander: d.commander ?? [],
        creatures: d.creatures ?? [],
        sorceries: d.sorceries ?? [],
        instants: d.instants ?? [],
        artifacts: d.artifacts ?? [],
        enchantments: d.enchantments ?? [],
        lands: d.lands ?? [],
        planeswalkers: d.planeswalkers ?? [],
        sideboard: d.sideboard ?? [],
        tokens: d.tokens ?? [],
        others: d.others ?? [],
    };

    return {
        id: row.id,
        name: row.name,
        format: 'Commander',
        colors: parseColors(row.colors),
        description: row.description ?? '',
        main_image_path: row.main_image_path ?? '',
        price: Number(row.price),
        deckData,
        author_name: row.author_name,
        author_website: row.author_website,
        created_at: row.created_at ?? undefined,
        is_visible: !!row.is_visible,
    };
}

// ── FUNCIONES DE IMAGEN ─────────────────────────────────────────────────

/**
 * Genera una URL firmada para la imagen principal del mazo.
 * ttlSeconds: tiempo de validez en segundos (por defecto 1h).
 */
export async function getSignedMainImageUrl(deck: Deck, ttlSeconds = 3600): Promise<string> {
    if (!deck.main_image_path) return '';
    const { data, error } = await supabase.storage
        .from('main_deck_images')
        .createSignedUrl(deck.main_image_path, ttlSeconds);
    if (error) {
        console.error('createSignedUrl main image error:', error);
        return '';
    }
    return data?.signedUrl ?? '';
}

/**
 * Genera una URL firmada para una imagen de carta específica.
 * ttlSeconds: tiempo de validez en segundos (por defecto 1h).
 */
export async function getSignedCardImageUrl(path: string, ttlSeconds = 3600): Promise<string> {
    if (!path) return '';
    const { data, error } = await supabase.storage
        .from('deck_archives')
        .createSignedUrl(path, ttlSeconds);
    if (error) {
        console.error('createSignedUrl card image error:', error, 'path:', path);
        return '';
    }
    return data?.signedUrl ?? '';
}

// ── FUNCIONES CRUD ──────────────────────────────────────────────────────

/**
 * Obtiene todos los mazos visibles (o todos si includeInvisible=true).
 * Ordenados por fecha de creación descendente.
 */
export const getAllDecks = async (includeInvisible = false): Promise<Deck[]> => {
    let query = supabase
        .from('products')
        .select(baseSelect)
        .eq('format', 'Commander')
        .order('created_at', { ascending: false });

    if (!includeInvisible) {
        query = query.eq('is_visible', true);
    }

    const { data, error } = await query;

    if (error) {
        console.error('getAllDecks error:', error);
        return [];
    }
    // Filtra objetos nulos resultantes del mapeo
    return (data ?? []).map(mapProductToDeck).filter(Boolean) as Deck[];
};

/**
 * Obtiene hasta 6 mazos destacados (visibles y recientes).
 */
export const getFeaturedDecks = async (): Promise<Deck[]> => {
    const { data, error } = await supabase
        .from('products')
        .select(baseSelect)
        .eq('format', 'Commander')
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(6);

    if (error) {
        console.error('getFeaturedDecks error:', error);
        return [];
    }
    // Filtra objetos nulos resultantes del mapeo
    return (data ?? []).map(mapProductToDeck).filter(Boolean) as Deck[];
};

/**
 * Busca un mazo por ID (visible a menos que includeInvisible=true).
 */
export const getDeckById = async (id: string, includeInvisible = false): Promise<Deck | undefined> => {
    let query = supabase
        .from('products')
        .select(baseSelect)
        .eq('id', id);

    if (!includeInvisible) {
        query = query.eq('is_visible', true);
    }

    const { data, error } = await query.single();

    if (error) {
        console.error('getDeckById error:', error);
        return undefined;
    }
    const deck = data ? mapProductToDeck(data as ProductRow) : null;
    return deck ?? undefined;
};

/**
 * Cambia la visibilidad de un mazo en la tienda.
 */
export const setDeckVisibility = async (id: string, isVisible: boolean): Promise<void> => {
    const { error } = await supabase
        .from('products')
        .update({ is_visible: isVisible })
        .eq('id', id);

    if (error) {
        console.error('setDeckVisibility error:', error);
        throw error;
    }
};

/**
 * Elimina un mazo tras verificar que no tenga pedidos asociados.
 */
export async function deleteDeck(deckId: string): Promise<void> {
    // Verifica si hay pedidos asociados
    const { count, error: checkError } = await supabase
        .from('order_items')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', deckId);

    if (checkError) throw checkError;

    if ((count ?? 0) > 0) {
        throw new Error('Este mazo no puede eliminarse porque tiene pedidos asociados.');
    }

    // Elimina el mazo si pasa la verificación
    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deckId);

    if (error) throw error;
}