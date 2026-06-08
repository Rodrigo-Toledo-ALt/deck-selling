// Componente DeckHeader.tsx
// Muestra un encabezado visual para un "deck" (mazo), con imagen de fondo,
// degradado superpuesto y datos principales (autor, nombre, formato).
// Comentarios en español para facilitar la lectura del TFG.

import React from 'react';

interface DeckHeaderProps {
    deck: {
        id: string;
        name: string;
        format?: string;
        imageUrl?: string;
    };
    imageUrl?: string; // Permite sobreescribir la imagen del deck desde la prop
}

const DeckHeader: React.FC<DeckHeaderProps> = ({ deck, imageUrl }) => {
    // Protección: si no hay deck, no renderizamos nada (evita errores)
    if (!deck) return null;

    // Selección de la imagen: prioridad prop imageUrl > deck.imageUrl > vacío
    const headerImage = imageUrl || deck.imageUrl || '';

    return (
        // Contenedor principal: ocupa todo el ancho, altura mínima y usa background-image
        <div
            className="relative w-full min-h-[200px] overflow-hidden bg-no-repeat bg-cover rounded-lg"
            // Si headerImage está vacío, dejamos undefined para no aplicar inline style
            style={{ backgroundImage: headerImage ? `url('${headerImage}')` : undefined }}
        >
            {/* Capa de overlay púrpura/gradiente para mejorar legibilidad del texto */}
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-secondary via-secondary to-slate-800/10"></div>

            {/*
                Contenedor para la imagen principal "decorativa".
                Está posicionado parcialmente fuera del contenedor para un efecto visual.
                pointer-events-none evita que interfiera con eventos del ratón.
            */}
            <div className="absolute left-[70%] top-0 w-1/2 h-full overflow-visible z-0 -translate-x-1/2 pointer-events-none">
                {headerImage ? (
                    // Si hay imagen, la renderizamos como <img> para controlar mejor el comportamiento
                    <img
                        src={headerImage}
                        alt={deck.name} // alt accesible: nombre del deck
                        className="absolute left-1/2 top-0 -translate-x-1/2 min-h-[120%] w-auto object-cover"
                        style={{ transformOrigin: 'top center', transform: 'translateY(-2rem)' }}
                        fetchPriority="high" // da prioridad al fetch de esta imagen en navegadores que lo soporten
                    />
                ) : (
                    // Si no hay imagen, mostramos un bloque neutro (placeholder)
                    <div className="w-full h-full bg-muted" />
                )}
            </div>

            {/* Contenido principal (texto encima del overlay) */}
            <div className="relative z-10 px-6 py-8">
                {/* Fila con avatar/autor */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                        {/* Inicial o logo pequeño */}
                        <span className="text-white font-bold text-lg">G</span>
                    </div>
                    {/* Nombre del autor (aquí fijo, podría venir por prop si se desea) */}
                    <span className="text-white/80 text-lg font-medium">Gabrielchus</span>
                </div>

                {/* Título del deck */}
                <h1 className="text-5xl font-bold text-gradient mb-4 tracking-tight">
                    {deck.name}
                </h1>

                {/* Badges / metadata (formato) */}
                <div className="flex gap-3 mb-6">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium border border-white/30">
                        {/* Si deck.format no está definido, se muestra 'COMMANDER' por defecto */}
                        {deck.format?.toUpperCase() || 'COMMANDER'}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default DeckHeader;