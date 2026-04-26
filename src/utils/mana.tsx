import React from 'react';

export function renderManaCost(manaCost: string) {
    if (!manaCost) return null;

    const symbols = manaCost.match(/\{(.*?)\}/g) || [];

    const toMsCode = (raw: string): string =>
        raw.replace(/\//g, '').toLowerCase();

    return symbols.map((symbol, i) => {
        const raw = symbol.replace(/[{}]/g, '');
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