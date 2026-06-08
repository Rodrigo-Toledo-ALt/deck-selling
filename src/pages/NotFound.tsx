// NotFound.tsx
// Página 404 simple: muestra mensaje y registra en consola la ruta inválida.

import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  // Loguea la ruta que provocó el 404 (útil para debug)
  useEffect(() => {
    console.error(
        "404 Error: User attempted to access non-existent route:",
        location.pathname
    );
  }, [location.pathname]);

  // UI mínima: código, mensaje y enlace a home
  return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-4">Oops! Page not found</p>
          <a href="/" className="text-blue-500 hover:text-blue-700 underline">
            Return to Home
          </a>
        </div>
      </div>
  );
};

export default NotFound;