// ImageFlip.tsx
// Componente reutilizable para mostrar dos imágenes que se "dan la vuelta" al hacer clic.
// Útil para cartas de Magic (anverso/retro) o productos con vista frontal/posterior.
// Soporta control interno o externo del estado de giro.

import { useState } from "react";

interface ImageFlipProps {
    frontImage: string;      // URL de la imagen frontal
    backImage: string;       // URL de la imagen trasera
    alt1?: string;           // Texto alternativo para la imagen frontal
    alt2?: string;           // Texto alternativo para la imagen trasera
    className?: string;      // Clases CSS adicionales para el contenedor
    duration?: string;       // Duración de la animación (ej: "duration-500")
    isFlipped?: boolean;     // Control externo del estado (controlled)
    onToggle?: () => void;   // Callback al hacer clic (para modo controlled)
}

const ImageFlip: React.FC<ImageFlipProps> = ({
                                                 frontImage,
                                                 backImage,
                                                 alt1 = "",
                                                 alt2 = "",
                                                 className = "",
                                                 duration = "duration-700",
                                                 isFlipped,
                                                 onToggle,
                                             }) => {
    // Estado interno para manejar el giro cuando no se pasa isFlipped
    const [internalFlip, setInternalFlip] = useState(false);

    // Decide si usar estado interno o prop externa
    const flipped = isFlipped ?? internalFlip;

    // Alterna el estado al hacer clic
    const handleFlip = () => {
        // Si isFlipped no se pasó, usamos estado interno
        if (isFlipped === undefined) {
            setInternalFlip((v) => !v);
        } else {
            // Si está controlado, llamamos al callback
            onToggle?.();
        }
    };

    return (
        // Contenedor con perspectiva 3D para la animación
        <div className={`perspective-1000 ${className}`}>
            {/* Elemento giratorio con transición suave */}
            <div
                className={`
                    relative w-full h-full transform-style-preserve-3d transition-transform ${duration} ease-in-out cursor-pointer
                    ${flipped ? "rotate-y-180" : ""}
                `}
                onClick={handleFlip}
            >
                {/* Cara frontal de la imagen */}
                <div className="absolute inset-0 w-full h-full backface-hidden">
                    <img
                        src={frontImage}
                        alt={alt1}
                        className="w-full h-full object-contain rounded-lg shadow-lg"
                        draggable={false}
                        loading="eager"
                        decoding="async"
                    />
                </div>

                {/* Cara trasera (rotada 180 grados) */}
                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                    <img
                        src={backImage}
                        alt={alt2}
                        className="w-full h-full object-contain rounded-lg shadow-lg"
                        draggable={false}
                        loading="eager"
                        decoding="async"
                    />
                </div>
            </div>
        </div>
    );
};

export default ImageFlip;