import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Provide a safe fallback during build/time when env vars are not set.
// This avoids throwing at import-time which breaks static builds on CI.
let supabase: any

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  // Minimal stub that supports the chained calls used in this project.
  const stub = {
    from: (_table: string) => ({
      select: (_cols?: string) => ({
        order: (_col: string, _opts?: any) => Promise.resolve({ data: [], error: null })
      })
    })
  }
  supabase = stub
}

export { supabase }

export type Artwork = {
  id: string
  title: string
  year?: number
  medium?: string
  size?: string
  description?: string
  image_url?: string
  sort_order: number
  created_at: string
}

export type Experience = {
  id: string
  year: number
  title: string
  title_en?: string
  category: string
  category_en?: string
  description?: string
  description_en?: string
  sort_order: number
  created_at: string
}

export type Exhibition = {
  id: string
  title: string
  title_en?: string
  description?: string
  description_en?: string
  cover_image_url?: string
  start_date?: string
  end_date?: string
  location?: string
  location_en?: string
  location_url?: string
  sort_order: number
  created_at: string
}
