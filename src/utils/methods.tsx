import React from 'react';

export function renderManaCost(manaCost: string) {
    if (!manaCost) return null;

    const symbols = manaCost.match(/\{(.*?)\}/g) || [];

    const getManaBackground = (code: string) => {
        switch (code) {
            case 'w': return 'bg-mtg-white';
            case 'u': return 'bg-mtg-blue';
            case 'b': return 'bg-mtg-black';
            case 'r': return 'bg-mtg-red';
            case 'g': return 'bg-mtg-green';
            default: return 'bg-gray-400';
        }
    };

    return symbols.map((symbol, i) => {
        const code = symbol.replace(/[{}]/g, '').toLowerCase();

        return (
            <span key={i} className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${getManaBackground(code)}`}>
        <i className={`ms ms-${code} text-black text-lg`}></i>
      </span>
        );
    });
}