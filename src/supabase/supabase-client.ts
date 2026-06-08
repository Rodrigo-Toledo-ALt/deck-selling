// supabase-client.ts
// Cliente de Supabase configurado con variables de entorno. Es el punto de entrada para todas las operaciones.

import { createClient } from '@supabase/supabase-js';

// Carga de variables de entorno (desde .env.local o .env)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log para depuración (borra en producción)
console.log('→ import.meta.env.VITE_SUPABASE_URL:', SUPABASE_URL ? '[SET]' : SUPABASE_URL);
console.log('→ import.meta.env.VITE_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? '[SET]' : SUPABASE_ANON_KEY);

// Comprobación explícita para evitar crash silencioso
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('Missing Supabase env variables. Make sure .env contains VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY at project root.');
    throw new Error('VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are required. Restart dev server after adding them.');
}

// Creación del cliente global de Supabase (se reutiliza en toda la app)
export const supabase = createClient(String(SUPABASE_URL), String(SUPABASE_ANON_KEY));