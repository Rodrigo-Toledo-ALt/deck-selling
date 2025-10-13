import React from 'react';

interface DeckHeaderProps {
    deck: {
        id: string;
        name: string;
        format?: string;
        imageUrl?: string;        // por compatibilidad con versiones anteriores
        // ...otros campos que uses
    };
    imageUrl?: string;          // NUEVO: URL firmada que le pasas desde fuera
}

const DeckHeader: React.FC<DeckHeaderProps> = ({ deck, imageUrl }) => {
    if (!deck) return null;

    const headerImage = imageUrl || deck.imageUrl || '';

    return (
        <div
            className="relative w-full min-h-[200px] overflow-hidden bg-no-repeat bg-cover rounded-lg"
            style={{ backgroundImage: headerImage ? `url('${headerImage}')` : undefined }}
        >
            {/* Overlay púrpura */}
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-secondary via-secondary to-slate-800/10"></div>

            {/* Imagen principal del deck */}
            <div className="absolute left-1/2 top-0 w-1/2 h-full overflow-hidden z-0">
                {headerImage ? (
                    <img
                        src={headerImage}
                        alt={deck.name}
                        className="deckheader-image min-w-full min-h-full object-cover"
                        fetchPriority="high"
                    />
                ) : (
                    <div className="w-full h-full bg-muted" />
                )}
            </div>

            {/* Main content */}
            <div className="relative z-10 px-6 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                        <span className="text-white font-bold text-lg">G</span>
                    </div>
                    <span className="text-white/80 text-lg font-medium">Gabrielchus</span>
                </div>

                <h1 className="text-5xl font-bold text-gradient mb-4 tracking-tight">
                    {deck.name}
                </h1>

                <div className="flex gap-3 mb-6">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium border border-white/30">
            {deck.format?.toUpperCase() || 'COMMANDER'}
          </span>
                </div>
            </div>
        </div>
    );
};

export default DeckHeader;