import { supabase } from '@/lib/supabaseClient'
import type { Artwork, Series } from '@/lib/supabaseClient'

export type HomepageArtwork = Pick<Artwork, 'id' | 'title' | 'title_en'>

export type HomepageData = {
  carouselArtworks: HomepageArtwork[]
  /** series id -> artwork id for cover thumbnail */
  coverBySeriesId: Record<string, string>
}

/**
 * Fetch only the artworks needed for the homepage: carousel items + one cover per series.
 * Avoids loading all artworks with tags (used for series list thumbnails).
 */
export async function getHomepageArtworks(
  carouselIds: string[],
  seriesList: Series[]
): Promise<HomepageData> {
  const seriesIds = seriesList.map((s) => s.id)
  const coverImageIds = seriesList.map((s) => s.cover_image_id).filter(Boolean) as string[]
  const allIds = [...new Set([...carouselIds, ...coverImageIds])]

  try {
    const byId = new Map<string, { id: string; series_id?: string; title: string; title_en?: string }>()
    let listBySeries: { id: string; series_id: string }[] = []

    // Query 1: carousel + explicit cover image ids (small set, no tags)
    if (allIds.length > 0) {
      const { data: rows, error } = await supabase
        .from('artworks')
        .select('id, series_id, title, title_en')
        .in('id', allIds)
      if (!error && rows) {
        for (const r of rows) {
          byId.set(r.id, r)
        }
      }
    }

    // Query 2: one artwork per series for those without cover_image_id (for cover fallback)
    if (seriesIds.length > 0) {
      const { data: rows, error } = await supabase
        .from('artworks')
        .select('id, series_id')
        .in('series_id', seriesIds)
        .order('year', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
      if (!error && rows) {
        listBySeries = rows
      }
    }

    // Carousel: keep order of carouselIds
    const carouselArtworks: HomepageArtwork[] = carouselIds
      .map((id) => byId.get(id))
      .filter(Boolean)
      .map((r) => ({ id: r!.id, title: r!.title, title_en: r!.title_en }))

    // Covers: use series.cover_image_id when set, else first artwork in series
    const coverBySeriesId: Record<string, string> = {}
    for (const s of seriesList) {
      if (s.cover_image_id) {
        coverBySeriesId[s.id] = s.cover_image_id
      } else {
        const first = listBySeries.find((r) => r.series_id === s.id)
        if (first) coverBySeriesId[s.id] = first.id
      }
    }

    return { carouselArtworks, coverBySeriesId }
  } catch (e) {
    console.error('getHomepageArtworks:', e)
    return { carouselArtworks: [], coverBySeriesId: {} }
  }
}
