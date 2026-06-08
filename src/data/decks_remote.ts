// src/data/decks_remote.ts
import { supabase } from '@/lib/supabase';

export type DeckColor = 'W' | 'U' | 'B' | 'R' | 'G';

export interface CardFace {
    name: string;
    manaCost: string;
    image: string;
    typeLine?: string;
}

export interface CardInfo {
    name: string;
    quantity: number;
    faces: CardFace[];
}

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
    tokens?: CardInfo[];
    others?: CardInfo[];
}

export interface Deck {
    id: string;
    name: string;
    format: 'Commander';
    colors: DeckColor[];
    description: string;
    main_image_path: string;
    price: number;
    deckData: DeckData;
    author_name?: string | null;
    author_website?: string | null;
    created_at?: string;
    is_visible: boolean;
}

type ProductRow = {
    id: string;
    name: string;
    description: string | null;
    price: number;
    deck_cards: any;
    main_image_path: string | null;
    colors: string | null;
    format: string | null;
    author_name: string | null;
    author_website: string | null;
    created_at: string | null;
    is_visible: boolean;
};

function parseColors(input: string | null | undefined): DeckColor[] {
    if (!input) return [];
    const s = input.trim();
    const tokens = (s.includes(',') || s.includes(' ')) ? s.split(/[,\s]+/) : s.split('');
    return tokens
        .map((c) => c.trim().toUpperCase())
        .filter((c): c is DeckColor => ['W', 'U', 'B', 'R', 'G'].includes(c));
}

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

function mapProductToDeck(row: ProductRow): Deck | null {
    if (!row.format || row.format !== 'Commander') return null;

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
    return (data ?? []).map(mapProductToDeck).filter(Boolean) as Deck[];
};

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
    return (data ?? []).map(mapProductToDeck).filter(Boolean) as Deck[];
};

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

export async function deleteDeck(deckId: string): Promise<void> {
    const { count, error: checkError } = await supabase
        .from('order_items')
        .select('id', { count: 'exact', head: true })
        .eq('product_id', deckId);

    if (checkError) throw checkError;

    if ((count ?? 0) > 0) {
        throw new Error('Este mazo no puede eliminarse porque tiene pedidos asociados.');
    }

    const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', deckId);

    if (error) throw error;
}