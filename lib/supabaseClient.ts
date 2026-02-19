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
  const orderChain: any = {
    order: (_col: string, _opts?: any) => orderChain,
    then: (resolve: any) => resolve({ data: [], error: null }),
  }
  const stub = {
    from: (_table: string) => ({
      select: (_cols?: string) => orderChain
    })
  }
  supabase = stub
}

export { supabase }

// ---- 系列 Series ----
export type Series = {
  id: string
  name: string
  name_en?: string
  description?: string
  description_en?: string
  created_at: string
}

// ---- 作品 Artworks ----
export type Artwork = {
  id: string
  image_url?: string
  title: string
  title_en?: string
  series_id?: string
  year?: number
  medium?: string
  medium_en?: string
  size?: string
  description?: string
  description_en?: string
  created_at: string
}

// ---- 獲獎 Awards ----
export type Award = {
  id: string
  year: number
  name: string
  name_en?: string
  competition?: string | null
  competition_en?: string | null
  prize: string
  prize_en?: string
  created_at: string
}

// ---- 展覽 CV Exhibitions (About page) ----
export type CvExhibition = {
  id: string
  year: number
  title: string
  title_en?: string
  venue?: string | null
  venue_en?: string | null
  region: string
  region_en?: string
  created_at: string
}

// ---- 活動 Events (保持原樣) ----
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

// ---- 活動花絮照片 Event Gallery Photos ----
export type EventGalleryPhoto = {
  id: string
  exhibition_id: string
  image_url: string
  sort_order: number
  created_at: string
}
