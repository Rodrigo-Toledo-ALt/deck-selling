import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop({ behavior = 'auto' }) {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior });
    }, [pathname, behavior]);

    return null;
}

export default ScrollToTop;