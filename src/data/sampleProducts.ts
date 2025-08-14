// Sample products data adapted to database structure
// This replaces the old deck data from the first repository

export interface DatabaseProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  deck_cards: any; // JSON field containing deck structure
  main_image_url: string;
  colors: string[];
  format: string;
}

export const sampleProducts: DatabaseProduct[] = [
  {
    id: "1",
    name: "Ethereal Mystic Commander Deck",
    description: "A powerful blue-white commander deck focused on control and card advantage. Perfect for competitive play with premium cards and synergistic gameplay.",
    price: 299.99,
    main_image_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&crop=center",
    colors: ["U", "W"],
    format: "Commander",
    deck_cards: {
      commander: [
        { name: "Ethereal Mystic", quantity: 1, manaCost: "3UU", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=500&fit=crop&crop=center" }
      ],
      planeswalkers: [
        { name: "Jace, Mind Sculptor", quantity: 1, manaCost: "2UU", image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=500&fit=crop" },
        { name: "Teferi, Time Raveler", quantity: 1, manaCost: "1WU", image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=500&fit=crop" }
      ],
      creatures: [
        { name: "Snapcaster Mage", quantity: 1, manaCost: "1U", image: "https://images.unsplash.com/photo-1509664158689-81d72e68e710?w=400&h=500&fit=crop" },
        { name: "Vendilion Clique", quantity: 1, manaCost: "1UU", image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=500&fit=crop" },
        { name: "Mulldrifter", quantity: 1, manaCost: "4U", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop" },
        { name: "Mystic Sage", quantity: 1, manaCost: "2U", image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=500&fit=crop" }
      ],
      sorceries: [
        { name: "Time Walk", quantity: 1, manaCost: "1U", image: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=500&fit=crop" },
        { name: "Ancestral Recall", quantity: 1, manaCost: "U", image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=500&fit=crop" },
        { name: "Demonic Tutor", quantity: 1, manaCost: "1B", image: "https://images.unsplash.com/photo-1540979388789-6cee28a1cdc9?w=400&h=500&fit=crop" }
      ],
      instants: [
        { name: "Counterspell", quantity: 1, manaCost: "UU", image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=500&fit=crop" },
        { name: "Lightning Bolt", quantity: 1, manaCost: "R", image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=400&h=500&fit=crop" },
        { name: "Mystical Tutor", quantity: 1, manaCost: "U", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop" }
      ],
      artifacts: [
        { name: "Sol Ring", quantity: 1, manaCost: "1", image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=400&h=500&fit=crop" },
        { name: "Mana Crypt", quantity: 1, manaCost: "0", image: "https://images.unsplash.com/photo-1577740715276-c838b3beb23b?w=400&h=500&fit=crop" }
      ],
      lands: [
        { name: "Island", quantity: 15, manaCost: "", image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=500&fit=crop" },
        { name: "Tundra", quantity: 1, manaCost: "", image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=500&fit=crop" },
        { name: "Underground Sea", quantity: 1, manaCost: "", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=500&fit=crop" }
      ],
      sideboard: [
        { name: "Rest in Peace", quantity: 1, manaCost: "1W", image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=500&fit=crop" },
        { name: "Pyroblast", quantity: 1, manaCost: "R", image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=400&h=500&fit=crop" }
      ]
    }
  },
  {
    id: "2",
    name: "Dragon's Fury Aggro Deck",
    description: "An aggressive red deck focused on fast damage and powerful dragons. Burn your opponents quickly with this explosive strategy.",
    price: 189.99,
    main_image_url: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=400&h=500&fit=crop",
    colors: ["R"],
    format: "Standard",
    deck_cards: {
      commander: [],
      planeswalkers: [
        { name: "Chandra, Torch of Defiance", quantity: 2, manaCost: "2RR", image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=500&fit=crop" }
      ],
      creatures: [
        { name: "Lightning Phoenix", quantity: 4, manaCost: "2R", image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=400&h=500&fit=crop" },
        { name: "Ember Dragon", quantity: 3, manaCost: "4RR", image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=500&fit=crop" },
        { name: "Goblin Guide", quantity: 4, manaCost: "R", image: "https://images.unsplash.com/photo-1509664158689-81d72e68e710?w=400&h=500&fit=crop" }
      ],
      sorceries: [
        { name: "Lava Spike", quantity: 4, manaCost: "R", image: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=500&fit=crop" }
      ],
      instants: [
        { name: "Lightning Bolt", quantity: 4, manaCost: "R", image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=400&h=500&fit=crop" },
        { name: "Shock", quantity: 4, manaCost: "R", image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=500&fit=crop" }
      ],
      artifacts: [
        { name: "Sol Ring", quantity: 1, manaCost: "1", image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=400&h=500&fit=crop" }
      ],
      lands: [
        { name: "Mountain", quantity: 20, manaCost: "", image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=500&fit=crop" }
      ],
      sideboard: [
        { name: "Pyroblast", quantity: 3, manaCost: "R", image: "https://images.unsplash.com/photo-1507146426996-ef05306b995a?w=400&h=500&fit=crop" }
      ]
    }
  },
  {
    id: "3",
    name: "Nature's Harmony Green Ramp",
    description: "A green ramp deck that accelerates into powerful creatures and game-ending spells. Harness the power of nature to overwhelm your opponents.",
    price: 249.99,
    main_image_url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=500&fit=crop",
    colors: ["G"],
    format: "Modern",
    deck_cards: {
      commander: [],
      planeswalkers: [
        { name: "Garruk, Primal Hunter", quantity: 2, manaCost: "2GGG", image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=500&fit=crop" }
      ],
      creatures: [
        { name: "Llanowar Elves", quantity: 4, manaCost: "G", image: "https://images.unsplash.com/photo-1509664158689-81d72e68e710?w=400&h=500&fit=crop" },
        { name: "Primeval Titan", quantity: 3, manaCost: "4GG", image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=500&fit=crop" },
        { name: "Tarmogoyf", quantity: 4, manaCost: "1G", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop" }
      ],
      sorceries: [
        { name: "Rampant Growth", quantity: 4, manaCost: "1G", image: "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=400&h=500&fit=crop" },
        { name: "Cultivate", quantity: 3, manaCost: "2G", image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=500&fit=crop" }
      ],
      instants: [
        { name: "Giant Growth", quantity: 4, manaCost: "G", image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=500&fit=crop" }
      ],
      artifacts: [
        { name: "Sol Ring", quantity: 1, manaCost: "1", image: "https://images.unsplash.com/photo-1614027164847-1b28cfe1df60?w=400&h=500&fit=crop" }
      ],
      lands: [
        { name: "Forest", quantity: 18, manaCost: "", image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=500&fit=crop" }
      ],
      sideboard: [
        { name: "Nature's Claim", quantity: 3, manaCost: "G", image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=500&fit=crop" }
      ]
    }
  }
];

// Helper function to get product by ID (simulating database query)
export const getProductById = (id: string): DatabaseProduct | undefined => {
  return sampleProducts.find(product => product.id === id);
};