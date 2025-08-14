// Adapter para convertir datos de la base de datos al formato esperado por DeckDetailCF

interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  deck_cards: any; // JSON field
  main_image_url: string;
  colors: string[];
  format: string;
}

interface CardItem {
  name: string;
  quantity: number;
  manaCost: string;
  image: string;
}

interface DeckData {
  commander: CardItem[];
  planeswalkers: CardItem[];
  creatures: CardItem[];
  sorceries: CardItem[];
  instants: CardItem[];
  artifacts: CardItem[];
  lands: CardItem[];
  sideboard: CardItem[];
}

// Mapeo de colores MTG para mantener las clases Tailwind específicas
export const MTG_COLOR_CLASSES = {
  mtg: {
    blue: 'hsl(220, 91%, 56%)',
    white: 'hsl(0, 0%, 98%)',
    black: 'hsl(0, 0%, 9%)',
    red: 'hsl(0, 84%, 60%)',
    green: 'hsl(142, 71%, 45%)',
    colorless: 'hsl(0, 0%, 45%)'
  },
  price: {
    buy: 'hsl(142, 71%, 45%)',
    sell: 'hsl(0, 84%, 60%)'
  }
};

// Función para generar imagen placeholder basada en el tipo de carta
const getCardImagePlaceholder = (cardType: string, cardName: string): string => {
  const imageMap: { [key: string]: string } = {
    commander: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&crop=center",
    planeswalkers: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=500&fit=crop",
    creatures: "https://images.unsplash.com/photo-1509664158689-81d72e68e710?w=400&h=500&fit=crop",
    sorceries: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=500&fit=crop",
    instants: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=500&fit=crop",
    artifacts: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=400&h=500&fit=crop",
    lands: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=500&fit=crop",
    sideboard: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=500&fit=crop"
  };
  
  return imageMap[cardType] || imageMap.creatures;
};

// Función principal para adaptar datos de la base de datos
export const adaptDatabaseToDeckData = (product: DatabaseProduct): DeckData => {
  // Si deck_cards es null o undefined, retornar estructura vacía
  if (!product.deck_cards) {
    return {
      commander: [],
      planeswalkers: [],
      creatures: [],
      sorceries: [],
      instants: [],
      artifacts: [],
      lands: [],
      sideboard: []
    };
  }

  // Parsear el JSON si es string
  let deckCards;
  try {
    deckCards = typeof product.deck_cards === 'string' 
      ? JSON.parse(product.deck_cards) 
      : product.deck_cards;
  } catch (error) {
    console.error('Error parsing deck_cards JSON:', error);
    return {
      commander: [],
      planeswalkers: [],
      creatures: [],
      sorceries: [],
      instants: [],
      artifacts: [],
      lands: [],
      sideboard: []
    };
  }

  // Función helper para convertir array de cartas
  const convertCardArray = (cards: any[], cardType: string): CardItem[] => {
    if (!Array.isArray(cards)) return [];
    
    return cards.map(card => ({
      name: card.name || 'Unknown Card',
      quantity: card.quantity || 1,
      manaCost: card.manaCost || card.mana_cost || '',
      image: card.image || getCardImagePlaceholder(cardType, card.name)
    }));
  };

  return {
    commander: convertCardArray(deckCards.commander || [], 'commander'),
    planeswalkers: convertCardArray(deckCards.planeswalkers || [], 'planeswalkers'),
    creatures: convertCardArray(deckCards.creatures || [], 'creatures'),
    sorceries: convertCardArray(deckCards.sorceries || [], 'sorceries'),
    instants: convertCardArray(deckCards.instants || [], 'instants'),
    artifacts: convertCardArray(deckCards.artifacts || [], 'artifacts'),
    lands: convertCardArray(deckCards.lands || [], 'lands'),
    sideboard: convertCardArray(deckCards.sideboard || [], 'sideboard')
  };
};

// Función para obtener la imagen del comandante (primera carta del deck)
export const getCommanderImage = (deckData: DeckData): string => {
  if (deckData.commander.length > 0) {
    return deckData.commander[0].image;
  }
  
  // Fallback a la primera carta disponible
  const allCards = [
    ...deckData.planeswalkers,
    ...deckData.creatures,
    ...deckData.sorceries,
    ...deckData.instants,
    ...deckData.artifacts
  ];
  
  return allCards.length > 0 
    ? allCards[0].image 
    : getCardImagePlaceholder('commander', 'Default');
};

// Función para calcular el total de cartas
export const getTotalCardCount = (deckData: DeckData): number => {
  const categories = [
    deckData.commander,
    deckData.planeswalkers,
    deckData.creatures,
    deckData.sorceries,
    deckData.instants,
    deckData.artifacts,
    deckData.lands
  ];
  
  return categories.reduce((total, category) => {
    return total + category.reduce((categoryTotal, card) => categoryTotal + card.quantity, 0);
  }, 0);
};