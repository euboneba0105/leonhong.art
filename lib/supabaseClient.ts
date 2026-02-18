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
        order: (_col: string, _opts?: any) => Promise.resolve({ data: [], error: null }),
        limit: (_n: number) => ({
          single: () => Promise.resolve({ data: null, error: null })
        }),
        single: () => Promise.resolve({ data: null, error: null })
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

export type ArtistProfile = {
  id: string
  name: string
  bio: string
  image_url?: string
  created_at: string
}

export type Experience = {
  id: string
  year: number
  title: string
  category: string
  description?: string
  sort_order: number
  created_at: string
}
