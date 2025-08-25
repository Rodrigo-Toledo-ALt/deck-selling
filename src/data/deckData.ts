// Interfaces para tipado adaptadas al nuevo formato con typeLine y faces
export interface CardFace {
    name: string;
    manaCost: string;
    image: string;
}

export interface CardInfo {
    name: string;
    quantity: number;
    typeLine: string;
    faces: CardFace[];
}