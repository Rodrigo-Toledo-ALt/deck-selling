// utils/mana.tsx
// Helper pequeño para renderizar coste de maná en forma de iconos (usa mana-font).

import React from 'react';

export function renderManaCost(manaCost: string) {
    // Si no hay coste, no renderizamos nada
    if (!manaCost) return null;

    // Extrae símbolos entre llaves, p. ej. "{1}{U}{B/P}" -> ["{1}", "{U}", "{B/P}"]
    const symbols = manaCost.match(/\{(.*?)\}/g) || [];

    // Convierte el contenido bruto del símbolo a la clase de mana-font:
    // quita slashes y pasa a minúsculas (ej: "B/P" -> "bp")
    const toMsCode = (raw: string): string =>
        raw.replace(/\//g, '').toLowerCase();

    // Mapea cada símbolo a un <i> con las clases esperadas por la librería de iconos
    return symbols.map((symbol, i) => {
        const raw = symbol.replace(/[{}]/g, ''); // "U", "1", "B/P", etc.
        const msCode = toMsCode(raw);

        return (
            <i
                key={i}
                className={`ms ms-cost ms-${msCode} mr-0.5 align-middle`}
                title={raw}
            />
        );
    });
}