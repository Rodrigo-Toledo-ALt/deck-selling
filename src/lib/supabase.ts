import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key'
)

// Database types - will be updated once you connect your Supabase
export interface Database {
  public: {
    Tables: {
      products: {
        Row: {
          id: string
          name: string
          description: string
          price: number
          deck_cards: any
          main_image_url: string
          colors: string[]
          format: string
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