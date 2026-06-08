// ScrollToTop.tsx
// Componente utilitario que fuerza el scroll a la parte superior de la página
// cada vez que cambia la ruta (por ejemplo, al navegar entre páginas).
// Útil para evitar que el usuario se mantenga en una posición de scroll baja
// al cambiar de página en una SPA (Single Page Application).

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Propiedades aceptadas por el componente
interface ScrollToTopProps {
    // Define cómo se realiza el desplazamiento: 'auto' (instantáneo) o 'smooth' (animado)
    behavior?: ScrollBehavior;
}

/**
 * Componente que scrollea la ventana hacia arriba cada vez que cambia la ruta.
 */
function ScrollToTop({ behavior = 'auto' }: ScrollToTopProps) {
    // Obtiene la ubicación actual (ruta) de React Router
    const { pathname } = useLocation();

    // Efecto que se ejecuta cada vez que cambia la ruta
    useEffect(() => {
        // Realiza el scroll hacia arriba con el comportamiento indicado
        window.scrollTo({ top: 0, left: 0, behavior });
    }, [pathname, behavior]); // Dependencias: se vuelve a ejecutar si cambia la ruta o el comportamiento

    // Este componente no renderiza nada en el DOM
    return null;
}

export default ScrollToTop;