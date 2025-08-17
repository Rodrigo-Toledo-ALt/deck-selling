import React from 'react';
import { MessageCircle, Heart, Eye, Share2 } from 'lucide-react';

const DeckHeader: React.FC = () => {
    return (
        <div className="relative w-full min-h-[200px]  overflow-hidden bg-[url('/src/lib/commanderExample.jpeg')] bg-no-repeat bg-cover rounded-lg">
            {/* Overlay púrpura - ESTO ES LO QUE TE FALTA */}
            <div className="absolute inset-0 z-10 bg-gradient-to-r from-secondary via-secondary to-slate-800/10"></div>
            {/* Background decorative elements */}


            {/* Replace with your image path [ESTO SE LE DEBE PASAR AL COMPONENTE COMO PARÁMETRO]*/}
            <div className=" absolute left-1/2 top-0 w-1/2 h-full overflow-hidden z-0">
                <img
                    src="/src/lib/commanderExample.jpeg"
                    alt="Commander artwork"
                    className="deckheader-image min-w-full min-h-full object-cover "
                    fetchPriority="high"
                />
            </div>

            {/* Main content */}
            <div className="relative z-10 px-6 py-8">
                {/* Logo and brand */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                        <span className="text-white font-bold text-lg">G</span>
                    </div>
                    <span className="text-white/80 text-lg font-medium">Gabrielchus</span>
                </div>

                {/* Main title */}
                <h1 className="text-5xl font-bold text-gradient mb-4 tracking-tight ">
                    Moira cachonda
                </h1>

                {/* Tags */}
                <div className="flex gap-3 mb-6">
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm font-medium border border-white/30">
            COMMANDER
          </span>
                </div>

            </div>


        </div>
    );
};

export default DeckHeader;