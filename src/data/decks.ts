
export interface CardFace {
    name: string;
    manaCost: string;
    image: string;
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
  deckData: DeckData;
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
        id: "1",
        name: "Black Panther +1/+1 Counters (GW)",
        format: "Commander",
        archetype: "Midrange",
        colors: ["G", "W"],
        description: "Mazo Commander centrado en contadores +1/+1 con Black Panther como comandante. Curva eficiente, sinergias con proliferar y generación de fichas.",
        imageUrl: "https://cards.scryfall.io/normal/front/3/a/3a93a12d-6913-4d9e-8e9c-8067147e37f2.jpg?1730758329",
        price: 49.99,
        featured: true,
        deckData: {
            commander: [
                {
                    name: "Black Panther, Wakandan King",
                    quantity: 1,
                    faces: [
                        {
                            name: "Black Panther, Wakandan King",
                            manaCost: "{G}{W}",
                            image: "https://cards.scryfall.io/normal/front/3/a/3a93a12d-6913-4d9e-8e9c-8067147e37f2.jpg?1730758329"
                        }
                    ]
                },
                {
                    name: "Swords to Plowshares",
                    quantity: 1,
                    faces: [
                        {
                            name: "Swords to Plowshares",
                            manaCost: "{W}",
                            image: "https://cards.scryfall.io/normal/front/0/e/0e7ff4dc-af63-4342-9a44-d059e62bd14c.jpg?1752944384"
                        }
                    ]
                },
                {
                    name: "Teferi's Protection",
                    quantity: 1,
                    faces: [
                        {
                            name: "Teferi's Protection",
                            manaCost: "{2}{W}",
                            image: "https://cards.scryfall.io/normal/front/4/8/483fa1cb-1e35-44f2-a143-98c0f107f5ca.jpg?1745319936"
                        }
                    ]
                },
                {
                    name: "Temple Garden",
                    quantity: 1,
                    faces: [
                        {
                            name: "Temple Garden",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/1/8/18d2e383-d380-4d18-8aad-bd8ea093a16c.jpg?1702429828"
                        }
                    ]
                },
                {
                    name: "The Great Henge",
                    quantity: 1,
                    faces: [
                        {
                            name: "The Great Henge",
                            manaCost: "{7}{G}{G}",
                            image: "https://cards.scryfall.io/normal/front/6/3/6340e0f3-7f9c-4d71-8daf-e1be5505eb5b.jpg?1689998574"
                        }
                    ]
                },
                {
                    name: "The Ozolith",
                    quantity: 1,
                    faces: [
                        {
                            name: "The Ozolith",
                            manaCost: "{1}",
                            image: "https://cards.scryfall.io/normal/front/9/3/9341ed06-53db-4604-b60a-3ea9129afbc2.jpg?1591228544"
                        }
                    ]
                },
                {
                    name: "Tifa Lockhart",
                    quantity: 1,
                    faces: [
                        {
                            name: "Tifa Lockhart",
                            manaCost: "{1}{G}",
                            image: "https://cards.scryfall.io/normal/front/f/b/fb781323-2746-405d-a9b2-e778c037a6e9.jpg?1748706535"
                        }
                    ]
                },
                {
                    name: "Toph, the Blind Bandit",
                    quantity: 1,
                    faces: [
                        {
                            name: "Toph, the Blind Bandit",
                            manaCost: "{2}{G}",
                            image: "https://cards.scryfall.io/normal/front/f/f/ff68fa7b-8065-407b-a8b4-bfbb14f1c99c.jpg?1755210285"
                        }
                    ]
                },
                {
                    name: "Toski, Bearer of Secrets",
                    quantity: 1,
                    faces: [
                        {
                            name: "Toski, Bearer of Secrets",
                            manaCost: "{3}{G}",
                            image: "https://cards.scryfall.io/normal/front/e/8/e82e61d1-488d-4627-a54c-d8496a967814.jpg?1706240948"
                        }
                    ]
                },
                {
                    name: "Tribute to the World Tree",
                    quantity: 1,
                    faces: [
                        {
                            name: "Tribute to the World Tree",
                            manaCost: "{G}{G}{G}",
                            image: "https://cards.scryfall.io/normal/front/c/0/c0cdeaba-fc21-44e6-bf99-aa1ff379401b.jpg?1682205102"
                        }
                    ]
                },
                {
                    name: "Windswept Heath",
                    quantity: 1,
                    faces: [
                        {
                            name: "Windswept Heath",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/b/d/bd1d13f7-fd38-4f0b-a8e0-1eac78668117.jpg?1717013102"
                        }
                    ]
                }
            ],
            creatures: [
                {
                    name: "Abzan Falconer",
                    quantity: 1,
                    faces: [
                        {
                            name: "Abzan Falconer",
                            manaCost: "{2}{W}",
                            image: "https://cards.scryfall.io/normal/front/f/7/f7e2b0e1-c9ea-4f91-b19e-73b1bd6a0884.jpg?1682208232"
                        }
                    ]
                },
                {
                    name: "Adeline, Resplendent Cathar",
                    quantity: 1,
                    faces: [
                        {
                            name: "Adeline, Resplendent Cathar",
                            manaCost: "{1}{W}{W}",
                            image: "https://cards.scryfall.io/normal/front/1/d/1de30c12-2011-495a-be25-f7a46b23e142.jpg?1743206101"
                        }
                    ]
                },
                {
                    name: "Ashaya, Soul of the Wild",
                    quantity: 1,
                    faces: [
                        {
                            name: "Ashaya, Soul of the Wild",
                            manaCost: "{3}{G}{G}",
                            image: "https://cards.scryfall.io/normal/front/0/a/0a74b4e6-f6c9-4fef-a83c-a285a541e720.jpg?1726284976"
                        }
                    ]
                },
                {
                    name: "Avacyn's Pilgrim",
                    quantity: 1,
                    faces: [
                        {
                            name: "Avacyn's Pilgrim",
                            manaCost: "{G}",
                            image: "https://cards.scryfall.io/normal/front/a/3/a390a7df-b8da-41aa-93e5-2c0db938a27e.jpg?1637630879"
                        }
                    ]
                },
                {
                    name: "Beast Whisperer",
                    quantity: 1,
                    faces: [
                        {
                            name: "Beast Whisperer",
                            manaCost: "{2}{G}{G}",
                            image: "https://cards.scryfall.io/normal/front/d/a/daf4bcd2-3ae4-4803-9ea1-3bcc3de5ca59.jpg?1706240020"
                        }
                    ]
                },
                {
                    name: "Birds of Paradise",
                    quantity: 1,
                    faces: [
                        {
                            name: "Birds of Paradise",
                            manaCost: "{G}",
                            image: "https://cards.scryfall.io/normal/front/3/d/3d69a3e0-6a2e-475a-964e-0affed1c017d.jpg?1722384747"
                        }
                    ]
                },
                {
                    name: "Bristly Bill, Spine Sower",
                    quantity: 1,
                    faces: [
                        {
                            name: "Bristly Bill, Spine Sower",
                            manaCost: "{1}{G}",
                            image: "https://cards.scryfall.io/normal/front/5/2/52eef0d6-24b7-40b7-8403-e8e863d0cd55.jpg?1712355894"
                        }
                    ]
                },
                {
                    name: "Bumi, Eclectic Earthbender",
                    quantity: 1,
                    faces: [
                        {
                            name: "Bumi, Eclectic Earthbender",
                            manaCost: "{3}{G}{G}",
                            image: "https://cards.scryfall.io/normal/front/f/3/f324a384-7380-4f6e-bbba-fac1f2a01b5d.jpg?1755177878"
                        }
                    ]
                },
                {
                    name: "Champion of Lambholt",
                    quantity: 1,
                    faces: [
                        {
                            name: "Champion of Lambholt",
                            manaCost: "{1}{G}{G}",
                            image: "https://cards.scryfall.io/normal/front/4/6/46eff31d-f460-48f2-aab7-8b9b89cd87fe.jpg?1682209453"
                        }
                    ]
                },
                {
                    name: "Conclave Mentor",
                    quantity: 1,
                    faces: [
                        {
                            name: "Conclave Mentor",
                            manaCost: "{G}{W}",
                            image: "https://cards.scryfall.io/normal/front/c/6/c6d36786-6e36-4a9b-97ad-ad7d9d2b8d92.jpg?1682209691"
                        }
                    ]
                },
                {
                    name: "Enduring Vitality",
                    quantity: 1,
                    faces: [
                        {
                            name: "Enduring Vitality",
                            manaCost: "{1}{G}{G}",
                            image: "https://cards.scryfall.io/normal/front/9/d/9d76a30c-0431-4334-892a-9822dda9671a.jpg?1726286517"
                        }
                    ]
                },
                {
                    name: "Evolution Sage",
                    quantity: 1,
                    faces: [
                        {
                            name: "Evolution Sage",
                            manaCost: "{2}{G}",
                            image: "https://cards.scryfall.io/normal/front/d/0/d089c2c1-e304-4f28-8700-5b9b3029bdbc.jpg?1698988362"
                        }
                    ]
                },
                {
                    name: "Evolution Witness",
                    quantity: 1,
                    faces: [
                        {
                            name: "Evolution Witness",
                            manaCost: "{2}{G}",
                            image: "https://cards.scryfall.io/normal/front/4/d/4d89283e-9783-4006-9294-4ae0473d2ce6.jpg?1717012437"
                        }
                    ]
                },
                {
                    name: "Forgotten Ancient",
                    quantity: 1,
                    faces: [
                        {
                            name: "Forgotten Ancient",
                            manaCost: "{3}{G}",
                            image: "https://cards.scryfall.io/normal/front/9/0/90fc94d9-b8af-4de8-a42d-ae508f8f1cd5.jpg?1682209488"
                        }
                    ]
                },
                {
                    name: "Kami of Whispered Hopes",
                    quantity: 1,
                    faces: [
                        {
                            name: "Kami of Whispered Hopes",
                            manaCost: "{2}{G}",
                            image: "https://cards.scryfall.io/normal/front/5/c/5c644650-3861-4a78-9e39-a413b073ddac.jpg?1682204938"
                        }
                    ]
                },
                {
                    name: "Kodama of the West Tree",
                    quantity: 1,
                    faces: [
                        {
                            name: "Kodama of the West Tree",
                            manaCost: "{2}{G}",
                            image: "https://cards.scryfall.io/normal/front/e/f/ef1e1dff-b559-441d-8df3-b6a418066aca.jpg?1654568238"
                        }
                    ]
                },
                {
                    name: "Kutzil, Malamet Exemplar",
                    quantity: 1,
                    faces: [
                        {
                            name: "Kutzil, Malamet Exemplar",
                            manaCost: "{1}{G}{W}",
                            image: "https://cards.scryfall.io/normal/front/c/9/c9f88a40-a6ed-4c1f-a309-011aca1acddd.jpg?1699044549"
                        }
                    ]
                },
                {
                    name: "Metastatic Evangel",
                    quantity: 1,
                    faces: [
                        {
                            name: "Metastatic Evangel",
                            manaCost: "{1}{W}",
                            image: "https://cards.scryfall.io/normal/front/7/7/774e115a-c0dc-4901-9a1f-87754304e378.jpg?1719655228"
                        }
                    ]
                },
                {
                    name: "Mossborn Hydra",
                    quantity: 1,
                    faces: [
                        {
                            name: "Mossborn Hydra",
                            manaCost: "{2}{G}",
                            image: "https://cards.scryfall.io/normal/front/7/0/7054a0d7-396f-40b4-ab24-db591c3b08f0.jpg?1730488992"
                        }
                    ]
                },
                {
                    name: "Reluctant Role Model",
                    quantity: 1,
                    faces: [
                        {
                            name: "Reluctant Role Model",
                            manaCost: "{1}{W}",
                            image: "https://cards.scryfall.io/normal/front/4/d/4dde86d6-34a0-4b3b-a46a-d9941501d08c.jpg?1726285956"
                        }
                    ]
                },
                {
                    name: "Scute Swarm",
                    quantity: 1,
                    faces: [
                        {
                            name: "Scute Swarm",
                            manaCost: "{2}{G}",
                            image: "https://cards.scryfall.io/normal/front/e/a/ea630ba1-22f9-4a10-bdc6-0d03128214f4.jpg?1726285123"
                        }
                    ]
                },
                {
                    name: "Sovereign Okinec Ahau",
                    quantity: 1,
                    faces: [
                        {
                            name: "Sovereign Okinec Ahau",
                            manaCost: "{2}{G}{W}",
                            image: "https://cards.scryfall.io/normal/front/7/0/70c75aa7-e2f9-4a69-8086-c982019ca714.jpg?1699044573"
                        }
                    ]
                }
            ],
            sorceries: [
                {
                    name: "Awaken the Woods",
                    quantity: 1,
                    faces: [
                        {
                            name: "Awaken the Woods",
                            manaCost: "{X}{G}{G}",
                            image: "https://cards.scryfall.io/normal/front/1/c/1c95f8b8-faba-4412-8d8f-093e2ec903f0.jpg?1674421417"
                        }
                    ]
                },
                {
                    name: "Cultivate",
                    quantity: 1,
                    faces: [
                        {
                            name: "Cultivate",
                            manaCost: "{2}{G}",
                            image: "https://cards.scryfall.io/normal/front/7/e/7ee610ee-7711-4a6b-b441-d6c73e6ef2b4.jpg?1752944789"
                        }
                    ]
                },
                {
                    name: "Earthbending Lesson",
                    quantity: 1,
                    faces: [
                        {
                            name: "Earthbending Lesson",
                            manaCost: "{3}{G}",
                            image: "https://cards.scryfall.io/normal/front/e/c/eccd63b3-3a3a-4661-9d6e-fb8152429bdb.jpg?1755040271"
                        }
                    ]
                },
                {
                    name: "Farewell",
                    quantity: 1,
                    faces: [
                        {
                            name: "Farewell",
                            manaCost: "{4}{W}{W}",
                            image: "https://cards.scryfall.io/normal/front/1/1/114d2180-093b-4838-97ad-badbc8ee50b0.jpg?1706240579"
                        }
                    ]
                },
                {
                    name: "Farseek",
                    quantity: 1,
                    faces: [
                        {
                            name: "Farseek",
                            manaCost: "{1}{G}",
                            image: "https://cards.scryfall.io/normal/front/9/5/95e0760a-d285-493b-88cd-7556d9b10007.jpg?1752944423"
                        }
                    ]
                },
                {
                    name: "Rampant Growth",
                    quantity: 1,
                    faces: [
                        {
                            name: "Rampant Growth",
                            manaCost: "{1}{G}",
                            image: "https://cards.scryfall.io/normal/front/b/7/b7c47024-5e08-4b17-b41a-7647f8b814b9.jpg?1743206981"
                        }
                    ]
                }
            ],
            instants: [
                {
                    name: "Heroic Intervention",
                    quantity: 1,
                    faces: [
                        {
                            name: "Heroic Intervention",
                            manaCost: "{1}{G}",
                            image: "https://cards.scryfall.io/normal/front/e/3/e32c67d1-187f-40df-b3b3-6036f5c92834.jpg?1689998584"
                        }
                    ]
                },
                {
                    name: "Inspiring Call",
                    quantity: 1,
                    faces: [
                        {
                            name: "Inspiring Call",
                            manaCost: "{2}{G}",
                            image: "https://cards.scryfall.io/normal/front/3/e/3e241642-5172-4437-b694-f6aa159d5cd9.jpg?1730489440"
                        }
                    ]
                },
                {
                    name: "March of the Multitudes",
                    quantity: 1,
                    faces: [
                        {
                            name: "March of the Multitudes",
                            manaCost: "{X}{G}{W}{W}",
                            image: "https://cards.scryfall.io/normal/front/6/5/65c7067d-61ec-4558-b0d4-0048d2d86743.jpg?1673485130"
                        }
                    ]
                },
                {
                    name: "Path to Exile",
                    quantity: 1,
                    faces: [
                        {
                            name: "Path to Exile",
                            manaCost: "{W}",
                            image: "https://cards.scryfall.io/normal/front/a/7/a7aed564-2d2d-42c4-bf11-812bc1a0284c.jpg?1712354092"
                        }
                    ]
                },
                {
                    name: "Secure the Wastes",
                    quantity: 1,
                    faces: [
                        {
                            name: "Secure the Wastes",
                            manaCost: "{X}{W}",
                            image: "https://cards.scryfall.io/normal/front/b/c/bca35012-ecfa-475f-b405-d3143ce99eef.jpg?1682208579"
                        }
                    ]
                }
            ],
            artifacts: [
                {
                    name: "Arcane Signet",
                    quantity: 1,
                    faces: [
                        {
                            name: "Arcane Signet",
                            manaCost: "{2}",
                            image: "https://cards.scryfall.io/normal/front/3/d/3d994115-378d-4685-a5dc-e448831da434.jpg?1755356098"
                        }
                    ]
                },
                {
                    name: "Ozolith, the Shattered Spire",
                    quantity: 1,
                    faces: [
                        {
                            name: "Ozolith, the Shattered Spire",
                            manaCost: "{1}{G}",
                            image: "https://cards.scryfall.io/normal/front/c/9/c9eee658-29e8-4ab5-8a0e-31f2f28a9a92.jpg?1682204958"
                        }
                    ]
                },
                {
                    name: "Swiftfoot Boots",
                    quantity: 1,
                    faces: [
                        {
                            name: "Swiftfoot Boots",
                            manaCost: "{2}",
                            image: "https://cards.scryfall.io/normal/front/1/9/1969b151-3192-4d35-80ca-c4e180601ec8.jpg?1743207367"
                        }
                    ]
                }
            ],
            enchantments: [
                {
                    name: "Branching Evolution",
                    quantity: 1,
                    faces: [
                        {
                            name: "Branching Evolution",
                            manaCost: "{2}{G}",
                            image: "https://cards.scryfall.io/normal/front/c/0/c0f1a736-8b12-4f58-a031-bf1733f65c51.jpg?1717013706"
                        }
                    ]
                },
                {
                    name: "Cathars' Crusade",
                    quantity: 1,
                    faces: [
                        {
                            name: "Cathars' Crusade",
                            manaCost: "{3}{W}{W}",
                            image: "https://cards.scryfall.io/normal/front/5/2/5296e353-2efc-4d72-a877-7957eff630b9.jpg?1736467489"
                        }
                    ]
                },
                {
                    name: "Doubling Season",
                    quantity: 1,
                    faces: [
                        {
                            name: "Doubling Season",
                            manaCost: "{4}{G}",
                            image: "https://cards.scryfall.io/normal/front/f/2/f2c4f80e-84a0-463b-82c3-5c6503809351.jpg?1730489400"
                        }
                    ]
                },
                {
                    name: "Felidar Retreat",
                    quantity: 1,
                    faces: [
                        {
                            name: "Felidar Retreat",
                            manaCost: "{3}{W}",
                            image: "https://cards.scryfall.io/normal/front/8/9/89e3cc09-5057-4c05-88fc-d6cda809fc74.jpg?1730490783"
                        }
                    ]
                },
                {
                    name: "Hardened Scales",
                    quantity: 1,
                    faces: [
                        {
                            name: "Hardened Scales",
                            manaCost: "{G}",
                            image: "https://cards.scryfall.io/normal/front/f/c/fc69ad56-9ae2-4eb5-b7e2-558524f6cbcc.jpg?1698988369"
                        }
                    ]
                },
                {
                    name: "Innkeeper's Talent",
                    quantity: 1,
                    faces: [
                        {
                            name: "Innkeeper's Talent",
                            manaCost: "{1}{G}",
                            image: "https://cards.scryfall.io/normal/front/9/4/941b0afc-0e8f-45f2-ae7f-07595e164611.jpg?1721814343"
                        }
                    ]
                },
                {
                    name: "Primal Vigor",
                    quantity: 1,
                    faces: [
                        {
                            name: "Primal Vigor",
                            manaCost: "{4}{G}",
                            image: "https://cards.scryfall.io/normal/front/d/a/dafea0d1-6986-46b3-affc-1337ef564947.jpg?1562941253"
                        }
                    ]
                }
            ],
            lands: [
                {
                    name: "Blinkmoth Nexus",
                    quantity: 1,
                    faces: [
                        {
                            name: "Blinkmoth Nexus",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/3/a/3ac535c1-9ef3-45b5-8959-7e79589d47ad.jpg?1599710351"
                        }
                    ]
                },
                {
                    name: "Brushland",
                    quantity: 1,
                    faces: [
                        {
                            name: "Brushland",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/1/8/18d236ce-3b78-403a-b5f9-4fb44123d85b.jpg?1674422171"
                        }
                    ]
                },
                {
                    name: "Canopy Vista",
                    quantity: 1,
                    faces: [
                        {
                            name: "Canopy Vista",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/c/2/c2a85a8e-28bb-4899-a922-13a03dec844c.jpg?1743207450"
                        }
                    ]
                },
                {
                    name: "Command Tower",
                    quantity: 1,
                    faces: [
                        {
                            name: "Command Tower",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/8/5/85eb4b03-305b-45a4-82e5-5fcd586cc744.jpg?1755356081"
                        }
                    ]
                },
                {
                    name: "Forest",
                    quantity: 10,
                    faces: [
                        {
                            name: "Forest",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/a/3/a305e44f-4253-4754-b83f-1e34103d77b0.jpg?1755290142"
                        }
                    ]
                },
                {
                    name: "Fortified Village",
                    quantity: 1,
                    faces: [
                        {
                            name: "Fortified Village",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/4/a/4a0aeb3a-923a-4b97-9d27-ea7e0b57de75.jpg?1743207579"
                        }
                    ]
                },
                {
                    name: "Hushwood Verge",
                    quantity: 1,
                    faces: [
                        {
                            name: "Hushwood Verge",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/e/c/ec288d76-c1f5-471b-8a53-504f88469c1b.jpg?1726286848"
                        }
                    ]
                },
                {
                    name: "Inkmoth Nexus",
                    quantity: 1,
                    faces: [
                        {
                            name: "Inkmoth Nexus",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/e/c/ec50c1c3-885e-47d3-ada7-cc0edbf09df1.jpg?1623098818"
                        }
                    ]
                },
                {
                    name: "Karn's Bastion",
                    quantity: 1,
                    faces: [
                        {
                            name: "Karn's Bastion",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/2/2/22017ec2-3552-4865-af76-dba042b141f5.jpg?1752945351"
                        }
                    ]
                },
                {
                    name: "Lair of the Hydra",
                    quantity: 1,
                    faces: [
                        {
                            name: "Lair of the Hydra",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/b/6/b670bb0f-680f-4036-bdb6-ac73e866a398.jpg?1627710336"
                        }
                    ]
                },
                {
                    name: "Overgrown Farmland",
                    quantity: 1,
                    faces: [
                        {
                            name: "Overgrown Farmland",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/6/4/644fb0ed-f434-4cc4-b7e9-a60db5ece2b7.jpg?1743207666"
                        }
                    ]
                },
                {
                    name: "Plains",
                    quantity: 5,
                    faces: [
                        {
                            name: "Plains",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/4/0/4069fb4a-8ee1-41ef-ab93-39a8cc58e0e5.jpg?1755290075"
                        }
                    ]
                },
                {
                    name: "Restless Prairie",
                    quantity: 1,
                    faces: [
                        {
                            name: "Restless Prairie",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/f/9/f94ef116-6aff-4f53-a7f9-be5e21c7afa4.jpg?1699044700"
                        }
                    ]
                },
                {
                    name: "Stirring Wildwood",
                    quantity: 1,
                    faces: [
                        {
                            name: "Stirring Wildwood",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/2/2/22f40dfc-a35d-4094-9805-0de8b7f61cb0.jpg?1547518772"
                        }
                    ]
                },
                {
                    name: "Sunpetal Grove",
                    quantity: 1,
                    faces: [
                        {
                            name: "Sunpetal Grove",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/f/5/f565f893-a59d-4246-995e-6bf65ab438d8.jpg?1755731620"
                        }
                    ]
                }
            ],
            planeswalkers: [
                {
                    name: "Nissa, Who Shakes the World",
                    quantity: 1,
                    faces: [
                        {
                            name: "Nissa, Who Shakes the World",
                            manaCost: "{3}{G}{G}",
                            image: "https://cards.scryfall.io/normal/front/f/8/f857bbe4-5619-4733-a0c7-69700f2ef4f3.jpg?1618426283"
                        }
                    ]
                }
            ],
            sideboard: []
        }
    },
    {
        id: "vivi-izzet-spells",
        name: "Vivi Ornitier Izzet Spells",
        format: "Commander",
        archetype: "Combo",
        colors: ["U", "R"],
        description: "Spellslinger UR con Vivi: valor de cantrips, duplicación de hechizos y payoff en criaturas.",
        imageUrl: "https://cards.scryfall.io/normal/front/e/c/ecc1027a-8c07-44a0-bdde-fa2844cff694.jpg?1748706721",
        price: 60,
        featured: false,
        deckData: {
            commander: [
                {
                    name: "Vivi Ornitier",
                    quantity: 1,
                    faces: [
                        {
                            name: "Vivi Ornitier",
                            manaCost: "{1}{U}{R}",
                            image: "https://cards.scryfall.io/normal/front/e/c/ecc1027a-8c07-44a0-bdde-fa2844cff694.jpg?1748706721"
                        }
                    ]
                },
                {
                    name: "Stock Up",
                    quantity: 1,
                    faces: [
                        {
                            name: "Stock Up",
                            manaCost: "{2}{U}",
                            image: "https://cards.scryfall.io/normal/front/0/a/0a786855-6eb4-42c0-a528-4842db46809d.jpg?1738356263"
                        }
                    ]
                },
                {
                    name: "Stormcarved Coast",
                    quantity: 1,
                    faces: [
                        {
                            name: "Stormcarved Coast",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/2/a/2a91991f-4340-45a7-ba04-0001de9581e0.jpg?1736468693"
                        }
                    ]
                },
                {
                    name: "Sulfur Falls",
                    quantity: 1,
                    faces: [
                        {
                            name: "Sulfur Falls",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/2/5/258b1cc2-ce3c-4219-808c-812548a7dd12.jpg?1752945534"
                        }
                    ]
                },
                {
                    name: "Swan Song",
                    quantity: 1,
                    faces: [
                        {
                            name: "Swan Song",
                            manaCost: "{U}",
                            image: "https://cards.scryfall.io/normal/front/8/3/83d0b761-d694-4232-9f40-5bd8c82a05f1.jpg?1752944391"
                        }
                    ]
                },
                {
                    name: "Swiftfoot Boots",
                    quantity: 1,
                    faces: [
                        {
                            name: "Swiftfoot Boots",
                            manaCost: "{2}",
                            image: "https://cards.scryfall.io/normal/front/1/9/1969b151-3192-4d35-80ca-c4e180601ec8.jpg?1743207367"
                        }
                    ]
                },
                {
                    name: "Three Steps Ahead",
                    quantity: 1,
                    faces: [
                        {
                            name: "Three Steps Ahead",
                            manaCost: "{U}",
                            image: "https://cards.scryfall.io/normal/front/8/f/8fffd839-2337-4a14-9312-cee085a17f4b.jpg?1712860611"
                        }
                    ]
                },
                {
                    name: "Unexpected Windfall",
                    quantity: 1,
                    faces: [
                        {
                            name: "Unexpected Windfall",
                            manaCost: "{2}{R}{R}",
                            image: "https://cards.scryfall.io/normal/front/b/a/bae6a5fb-39f5-4cf8-85f7-661cb4570507.jpg?1627706864"
                        }
                    ]
                },
                {
                    name: "Urabrask // The Great Work",
                    quantity: 1,
                    faces: [
                        {
                            name: "Urabrask",
                            manaCost: "{2}{R}{R}",
                            image: "https://cards.scryfall.io/normal/front/7/1/712fb9e5-bd67-4173-a2d4-061aeb6253b5.jpg?1682204559"
                        },
                        {
                            name: "The Great Work",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/back/7/1/712fb9e5-bd67-4173-a2d4-061aeb6253b5.jpg?1682204559"
                        }
                    ]
                },
                {
                    name: "Virtue of Courage // Embereth Blaze",
                    quantity: 1,
                    faces: [
                        {
                            name: "Virtue of Courage",
                            manaCost: "{3}{R}{R}",
                            image: ""
                        },
                        {
                            name: "Embereth Blaze",
                            manaCost: "{1}{R}",
                            image: ""
                        }
                    ]
                },
                {
                    name: "Wizard's Lightning",
                    quantity: 1,
                    faces: [
                        {
                            name: "Wizard's Lightning",
                            manaCost: "{2}{R}",
                            image: "https://cards.scryfall.io/normal/front/5/9/59bf371a-164c-4db8-9207-197c2e7c3c10.jpg?1562736134"
                        }
                    ]
                }
            ],
            creatures: [
                {
                    name: "Archmage Emeritus",
                    quantity: 1,
                    faces: [
                        {
                            name: "Archmage Emeritus",
                            manaCost: "{2}{U}{U}",
                            image: "https://cards.scryfall.io/normal/front/6/2/62f20d75-cfe5-427b-92d3-35c7e77db0d5.jpg?1743206281"
                        }
                    ]
                },
                {
                    name: "Ashling, Flame Dancer",
                    quantity: 1,
                    faces: [
                        {
                            name: "Ashling, Flame Dancer",
                            manaCost: "{2}{R}{R}",
                            image: "https://cards.scryfall.io/normal/front/4/0/40463be5-89e2-410b-9a4b-770f70d14293.jpg?1717012132"
                        }
                    ]
                },
                {
                    name: "Bria, Riptide Rogue",
                    quantity: 1,
                    faces: [
                        {
                            name: "Bria, Riptide Rogue",
                            manaCost: "{2}{U}{R}",
                            image: "https://cards.scryfall.io/normal/front/3/9/390c96b3-68da-4a42-89ab-d9ccc79ce0dd.jpg?1724104634"
                        }
                    ]
                },
                {
                    name: "Coruscation Mage",
                    quantity: 1,
                    faces: [
                        {
                            name: "Coruscation Mage",
                            manaCost: "{1}{R}",
                            image: "https://cards.scryfall.io/normal/front/d/c/dc2c1de0-6233-469a-be72-a050b97d2c8f.jpg?1721426600"
                        }
                    ]
                },
                {
                    name: "Eidolon of the Great Revel",
                    quantity: 1,
                    faces: [
                        {
                            name: "Eidolon of the Great Revel",
                            manaCost: "{R}{R}",
                            image: "https://cards.scryfall.io/normal/front/1/8/183ef738-0559-49ca-85b4-e6836521f203.jpg?1690817860"
                        }
                    ]
                },
                {
                    name: "Electrostatic Field",
                    quantity: 1,
                    faces: [
                        {
                            name: "Electrostatic Field",
                            manaCost: "{1}{R}",
                            image: "https://cards.scryfall.io/normal/front/2/1/21923a95-e65e-4f4a-81f8-fc0895beb107.jpg?1712354416"
                        }
                    ]
                },
                {
                    name: "Eluge, the Shoreless Sea",
                    quantity: 1,
                    faces: [
                        {
                            name: "Eluge, the Shoreless Sea",
                            manaCost: "{1}{U}{U}{U}",
                            image: "https://cards.scryfall.io/normal/front/1/f/1f2bf6ba-cd1a-4382-9572-6dfbcf6ed0c6.jpg?1721426077"
                        }
                    ]
                },
                {
                    name: "Harmonic Prodigy",
                    quantity: 1,
                    faces: [
                        {
                            name: "Harmonic Prodigy",
                            manaCost: "{1}{R}",
                            image: "https://cards.scryfall.io/normal/front/2/2/22579ac0-ad3f-4000-a65a-46a17a7f1aa5.jpg?1626096777"
                        }
                    ]
                },
                {
                    name: "Kitsa, Otterball Elite",
                    quantity: 1,
                    faces: [
                        {
                            name: "Kitsa, Otterball Elite",
                            manaCost: "{1}{U}",
                            image: "https://cards.scryfall.io/normal/front/c/8/c8ff751a-ec64-41d5-b22c-2a483ad9a9b2.jpg?1721426117"
                        }
                    ]
                },
                {
                    name: "Lier, Disciple of the Drowned",
                    quantity: 1,
                    faces: [
                        {
                            name: "Lier, Disciple of the Drowned",
                            manaCost: "{3}{U}{U}",
                            image: "https://cards.scryfall.io/normal/front/b/8/b8b70585-e0ea-4cb4-9360-a8ab47626696.jpg?1743206346"
                        }
                    ]
                },
                {
                    name: "Niv-Mizzet, Parun",
                    quantity: 1,
                    faces: [
                        {
                            name: "Niv-Mizzet, Parun",
                            manaCost: "{U}{U}{U}{R}{R}{R}",
                            image: "https://cards.scryfall.io/normal/front/8/6/86c5c337-d25f-4c3e-9762-09ed0c2d36d7.jpg?1712354750"
                        }
                    ]
                },
                {
                    name: "Ojer Axonil, Deepest Might // Temple of Power",
                    quantity: 1,
                    faces: [
                        {
                            name: "Ojer Axonil, Deepest Might",
                            manaCost: "{2}{R}{R}",
                            image: "https://cards.scryfall.io/normal/front/5/0/50f8e2b6-98c7-4f28-bb39-e1fbe841f1ee.jpg?1699044315"
                        },
                        {
                            name: "Temple of Power",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/back/5/0/50f8e2b6-98c7-4f28-bb39-e1fbe841f1ee.jpg?1699044315"
                        }
                    ]
                },
                {
                    name: "Queen Brahne",
                    quantity: 1,
                    faces: [
                        {
                            name: "Queen Brahne",
                            manaCost: "{2}{R}",
                            image: "https://cards.scryfall.io/normal/front/c/3/c38c98bb-74c9-460f-9997-ea5c5f922347.jpg?1748706319"
                        }
                    ]
                },
                {
                    name: "Razorkin Needlehead",
                    quantity: 1,
                    faces: [
                        {
                            name: "Razorkin Needlehead",
                            manaCost: "{R}{R}",
                            image: "https://cards.scryfall.io/normal/front/b/c/bc73b963-23c0-46d2-853a-34a8b463994e.jpg?1726286422"
                        }
                    ]
                }
            ],
            sorceries: [
                {
                    name: "Boltwave",
                    quantity: 1,
                    faces: [
                        {
                            name: "Boltwave",
                            manaCost: "{R}",
                            image: "https://cards.scryfall.io/normal/front/8/d/8d1ec351-5e70-4eb2-b590-6bff94ef8178.jpg?1730488883"
                        }
                    ]
                },
                {
                    name: "End the Festivities",
                    quantity: 1,
                    faces: [
                        {
                            name: "End the Festivities",
                            manaCost: "{R}",
                            image: "https://cards.scryfall.io/normal/front/b/e/bec748e6-7245-4a71-aeee-cefed8346948.jpg?1643591154"
                        }
                    ]
                },
                {
                    name: "Expressive Iteration",
                    quantity: 1,
                    faces: [
                        {
                            name: "Expressive Iteration",
                            manaCost: "{U}{R}",
                            image: "https://cards.scryfall.io/normal/front/4/5/45e92d69-0684-4a57-8c1c-bbf742bd8a23.jpg?1743207125"
                        }
                    ]
                },
                {
                    name: "Finale of Revelation",
                    quantity: 1,
                    faces: [
                        {
                            name: "Finale of Revelation",
                            manaCost: "{X}{U}{U}",
                            image: "https://cards.scryfall.io/normal/front/0/a/0a77e063-e8f6-4cb2-954e-74cf41ce73da.jpg?1730490835"
                        }
                    ]
                },
                {
                    name: "Gamble",
                    quantity: 1,
                    faces: [
                        {
                            name: "Gamble",
                            manaCost: "{R}",
                            image: "https://cards.scryfall.io/normal/front/8/e/8e37fae5-ddd0-4e16-8581-71579f89d9c5.jpg?1745319947"
                        }
                    ]
                },
                {
                    name: "Grapeshot",
                    quantity: 1,
                    faces: [
                        {
                            name: "Grapeshot",
                            manaCost: "{1}{R}",
                            image: "https://cards.scryfall.io/normal/front/9/2/923e1291-3999-4f81-ade4-073fb982143f.jpg?1675200032"
                        }
                    ]
                },
                {
                    name: "Light Up the Stage",
                    quantity: 1,
                    faces: [
                        {
                            name: "Light Up the Stage",
                            manaCost: "{2}{R}",
                            image: "https://cards.scryfall.io/normal/front/9/1/912b94c9-7200-452d-940f-df0a7cceb377.jpg?1726284958"
                        }
                    ]
                },
                {
                    name: "Nibelheim Aflame",
                    quantity: 1,
                    faces: [
                        {
                            name: "Nibelheim Aflame",
                            manaCost: "{2}{R}{R}",
                            image: "https://cards.scryfall.io/normal/front/3/d/3d3e926a-74af-4996-849f-d31e0fdedeae.jpg?1748706306"
                        }
                    ]
                },
                {
                    name: "Past in Flames",
                    quantity: 1,
                    faces: [
                        {
                            name: "Past in Flames",
                            manaCost: "{3}{R}",
                            image: "https://cards.scryfall.io/normal/front/2/b/2b7472f4-37b0-439f-b4ac-80706d40d191.jpg?1593813533"
                        }
                    ]
                }
            ],
            instants: [
                {
                    name: "Abrade",
                    quantity: 1,
                    faces: [
                        {
                            name: "Abrade",
                            manaCost: "{1}{R}",
                            image: "https://cards.scryfall.io/normal/front/4/c/4c2a1b4e-858c-47a3-be89-9275e48d5475.jpg?1743206610"
                        }
                    ]
                },
                {
                    name: "An Offer You Can't Refuse",
                    quantity: 1,
                    faces: [
                        {
                            name: "An Offer You Can't Refuse",
                            manaCost: "{U}",
                            image: "https://cards.scryfall.io/normal/front/a/8/a829747f-cf9b-4d81-ba66-9f0630ed4565.jpg?1730489199"
                        }
                    ]
                },
                {
                    name: "Borne Upon a Wind",
                    quantity: 1,
                    faces: [
                        {
                            name: "Borne Upon a Wind",
                            manaCost: "{1}{U}",
                            image: "https://cards.scryfall.io/normal/front/a/9/a9379675-1a32-4e2b-8aaf-5f908c595f31.jpg?1686968037"
                        }
                    ]
                },
                {
                    name: "Brainstorm",
                    quantity: 1,
                    faces: [
                        {
                            name: "Brainstorm",
                            manaCost: "{U}",
                            image: "https://cards.scryfall.io/normal/front/8/b/8beb987c-1b67-4a4e-ae71-58547afad2a0.jpg?1726284649"
                        }
                    ]
                },
                {
                    name: "Chaos Warp",
                    quantity: 1,
                    faces: [
                        {
                            name: "Chaos Warp",
                            manaCost: "{2}{R}",
                            image: "https://cards.scryfall.io/normal/front/d/4/d4372203-b930-4e6e-a351-e5b4581eb72b.jpg?1752944413"
                        }
                    ]
                },
                {
                    name: "Consider",
                    quantity: 1,
                    faces: [
                        {
                            name: "Consider",
                            manaCost: "{U}",
                            image: "https://cards.scryfall.io/normal/front/f/f/ff6f3824-3670-46e1-af43-0db405726084.jpg?1743206296"
                        }
                    ]
                },
                {
                    name: "Counterspell",
                    quantity: 1,
                    faces: [
                        {
                            name: "Counterspell",
                            manaCost: "{U}{U}",
                            image: "https://cards.scryfall.io/normal/front/4/f/4f616706-ec97-4923-bb1e-11a69fbaa1f8.jpg?1751282477"
                        }
                    ]
                },
                {
                    name: "Cyclonic Rift",
                    quantity: 1,
                    faces: [
                        {
                            name: "Cyclonic Rift",
                            manaCost: "{1}{U}",
                            image: "https://cards.scryfall.io/normal/front/d/f/dfb7c4b9-f2f4-4d4e-baf2-86551c8150fe.jpg?1702429366"
                        }
                    ]
                },
                {
                    name: "Flame of Anor",
                    quantity: 1,
                    faces: [
                        {
                            name: "Flame of Anor",
                            manaCost: "{1}{U}{R}",
                            image: "https://cards.scryfall.io/normal/front/0/4/04779a7e-b453-48b9-b392-6d6fd0b8d283.jpg?1686969766"
                        }
                    ]
                },
                {
                    name: "Galvanic Iteration",
                    quantity: 1,
                    faces: [
                        {
                            name: "Galvanic Iteration",
                            manaCost: "{U}{R}",
                            image: "https://cards.scryfall.io/normal/front/7/2/72531705-82f4-4254-82b2-c0b6098f4dbe.jpg?1736468499"
                        }
                    ]
                },
                {
                    name: "Lightning Bolt",
                    quantity: 1,
                    faces: [
                        {
                            name: "Lightning Bolt",
                            manaCost: "{R}",
                            image: "https://cards.scryfall.io/normal/front/7/7/77c6fa74-5543-42ac-9ead-0e890b188e99.jpg?1706239968"
                        }
                    ]
                },
                {
                    name: "Lightning Strike",
                    quantity: 1,
                    faces: [
                        {
                            name: "Lightning Strike",
                            manaCost: "{1}{R}",
                            image: "https://cards.scryfall.io/normal/front/5/7/5787b0e0-9469-4a6d-8b81-c992628e28c0.jpg?1755205241"
                        }
                    ]
                },
                {
                    name: "Opt",
                    quantity: 1,
                    faces: [
                        {
                            name: "Opt",
                            manaCost: "{U}",
                            image: "https://cards.scryfall.io/normal/front/b/b/bbc99a51-1501-4525-a3cc-f48249b64bed.jpg?1743206354"
                        }
                    ]
                },
                {
                    name: "Play with Fire",
                    quantity: 1,
                    faces: [
                        {
                            name: "Play with Fire",
                            manaCost: "{R}",
                            image: "https://cards.scryfall.io/normal/front/6/f/6f1a6c60-a8c4-44c2-b1ea-d3befbabdf43.jpg?1636223358"
                        }
                    ]
                },
                {
                    name: "Prismari Command",
                    quantity: 1,
                    faces: [
                        {
                            name: "Prismari Command",
                            manaCost: "{1}{U}{R}",
                            image: "https://cards.scryfall.io/normal/front/1/5/15e291f4-068a-441c-8b43-05055199aca4.jpg?1743207195"
                        }
                    ]
                },
                {
                    name: "Rapid Hybridization",
                    quantity: 1,
                    faces: [
                        {
                            name: "Rapid Hybridization",
                            manaCost: "{U}",
                            image: "https://cards.scryfall.io/normal/front/b/6/b6912638-b087-4754-9e7e-8bd76fbf095c.jpg?1743206378"
                        }
                    ]
                },
                {
                    name: "Shock",
                    quantity: 1,
                    faces: [
                        {
                            name: "Shock",
                            manaCost: "{R}",
                            image: "https://cards.scryfall.io/normal/front/7/6/760b41a1-c087-4b11-b8a0-fb01d8a4c0c6.jpg?1753309308"
                        }
                    ]
                },
                {
                    name: "Shore Up",
                    quantity: 1,
                    faces: [
                        {
                            name: "Shore Up",
                            manaCost: "{U}",
                            image: "https://cards.scryfall.io/normal/front/4/d/4dc3b49e-3674-494c-bdea-4374cefd10f4.jpg?1721426233"
                        }
                    ]
                },
                {
                    name: "Slip Out the Back",
                    quantity: 1,
                    faces: [
                        {
                            name: "Slip Out the Back",
                            manaCost: "{U}",
                            image: "https://cards.scryfall.io/normal/front/d/9/d9d9fbbb-ed6c-45f7-a1d8-f9d29ae7930f.jpg?1706239838"
                        }
                    ]
                }
            ],
            artifacts: [
                {
                    name: "Arcane Signet",
                    quantity: 1,
                    faces: [
                        {
                            name: "Arcane Signet",
                            manaCost: "{2}",
                            image: "https://cards.scryfall.io/normal/front/3/d/3d994115-378d-4685-a5dc-e448831da434.jpg?1755356098"
                        }
                    ]
                },
                {
                    name: "Cori-Steel Cutter",
                    quantity: 1,
                    faces: [
                        {
                            name: "Cori-Steel Cutter",
                            manaCost: "{1}{R}",
                            image: "https://cards.scryfall.io/normal/front/4/9/490eb213-9ae2-4b45-abec-6f1dfc83792a.jpg?1752091352"
                        }
                    ]
                }
            ],
            enchantments: [
                {
                    name: "Arcane Bombardment",
                    quantity: 1,
                    faces: [
                        {
                            name: "Arcane Bombardment",
                            manaCost: "{4}{R}{R}",
                            image: "https://cards.scryfall.io/normal/front/e/f/ef7e6e2d-d984-483e-b117-b1c5d640dc23.jpg?1712354373"
                        }
                    ]
                },
                {
                    name: "Curiosity",
                    quantity: 1,
                    faces: [
                        {
                            name: "Curiosity",
                            manaCost: "{U}",
                            image: "https://cards.scryfall.io/normal/front/c/5/c5a0be10-c20f-4ac0-89a5-1770ecf48aad.jpg?1600697752"
                        }
                    ]
                },
                {
                    name: "Fiery Inscription",
                    quantity: 1,
                    faces: [
                        {
                            name: "Fiery Inscription",
                            manaCost: "{2}{R}",
                            image: "https://cards.scryfall.io/normal/front/8/c/8c321159-43e5-40fc-9f0c-4ecc4f6cfd20.jpg?1686968925"
                        }
                    ]
                },
                {
                    name: "Proft's Eidetic Memory",
                    quantity: 1,
                    faces: [
                        {
                            name: "Proft's Eidetic Memory",
                            manaCost: "{1}{U}",
                            image: "https://cards.scryfall.io/normal/front/a/f/af5b29b3-974c-4200-8df8-b072c11e1600.jpg?1706241635"
                        }
                    ]
                }
            ],
            lands: [
                {
                    name: "Command Tower",
                    quantity: 1,
                    faces: [
                        {
                            name: "Command Tower",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/8/5/85eb4b03-305b-45a4-82e5-5fcd586cc744.jpg?1755356081"
                        }
                    ]
                },
                {
                    name: "Frostboil Snarl",
                    quantity: 1,
                    faces: [
                        {
                            name: "Frostboil Snarl",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/5/2/5229c275-04aa-4168-9eb3-6c04f9501fd1.jpg?1712355032"
                        }
                    ]
                },
                {
                    name: "Island",
                    quantity: 8,
                    faces: [
                        {
                            name: "Island",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/a/2/a2e22347-f0cb-4cfd-88a3-4f46a16e4946.jpg?1755290097"
                        }
                    ]
                },
                {
                    name: "Lindblum, Industrial Regency // Mage Siege",
                    quantity: 1,
                    faces: [
                        {
                            name: "Lindblum, Industrial Regency",
                            manaCost: "{2}{R}",
                            image: ""
                        },
                        {
                            name: "Mage Siege",
                            manaCost: "",
                            image: ""
                        }
                    ]
                },
                {
                    name: "Mistrise Village",
                    quantity: 1,
                    faces: [
                        {
                            name: "Mistrise Village",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/d/4/d44bccbf-6fab-46e4-8ddb-6577e27ec6e8.jpg?1743205033"
                        }
                    ]
                },
                {
                    name: "Mountain",
                    quantity: 8,
                    faces: [
                        {
                            name: "Mountain",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/c/4/c44f81ca-f72f-445c-8901-3a894a2a47f9.jpg?1755290125"
                        }
                    ]
                },
                {
                    name: "Mystic Sanctuary",
                    quantity: 1,
                    faces: [
                        {
                            name: "Mystic Sanctuary",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/6/7/67652446-6d12-4e2a-bb51-ba685f2e79d1.jpg?1706241201"
                        }
                    ]
                },
                {
                    name: "Reliquary Tower",
                    quantity: 1,
                    faces: [
                        {
                            name: "Reliquary Tower",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/6/b/6be3be55-7f9d-4a4c-b916-a1cb64f833c8.jpg?1743207700"
                        }
                    ]
                },
                {
                    name: "Riptide Laboratory",
                    quantity: 1,
                    faces: [
                        {
                            name: "Riptide Laboratory",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/2/5/25a9cb87-e572-4885-8561-1d4b158ec7e4.jpg?1626101076"
                        }
                    ]
                },
                {
                    name: "Shivan Reef",
                    quantity: 1,
                    faces: [
                        {
                            name: "Shivan Reef",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/7/2/72bba14a-c813-49c8-bf73-f41e1bdc1099.jpg?1752945498"
                        }
                    ]
                },
                {
                    name: "Spirebluff Canal",
                    quantity: 1,
                    faces: [
                        {
                            name: "Spirebluff Canal",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/5/9/59a04e16-a767-4112-ab01-6ca1b09c286c.jpg?1712356382"
                        }
                    ]
                },
                {
                    name: "Steam Vents",
                    quantity: 1,
                    faces: [
                        {
                            name: "Steam Vents",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/6/6/66d618f4-443c-4a6c-8cbd-5d4ea96b2cd4.jpg?1702429824"
                        }
                    ]
                }
            ],
            planeswalkers: [
                {
                    name: "Ral, Crackling Wit",
                    quantity: 1,
                    faces: [
                        {
                            name: "Ral, Crackling Wit",
                            manaCost: "{2}{U}{R}",
                            image: "https://cards.scryfall.io/normal/front/a/c/acfde780-899a-4c5b-a39b-f4a3ff129103.jpg?1721427178"
                        }
                    ]
                }
            ],
            sideboard: []
            }
        },
    {
        id: "sauron-dark-lord-1",
        name: "Sauron, the Dark Lord (Grixis)",
        format: "Commander",
        archetype: "Control",
        colors: ["U", "B", "R"],
        description: "Un mazo Commander centrado en Sauron y sus secuaces, con control, value y sinergias de descarte y robo. Inspirado en El Señor de los Anillos.",
        imageUrl: "https://cards.scryfall.io/normal/front/0/3/034e0929-b2c7-4b5f-94f2-8eaf4fb1a2a1.jpg?1693611218",
        price: 129.99, // Cambia el precio si lo deseas
        featured: true,
        deckData: {
            commander: [
                {
                    name: "Sauron, the Dark Lord",
                    quantity: 1,
                    faces: [
                        {
                            name: "Sauron, the Dark Lord",
                            manaCost: "{3}{U}{B}{R}",
                            image: "https://cards.scryfall.io/normal/front/0/3/034e0929-b2c7-4b5f-94f2-8eaf4fb1a2a1.jpg?1693611218"
                        }
                    ]
                }
            ],
            creatures: [
                {
                    name: "Archfiend of Ifnir",
                    quantity: 1,
                    faces: [
                        {
                            name: "Archfiend of Ifnir",
                            manaCost: "{3}{B}{B}",
                            image: "https://cards.scryfall.io/normal/front/3/3/33176679-d571-47a1-ae05-bed9b748491d.jpg?1543675179"
                        }
                    ]
                },
                {
                    name: "Dunland Crebain",
                    quantity: 1,
                    faces: [
                        {
                            name: "Dunland Crebain",
                            manaCost: "{2}{B}",
                            image: "https://cards.scryfall.io/normal/front/6/9/695c05ab-e46e-46c7-bd2e-ef0b2307e449.jpg?1686968429"
                        }
                    ]
                },
                {
                    name: "Gandalf, Friend of the Shire",
                    quantity: 1,
                    faces: [
                        {
                            name: "Gandalf, Friend of the Shire",
                            manaCost: "{3}{U}",
                            image: "https://cards.scryfall.io/normal/front/c/c/cc9cfcc7-be64-4871-8d52-851e43fe3305.jpg?1696231214"
                        }
                    ]
                },
                {
                    name: "Gollum, Patient Plotter",
                    quantity: 1,
                    faces: [
                        {
                            name: "Gollum, Patient Plotter",
                            manaCost: "{1}{B}",
                            image: "https://cards.scryfall.io/normal/front/4/d/4ddda7d4-0226-404f-8418-f1f5720dcef8.jpg?1686968450"
                        }
                    ]
                },
                {
                    name: "Gothmog, Morgul Lieutenant",
                    quantity: 1,
                    faces: [
                        {
                            name: "Gothmog, Morgul Lieutenant",
                            manaCost: "{3}{B}",
                            image: "https://cards.scryfall.io/normal/front/a/1/a1c10e93-88eb-46b9-8adc-583661807990.jpg?1686968484"
                        }
                    ]
                },
                {
                    name: "Grishnákh, Brash Instigator",
                    quantity: 1,
                    faces: [
                        {
                            name: "Grishnákh, Brash Instigator",
                            manaCost: "{2}{R}",
                            image: "https://cards.scryfall.io/normal/front/6/3/6385e769-f805-499d-9f47-494533362152.jpg?1686969015"
                        }
                    ]
                },
                {
                    name: "Mauhúr, Uruk-hai Captain",
                    quantity: 1,
                    faces: [
                        {
                            name: "Mauhúr, Uruk-hai Captain",
                            manaCost: "{B}{R}",
                            image: "https://cards.scryfall.io/normal/front/6/5/65e9a757-7ed4-4cc0-bb6f-a59fa69b32a5.jpg?1686969884"
                        }
                    ]
                },
                {
                    name: "Moria Marauder",
                    quantity: 1,
                    faces: [
                        {
                            name: "Moria Marauder",
                            manaCost: "{R}{R}",
                            image: "https://cards.scryfall.io/normal/front/f/3/f33d5394-2248-4654-bec5-33b144752586.jpg?1686969061"
                        }
                    ]
                },
                {
                    name: "Saruman the White",
                    quantity: 1,
                    faces: [
                        {
                            name: "Saruman the White",
                            manaCost: "{4}{U}",
                            image: "https://cards.scryfall.io/normal/front/1/b/1bfccbab-29fa-4e92-8919-6cd4815fb655.jpg?1686968266"
                        }
                    ]
                },
                {
                    name: "Sauron, the Lidless Eye",
                    quantity: 1,
                    faces: [
                        {
                            name: "Sauron, the Lidless Eye",
                            manaCost: "{3}{B}{R}",
                            image: "https://cards.scryfall.io/normal/front/d/8/d82a4c78-d2fc-425a-8d0e-2e64509a08f1.jpg?1715720382"
                        }
                    ]
                },
                {
                    name: "Sauron, the Necromancer",
                    quantity: 1,
                    faces: [
                        {
                            name: "Sauron, the Necromancer",
                            manaCost: "{3}{B}{B}",
                            image: "https://cards.scryfall.io/normal/front/3/7/377d65d8-21c8-4292-97db-610e0173ba59.jpg?1686968699"
                        }
                    ]
                },
                {
                    name: "The Mouth of Sauron",
                    quantity: 1,
                    faces: [
                        {
                            name: "The Mouth of Sauron",
                            manaCost: "{3}{U}{B}",
                            image: "https://cards.scryfall.io/normal/front/7/6/76a88814-aa30-4297-b338-3d851bfe7256.jpg?1686969905"
                        }
                    ]
                },
                {
                    name: "Uglúk of the White Hand",
                    quantity: 1,
                    faces: [
                        {
                            name: "Uglúk of the White Hand",
                            manaCost: "{2}{B}{R}",
                            image: "https://cards.scryfall.io/normal/front/e/9/e914c7fc-be3c-4346-bf37-6e10f4998204.jpg?1686970114"
                        }
                    ]
                },
                {
                    name: "Warg Rider",
                    quantity: 1,
                    faces: [
                        {
                            name: "Warg Rider",
                            manaCost: "{4}{B}",
                            image: "https://cards.scryfall.io/normal/front/1/8/18cc2bc6-12bb-4795-b2b2-9d414823b773.jpg?1719684212"
                        }
                    ]
                },
                {
                    name: "Witch-king of Angmar",
                    quantity: 1,
                    faces: [
                        {
                            name: "Witch-king of Angmar",
                            manaCost: "{3}{B}{B}",
                            image: "https://cards.scryfall.io/normal/front/a/5/a55e6508-0b59-4573-bc4e-67b27279cfed.jpg?1686968786"
                        }
                    ]
                }
            ],
            sorceries: [
                {
                    name: "Claim the Precious",
                    quantity: 1,
                    faces: [
                        {
                            name: "Claim the Precious",
                            manaCost: "{1}{B}{B}",
                            image: "https://cards.scryfall.io/normal/front/1/2/121c12c4-83ea-463e-8fdf-30718968a2bd.jpg?1686968419"
                        }
                    ]
                },
                {
                    name: "Diabolic Intent",
                    quantity: 1,
                    faces: [
                        {
                            name: "Diabolic Intent",
                            manaCost: "{1}{B}",
                            image: "https://cards.scryfall.io/normal/front/d/7/d72ab698-de67-4ca8-8e42-b05346bf52fa.jpg?1674420800"
                        }
                    ]
                },
                {
                    name: "Faithless Looting",
                    quantity: 1,
                    faces: [
                        {
                            name: "Faithless Looting",
                            manaCost: "{R}",
                            image: "https://cards.scryfall.io/normal/front/c/4/c43aeb5a-8bdc-4aa9-89d1-156f97ac38aa.jpg?1743206665"
                        }
                    ]
                },
                {
                    name: "Foray of Orcs",
                    quantity: 1,
                    faces: [
                        {
                            name: "Foray of Orcs",
                            manaCost: "{3}{R}",
                            image: "https://cards.scryfall.io/normal/front/5/f/5fea0c66-c776-4dc7-a235-f3822521cacd.jpg?1686968948"
                        }
                    ]
                },
                {
                    name: "Reanimate",
                    quantity: 1,
                    faces: [
                        {
                            name: "Reanimate",
                            manaCost: "{B}",
                            image: "https://cards.scryfall.io/normal/front/3/6/368b6903-5fc4-43e7-bd44-46b8107c8bb4.jpg?1738000013"
                        }
                    ]
                },
                {
                    name: "Ringsight",
                    quantity: 1,
                    faces: [
                        {
                            name: "Ringsight",
                            manaCost: "{1}{U}{B}",
                            image: "https://cards.scryfall.io/normal/front/3/7/3700a65c-6f54-4d56-9c6f-8364c45a058c.jpg?1686969951"
                        }
                    ]
                },
                {
                    name: "Toxic Deluge",
                    quantity: 1,
                    faces: [
                        {
                            name: "Toxic Deluge",
                            manaCost: "{2}{B}",
                            image: "https://cards.scryfall.io/normal/front/5/a/5aa02b7d-db31-4924-b75e-eb02f332ca3a.jpg?1717013647"
                        }
                    ]
                },
                {
                    name: "Treason of Isengard",
                    quantity: 1,
                    faces: [
                        {
                            name: "Treason of Isengard",
                            manaCost: "{2}{U}",
                            image: "https://cards.scryfall.io/normal/front/7/1/71f97505-c961-4890-acd0-32a63919ac2a.jpg?1686968343"
                        }
                    ]
                }
            ],
            instants: [
                {
                    name: "Commence the Endgame",
                    quantity: 1,
                    faces: [
                        {
                            name: "Commence the Endgame",
                            manaCost: "{4}{U}{U}",
                            image: "https://cards.scryfall.io/normal/front/2/0/209d70a2-c8c1-4072-ab1f-57804b55a09a.jpg?1557576173"
                        }
                    ]
                },
                {
                    name: "Counterspell",
                    quantity: 1,
                    faces: [
                        {
                            name: "Counterspell",
                            manaCost: "{U}{U}",
                            image: "https://cards.scryfall.io/normal/front/4/f/4f616706-ec97-4923-bb1e-11a69fbaa1f8.jpg?1751282477"
                        }
                    ]
                },
                {
                    name: "Dark Ritual",
                    quantity: 1,
                    faces: [
                        {
                            name: "Dark Ritual",
                            manaCost: "{B}",
                            image: "https://cards.scryfall.io/normal/front/9/5/95f27eeb-6f14-4db3-adb9-9be5ed76b34b.jpg?1753711947"
                        }
                    ]
                },
                {
                    name: "Glorious Gale",
                    quantity: 1,
                    faces: [
                        {
                            name: "Glorious Gale",
                            manaCost: "{1}{U}",
                            image: "https://cards.scryfall.io/normal/front/6/e/6e1057de-5710-415c-9a51-1d8bd86021a3.jpg?1686968102"
                        }
                    ]
                },
                {
                    name: "Go for the Throat",
                    quantity: 1,
                    faces: [
                        {
                            name: "Go for the Throat",
                            manaCost: "{1}{B}",
                            image: "https://cards.scryfall.io/normal/front/5/4/5446e1ba-c745-45b2-ad05-b22abf04daec.jpg?1682209037"
                        }
                    ]
                },
                {
                    name: "Lazotep Plating",
                    quantity: 1,
                    faces: [
                        {
                            name: "Lazotep Plating",
                            manaCost: "{1}{U}",
                            image: "https://cards.scryfall.io/normal/front/f/0/f03b5405-6016-405b-a504-a454731b9276.jpg?1557576262"
                        }
                    ]
                },
                {
                    name: "Orcish Medicine",
                    quantity: 1,
                    faces: [
                        {
                            name: "Orcish Medicine",
                            manaCost: "{1}{B}",
                            image: "https://cards.scryfall.io/normal/front/6/6/66fae9ab-2302-4dea-a4e8-701938a0ef09.jpg?1686968679"
                        }
                    ]
                },
                {
                    name: "Saruman's Trickery",
                    quantity: 1,
                    faces: [
                        {
                            name: "Saruman's Trickery",
                            manaCost: "{1}{U}{U}",
                            image: "https://cards.scryfall.io/normal/front/8/e/8eb6c23b-e52e-4533-9625-884eb0a4d866.jpg?1686968278"
                        }
                    ]
                },
                {
                    name: "Sauron's Ransom",
                    quantity: 1,
                    faces: [
                        {
                            name: "Sauron's Ransom",
                            manaCost: "{1}{U}{B}",
                            image: "https://cards.scryfall.io/normal/front/6/b/6b98850c-ad69-42da-b91a-8dc5e226c444.jpg?1686970005"
                        }
                    ]
                }
            ],
            artifacts: [
                {
                    name: "Arcane Signet",
                    quantity: 1,
                    faces: [
                        {
                            name: "Arcane Signet",
                            manaCost: "{2}",
                            image: "https://cards.scryfall.io/normal/front/3/d/3d994115-378d-4685-a5dc-e448831da434.jpg?1755356098"
                        }
                    ]
                },
                {
                    name: "Chromatic Lantern",
                    quantity: 1,
                    faces: [
                        {
                            name: "Chromatic Lantern",
                            manaCost: "{3}",
                            image: "https://cards.scryfall.io/normal/front/8/f/8f6448b1-ffc7-43f0-b713-881016ce9485.jpg?1712354852"
                        }
                    ]
                },
                {
                    name: "Dimir Signet",
                    quantity: 1,
                    faces: [
                        {
                            name: "Dimir Signet",
                            manaCost: "{2}",
                            image: "https://cards.scryfall.io/normal/front/c/3/c3af24ce-b1ab-4137-9222-a4080acae928.jpg?1706240208"
                        }
                    ]
                },
                {
                    name: "Inherited Envelope",
                    quantity: 1,
                    faces: [
                        {
                            name: "Inherited Envelope",
                            manaCost: "{3}",
                            image: "https://cards.scryfall.io/normal/front/b/5/b590d028-ea6a-4550-b5e2-ba328a81bbc0.jpg?1686970192"
                        }
                    ]
                },
                {
                    name: "Izzet Signet",
                    quantity: 1,
                    faces: [
                        {
                            name: "Izzet Signet",
                            manaCost: "{2}",
                            image: "https://cards.scryfall.io/normal/front/2/c/2c747a97-9070-4c1e-b7b7-52637fbb30e1.jpg?1743207322"
                        }
                    ]
                },
                {
                    name: "Rakdos Signet",
                    quantity: 1,
                    faces: [
                        {
                            name: "Rakdos Signet",
                            manaCost: "{2}",
                            image: "https://cards.scryfall.io/normal/front/0/1/01cc9536-f710-4c47-9e3f-d7e83cc888f2.jpg?1726285319"
                        }
                    ]
                },
                {
                    name: "Talisman of Dominance",
                    quantity: 1,
                    faces: [
                        {
                            name: "Talisman of Dominance",
                            manaCost: "{2}",
                            image: "https://cards.scryfall.io/normal/front/f/6/f6c8e0b5-218e-41dd-8b09-2d4aaec2c979.jpg?1706241098"
                        }
                    ]
                },
                {
                    name: "The One Ring",
                    quantity: 1,
                    faces: [
                        {
                            name: "The One Ring",
                            manaCost: "{4}",
                            image: "https://cards.scryfall.io/normal/front/d/5/d5806e68-1054-458e-866d-1f2470f682b2.jpg?1734350327"
                        }
                    ]
                }
            ],
            enchantments: [
                {
                    name: "Book of Mazarbul",
                    quantity: 1,
                    faces: [
                        {
                            name: "Book of Mazarbul",
                            manaCost: "{2}{R}",
                            image: "https://cards.scryfall.io/normal/front/0/4/04dcef75-6f98-4233-ae32-6fe41724c8e0.jpg?1688569131"
                        }
                    ]
                },
                {
                    name: "Call of the Ring",
                    quantity: 1,
                    faces: [
                        {
                            name: "Call of the Ring",
                            manaCost: "{1}{B}",
                            image: "https://cards.scryfall.io/normal/front/a/9/a92a2c5a-e450-494a-b23b-7ac0a6c50535.jpg?1686968397"
                        }
                    ]
                },
                {
                    name: "Fall of Cair Andros",
                    quantity: 1,
                    faces: [
                        {
                            name: "Fall of Cair Andros",
                            manaCost: "{2}{R}",
                            image: "https://cards.scryfall.io/normal/front/3/5/354b4623-50a0-41f1-ad1e-7dd6ac3852df.jpg?1686968903"
                        }
                    ]
                },
                {
                    name: "March from the Black Gate",
                    quantity: 1,
                    faces: [
                        {
                            name: "March from the Black Gate",
                            manaCost: "{1}{B}",
                            image: "https://cards.scryfall.io/normal/front/e/5/e57815d4-b21f-4ceb-a3f1-73cff5f0e612.jpg?1686968563"
                        }
                    ]
                },
                {
                    name: "One Ring to Rule Them All",
                    quantity: 1,
                    faces: [
                        {
                            name: "One Ring to Rule Them All",
                            manaCost: "{2}{B}{B}",
                            image: "https://cards.scryfall.io/normal/front/b/b/bb2dc2e0-f393-4442-818b-d3b860bfffd0.jpg?1688569235"
                        }
                    ]
                },
                {
                    name: "Phyrexian Arena",
                    quantity: 1,
                    faces: [
                        {
                            name: "Phyrexian Arena",
                            manaCost: "{1}{B}{B}",
                            image: "https://cards.scryfall.io/normal/front/0/7/0784b6f0-9ebf-43d2-ba0f-a6bc93ba0c48.jpg?1730489269"
                        }
                    ]
                }
            ],
            lands: [
                {
                    name: "Barad-dûr",
                    quantity: 1,
                    faces: [
                        {
                            name: "Barad-dûr",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/e/b/eb5038af-06b0-401e-8dea-a1a8483788ae.jpg?1686970323"
                        }
                    ]
                },
                {
                    name: "Command Tower",
                    quantity: 1,
                    faces: [
                        {
                            name: "Command Tower",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/8/5/85eb4b03-305b-45a4-82e5-5fcd586cc744.jpg?1755356081"
                        }
                    ]
                },
                {
                    name: "Crossroads Village",
                    quantity: 1,
                    faces: [
                        {
                            name: "Crossroads Village",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/6/4/64db46d4-f91f-49cc-971c-b8e19f0c4ea9.jpg?1748706815"
                        }
                    ]
                },
                {
                    name: "Evolving Wilds",
                    quantity: 1,
                    faces: [
                        {
                            name: "Evolving Wilds",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/3/1/31181bd2-3a1f-4cb9-ba30-637ac479133a.jpg?1752945310"
                        }
                    ]
                },
                {
                    name: "Island",
                    quantity: 7,
                    faces: [
                        {
                            name: "Island",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/a/2/a2e22347-f0cb-4cfd-88a3-4f46a16e4946.jpg?1755290097"
                        }
                    ]
                },
                {
                    name: "Jagged Barrens",
                    quantity: 1,
                    faces: [
                        {
                            name: "Jagged Barrens",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/5/d/5d809f5b-d965-4cb1-a9f8-2048f8534373.jpg?1712356337"
                        }
                    ]
                },
                {
                    name: "Mountain",
                    quantity: 5,
                    faces: [
                        {
                            name: "Mountain",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/c/4/c44f81ca-f72f-445c-8901-3a894a2a47f9.jpg?1755290125"
                        }
                    ]
                },
                {
                    name: "Rivendell",
                    quantity: 1,
                    faces: [
                        {
                            name: "Rivendell",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/b/a/bacd500c-1389-4314-a53e-0ad510d6fb79.jpg?1686970394"
                        }
                    ]
                },
                {
                    name: "Rogue's Passage",
                    quantity: 1,
                    faces: [
                        {
                            name: "Rogue's Passage",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/a/2/a2a424ea-ef32-4ac5-8f8c-3ea1839f01d4.jpg?1730489588"
                        }
                    ]
                },
                {
                    name: "Shivan Reef",
                    quantity: 1,
                    faces: [
                        {
                            name: "Shivan Reef",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/7/2/72bba14a-c813-49c8-bf73-f41e1bdc1099.jpg?1752945498"
                        }
                    ]
                },
                {
                    name: "Sulfur Falls",
                    quantity: 1,
                    faces: [
                        {
                            name: "Sulfur Falls",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/f/f/ff61b992-38bc-4a8e-aaf8-aa6c4aa6fadd.jpg?1755711732"
                        }
                    ]
                },
                {
                    name: "Sulfurous Springs",
                    quantity: 1,
                    faces: [
                        {
                            name: "Sulfurous Springs",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/e/e/eedb9df2-20d3-4cfd-8aed-336edc37d5a9.jpg?1752945541"
                        }
                    ]
                },
                {
                    name: "Swamp",
                    quantity: 11,
                    faces: [
                        {
                            name: "Swamp",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/f/0/f0b234d8-d6bb-48ec-8a4d-d8a570a69c62.jpg?1755290113"
                        }
                    ]
                },
                {
                    name: "Terramorphic Expanse",
                    quantity: 1,
                    faces: [
                        {
                            name: "Terramorphic Expanse",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/7/1/7102269a-e0d1-42a0-aa9d-fdd53b5aaebe.jpg?1752944521"
                        }
                    ]
                },
                {
                    name: "Underground River",
                    quantity: 1,
                    faces: [
                        {
                            name: "Underground River",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/5/e/5e50c8d5-6b22-4fc6-87ea-3d7d77ced17f.jpg?1726285574"
                        }
                    ]
                },
                {
                    name: "Watery Grave",
                    quantity: 1,
                    faces: [
                        {
                            name: "Watery Grave",
                            manaCost: "",
                            image: "https://cards.scryfall.io/normal/front/5/b/5b8170dc-6a90-46fc-9989-7575f3d402b5.jpg?1752947617"
                        }
                    ]
                }
            ],
            planeswalkers: [],
            sideboard: []
        }
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
