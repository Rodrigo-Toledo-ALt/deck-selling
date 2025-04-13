
export interface Card {
  name: string;
  quantity: number;
  imageUrl?: string;
}

export interface Deck {
  id: string;
  name: string;
  format: 'Commander'; // Only Commander format now
  archetype?: 'Aggro' | 'Control' | 'Combo' | 'Midrange' | 'Tempo' | 'Stax' | 'Tribal'; // New archetype field
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

// Updated sample deck data with Commander format and archetypes
export const decks: Deck[] = [
  {
    id: "burn-modern",
    name: "Purphoros Dragon Tribal",
    format: "Commander",
    archetype: "Tribal",
    colors: ["R"],
    description: "A lightning-fast tribal dragon deck that aims to deal massive damage using Purphoros and dragon synergies.",
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
    name: "Scarab God Zombies",
    format: "Commander",
    archetype: "Control",
    colors: ["U", "B"],
    description: "A controlling deck that uses The Scarab God to reanimate zombies while controlling the board with counterspells and removal.",
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
    name: "Omnath Landfall",
    format: "Commander",
    archetype: "Combo",
    colors: ["G", "U", "R", "W"],
    description: "A landfall-focused deck with Omnath, Locus of Creation that generates tremendous value from playing lands.",
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
    name: "Brago Blink",
    format: "Commander",
    archetype: "Control",
    colors: ["W", "U"],
    description: "A control deck that uses Brago, King Eternal to blink permanents for value while controlling the game with counterspells and board wipes.",
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
    name: "Meren Reanimator",
    format: "Commander",
    archetype: "Midrange",
    colors: ["B", "G"],
    description: "A midrange reanimator deck with Meren of Clan Nel Toth that uses the graveyard as a resource to grind out value.",
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
    name: "Kykar Spellslinger",
    format: "Commander",
    archetype: "Combo",
    colors: ["W", "U", "R"],
    description: "A spellslinger deck with Kykar, Wind's Fury that creates spirit tokens when you cast noncreature spells, enabling powerful combos.",
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

// Helper function to get decks by archetype
export const getDecksByArchetype = (archetype: string): Deck[] => {
  if (archetype === "All") return decks;
  return decks.filter(deck => deck.archetype === archetype);
};
