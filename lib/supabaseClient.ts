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
  cover_image_id?: string
  /** 排列順序，數字越小越前面 */
  sort_order?: number | null
  /** 是否公開顯示；未勾選時僅在 admin 登入後可見 */
  is_public?: boolean
  created_at: string
}

// ---- 媒材標籤 Tags ----
export type Tag = {
  id: string
  name: string
  name_en?: string
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
  /** 作品狀態：available=開放收藏, private_collection=私人收藏, reserved=已預定, acquired=已被典藏 */
  status?: 'available' | 'private_collection' | 'reserved' | 'acquired'
  medium?: string
  medium_en?: string
  size?: string
  description?: string
  description_en?: string
  /** 為 true 時，圖片 API 會送出 X-Robots-Tag: noindex，阻擋 Google 將此圖編入搜尋。預設 false。 */
  no_image_index?: boolean
  tags?: Tag[]
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
export type CvExhibitionType = 'solo' | 'group' // 個展 | 聯展

export type CvExhibition = {
  id: string
  year: number
  title: string
  title_en?: string
  venue?: string | null
  venue_en?: string | null
  region: string
  region_en?: string
  /** solo=個展, group=聯展；若 DB 尚未 migration 可能為 undefined，前端預設為 group */
  exhibition_type?: CvExhibitionType
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
