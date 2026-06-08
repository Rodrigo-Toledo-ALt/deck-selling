// supabase.ts
// Configura el cliente de Supabase para el frontend.
// Utiliza las variables de entorno para conectarse al proyecto.

import { createClient } from '@supabase/supabase-js'

// ── CONFIGURACIÓN ───────────────────────────────────────────────────────

// URL del proyecto Supabase (ej: https://xxxxx.supabase.co)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL

// Clave pública del proyecto (anon key)
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Advertencia si faltan variables de entorno
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

// ── CLIENTE SUPABASE ────────────────────────────────────────────────────

// Crea e importa el cliente Supabase para toda la app
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
)

// ── TIPOS DE BASE DE DATOS ──────────────────────────────────────────────

// Definición de tipos para tablas de la base de datos.
// Se pueden generar automáticamente usando el CLI de Supabase.
export interface Database {
  public: {
    Tables: {
      // Ejemplo de definición de tabla 'products'
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          deck_cards: any // JSON con datos del mazo
          main_image_url: string
          colors: string[] // Colores del mazo
          format: string   // Formato (ej: Commander)
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          price: number
          deck_cards?: any
          main_image_url: string
          colors: string[]
          format: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          price?: number
          deck_cards?: any
          main_image_url?: string
          colors?: string[]
          format?: string
        }
      }
    }
  }
}