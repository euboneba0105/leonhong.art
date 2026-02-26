import { supabase, type Series } from '@/lib/supabaseClient'

/**
 * Fetch series list. When publicOnly is true (default), only returns series with is_public = true.
 */
export async function getSeries(publicOnly = true): Promise<Series[]> {
  try {
    let query = supabase
      .from('series')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
    if (publicOnly) {
      query = query.eq('is_public', true)
    }
    const { data, error } = await query
    if (error) return []
    return data || []
  } catch {
    return []
  }
}

/**
 * Fetch only cover artwork ids for each series (for list page). One lightweight query instead of all artworks.
 * Returns map of seriesId -> artworkId for building thumbnails.
 */
export async function getSeriesCoverArtworkIds(
  seriesList: Series[]
): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  for (const s of seriesList) {
    if (s.cover_image_id) result[s.id] = s.cover_image_id
  }
  const seriesIdsWithoutCover = seriesList.filter((s) => !s.cover_image_id).map((s) => s.id)
  if (seriesIdsWithoutCover.length === 0) return result

  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('id, series_id')
      .in('series_id', seriesIdsWithoutCover)
      .order('created_at', { ascending: false })

    if (error) return result
    const rows = data || []
    for (const row of rows) {
      if (row.series_id && !(row.series_id in result)) result[row.series_id] = row.id
    }
  } catch {
    // ignore
  }
  return result
}
