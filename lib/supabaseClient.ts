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

export type Series = {
  id: string
  name: string          // 系列名稱 (zh)
  name_en?: string      // 系列名稱 (en)
  description?: string  // 敘述 (zh)
  description_en?: string // 敘述 (en)
  sort_order: number
  created_at: string
}

export type Artwork = {
  id: string
  title: string          // 作品名稱 (zh)
  title_en?: string      // 作品名稱 (en)
  series_id?: string     // 系列 (FK to series)
  year?: number          // 年份
  medium?: string        // 媒材 (zh)
  medium_en?: string     // 媒材 (en)
  size?: string          // 尺寸
  description?: string   // 敘述 (zh)
  description_en?: string // 敘述 (en)
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
  year?: number          // 年份
  title: string          // 展覽名稱 (zh)
  title_en?: string      // 展覽名稱 (en)
  venue?: string         // 場地空間 (zh)
  venue_en?: string      // 場地空間 (en)
  region?: string        // 地區 (zh)
  region_en?: string     // 地區 (en)
  sort_order: number
  created_at: string
}

export type Award = {
  id: string
  year?: number          // 年份
  name: string           // 獎項名稱 (zh)
  name_en?: string       // 獎項名稱 (en)
  category: string       // 競賽類別 (zh)
  category_en?: string   // 競賽類別 (en)
  award: string          // 獎項 (zh)
  award_en?: string      // 獎項 (en)
  sort_order: number
  created_at: string
}
