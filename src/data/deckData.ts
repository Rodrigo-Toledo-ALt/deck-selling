// deckData.ts
// Tipos e interfaces para representar cartas y mazos en la aplicación.
// Estos tipos se usan para parsear y manipular datos de cartas, especialmente
// en componentes como CardList o ImageFlip donde se muestran cartas con múltiples caras.

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
    typeLine: string;      // Tipo de la carta (ej: "Creature — Human Wizard")
    faces: CardFace[];     // Lista de caras (al menos una; dos para cartas dobles cara)
}