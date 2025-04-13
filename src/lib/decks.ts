
export interface Card {
  name: string;
  quantity: number;
  imageUrl?: string;
}

export interface Deck {
  id: string;
  name: string;
  format: 'Standard' | 'Modern' | 'Commander' | 'Pioneer' | 'Legacy' | 'Pauper';
  colors: ('W' | 'U' | 'B' | 'R' | 'G')[];
  description: string;
  imageUrl: string;
  price: number;
  cards: Card[];
  featured?: boolean;
}

// Helper function to display colors as text
export const colorNames: Record<string, string> = {
  W: 'White',
  U: 'Blue',
  B: 'Black',
  R: 'Red',
  G: 'Green'
};

export const formatDeckColors = (colors: ('W' | 'U' | 'B' | 'R' | 'G')[]): string => {
  if (colors.length === 0) return 'Colorless';
  if (colors.length === 5) return 'Five Color';
  
  return colors.map(color => colorNames[color]).join('/');
};

// Sample deck data
export const decks: Deck[] = [
  {
    id: "burn-modern",
    name: "Modern Burn",
    format: "Modern",
    colors: ["R"],
    description: "A lightning-fast aggro deck that aims to deal 20 damage as quickly as possible using direct damage spells and aggressive creatures.",
    imageUrl: "https://images.unsplash.com/photo-1582066278208-7447bfc01a8c?q=80&w=900",
    price: 60,
    featured: true,
    cards: [
      { name: "Lightning Bolt", quantity: 4 },
      { name: "Goblin Guide", quantity: 4 },
      { name: "Monastery Swiftspear", quantity: 4 },
      { name: "Skewer the Critics", quantity: 4 },
      { name: "Lava Spike", quantity: 4 },
      { name: "Rift Bolt", quantity: 4 },
      { name: "Searing Blaze", quantity: 4 },
      { name: "Boros Charm", quantity: 4 },
      { name: "Mountain", quantity: 20 },
      { name: "Sacred Foundry", quantity: 4 },
      { name: "Inspiring Vantage", quantity: 4 }
    ]
  },
  {
    id: "dimir-control",
    name: "Dimir Control",
    format: "Standard",
    colors: ["U", "B"],
    description: "A controlling deck that uses counterspells, removal, and card draw to establish dominance in the late game.",
    imageUrl: "https://images.unsplash.com/photo-1614332287897-cdc485fa562d?q=80&w=900",
    price: 60,
    featured: true,
    cards: [
      { name: "Counterspell", quantity: 4 },
      { name: "Fatal Push", quantity: 4 },
      { name: "Thoughtseize", quantity: 4 },
      { name: "Drown in the Loch", quantity: 4 },
      { name: "Consider", quantity: 4 },
      { name: "Memory Deluge", quantity: 3 },
      { name: "Jace, the Mind Sculptor", quantity: 2 },
      { name: "Watery Grave", quantity: 4 },
      { name: "Drowned Catacomb", quantity: 4 },
      { name: "Island", quantity: 14 },
      { name: "Swamp", quantity: 13 }
    ]
  },
  {
    id: "tron",
    name: "Mono-Green Tron",
    format: "Modern",
    colors: ["G"],
    description: "A deck focused on assembling the three Urza lands to quickly deploy powerful colorless threats.",
    imageUrl: "https://images.unsplash.com/photo-1608333963714-b196fe5f44e7?q=80&w=900",
    price: 60,
    featured: true,
    cards: [
      { name: "Urza's Mine", quantity: 4 },
      { name: "Urza's Power Plant", quantity: 4 },
      { name: "Urza's Tower", quantity: 4 },
      { name: "Karn Liberated", quantity: 4 },
      { name: "Wurmcoil Engine", quantity: 3 },
      { name: "Ulamog, the Ceaseless Hunger", quantity: 2 },
      { name: "Ancient Stirrings", quantity: 4 },
      { name: "Sylvan Scrying", quantity: 4 },
      { name: "Expedition Map", quantity: 4 },
      { name: "Chromatic Sphere", quantity: 4 },
      { name: "Chromatic Star", quantity: 4 },
      { name: "Oblivion Stone", quantity: 3 },
      { name: "Forest", quantity: 8 },
      { name: "Sanctum of Ugin", quantity: 2 },
      { name: "Blast Zone", quantity: 2 },
      { name: "Walking Ballista", quantity: 4 }
    ]
  },
  {
    id: "azorius-control",
    name: "Azorius Control",
    format: "Modern",
    colors: ["W", "U"],
    description: "A control deck that uses counterspells, board wipes, and planeswalkers to gain card advantage and win in the late game.",
    imageUrl: "https://images.unsplash.com/photo-1677528778563-ee1ad8be2668?q=80&w=900",
    price: 60,
    cards: [
      { name: "Counterspell", quantity: 4 },
      { name: "Supreme Verdict", quantity: 4 },
      { name: "Teferi, Time Raveler", quantity: 3 },
      { name: "Jace, the Mind Sculptor", quantity: 2 },
      { name: "Solitude", quantity: 4 },
      { name: "Snapcaster Mage", quantity: 3 },
      { name: "Path to Exile", quantity: 4 },
      { name: "Archmage's Charm", quantity: 4 },
      { name: "Opt", quantity: 4 },
      { name: "Hallowed Fountain", quantity: 4 },
      { name: "Flooded Strand", quantity: 4 },
      { name: "Glacial Fortress", quantity: 4 },
      { name: "Island", quantity: 8 },
      { name: "Plains", quantity: 8 }
    ]
  },
  {
    id: "golgari-midrange",
    name: "Golgari Midrange",
    format: "Pioneer",
    colors: ["B", "G"],
    description: "A midrange deck that uses efficient creatures and removal to grind out value and overwhelm the opponent.",
    imageUrl: "https://images.unsplash.com/photo-1605979399824-ea4afff241d8?q=80&w=900",
    price: 60,
    cards: [
      { name: "Tarmogoyf", quantity: 4 },
      { name: "Dark Confidant", quantity: 4 },
      { name: "Liliana of the Veil", quantity: 3 },
      { name: "Thoughtseize", quantity: 4 },
      { name: "Inquisition of Kozilek", quantity: 3 },
      { name: "Fatal Push", quantity: 4 },
      { name: "Abrupt Decay", quantity: 3 },
      { name: "Assassin's Trophy", quantity: 2 },
      { name: "Verdant Catacombs", quantity: 4 },
      { name: "Overgrown Tomb", quantity: 4 },
      { name: "Woodland Cemetery", quantity: 4 },
      { name: "Swamp", quantity: 10 },
      { name: "Forest", quantity: 11 }
    ]
  },
  {
    id: "jeskai-control",
    name: "Jeskai Control",
    format: "Modern",
    colors: ["W", "U", "R"],
    description: "A control deck that uses the power of three colors to control the game with counterspells, removal, and powerful planeswalkers.",
    imageUrl: "https://images.unsplash.com/photo-1589998059171-988d887df646?q=80&w=900",
    price: 60,
    cards: [
      { name: "Lightning Bolt", quantity: 4 },
      { name: "Path to Exile", quantity: 4 },
      { name: "Counterspell", quantity: 4 },
      { name: "Lightning Helix", quantity: 4 },
      { name: "Snapcaster Mage", quantity: 4 },
      { name: "Teferi, Time Raveler", quantity: 3 },
      { name: "Jace, the Mind Sculptor", quantity: 2 },
      { name: "Supreme Verdict", quantity: 3 },
      { name: "Scalding Tarn", quantity: 4 },
      { name: "Flooded Strand", quantity: 4 },
      { name: "Steam Vents", quantity: 2 },
      { name: "Sacred Foundry", quantity: 2 },
      { name: "Hallowed Fountain", quantity: 2 },
      { name: "Island", quantity: 6 },
      { name: "Plains", quantity: 6 },
      { name: "Mountain", quantity: 6 }
    ]
  }
];

// Helper function to get featured decks
export const getFeaturedDecks = (): Deck[] => {
  return decks.filter(deck => deck.featured);
};

// Helper function to get a deck by ID
export const getDeckById = (id: string): Deck | undefined => {
  return decks.find(deck => deck.id === id);
};

// Helper function to get decks by format
export const getDecksByFormat = (format: string): Deck[] => {
  if (format === "All") return decks;
  return decks.filter(deck => deck.format === format);
};
