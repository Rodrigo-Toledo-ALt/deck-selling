// utils.ts
// Funciones de utilidad reutilizables en toda la aplicación.

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases CSS condicionalmente.
 * Útil para aplicar estilos Tailwind dinámicamente en componentes.
 *
 * Ejemplo:
 *   cn("text-red-500", isActive && "font-bold", className)
 *   // Devuelve: "text-red-500 font-bold ..." si isActive es true
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}