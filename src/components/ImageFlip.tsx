import { useState } from "react";

interface ImageFlipProps {
    frontImage: string;
    backImage: string;
    alt1?: string;
    alt2?: string;
    className?: string;
    duration?: string; // "duration-700"
    isFlipped?: boolean; // control externo
    onToggle?: () => void; // callback si quieres manejar el click desde fuera
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
    const [internalFlip, setInternalFlip] = useState(false);
    const flipped = isFlipped ?? internalFlip;

    const handleFlip = () => {
        if (isFlipped === undefined) {
            setInternalFlip((v) => !v);
        } else {
            onToggle?.();
        }
    };

    return (
        <div className={`perspective-1000 ${className}`}>
            <div
                className={`
          relative w-full h-full transform-style-preserve-3d transition-transform ${duration} ease-in-out cursor-pointer
          ${flipped ? "rotate-y-180" : ""}
        `}
                onClick={handleFlip}
            >
                <div className="absolute inset-0 w-full h-full backface-hidden">
                    <img
                        src={frontImage}
                        alt={alt1}
                        className="w-full h-full object-cover rounded-lg shadow-lg"
                        draggable={false}
                    />
                </div>

                <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                    <img
                        src={backImage}
                        alt={alt2}
                        className="w-full h-full object-cover rounded-lg shadow-lg"
                        draggable={false}
                    />
                </div>
            </div>
        </div>
    );
};

export default ImageFlip;