import type { MetadataRoute } from 'next'
import { seriesSlug } from '@/lib/slug'
import { getSeries } from '@/lib/seriesData'
import { supabase } from '@/lib/supabaseClient'

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://leonhong.art')

async function getEventsForSitemap(): Promise<
  { id: string; created_at: string; cover_image_url?: string | null }[]
> {
  try {
    const { data, error } = await supabase
      .from('exhibitions')
      .select('id, created_at, cover_image_url')
      .order('start_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}

function absoluteImageUrl(url: string): string {
  return url.startsWith('http') ? url : `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

/** Indexable artwork IDs per series (for series page image sitemap). */
async function getIndexableArtworkIdsBySeries(
  seriesIds: string[]
): Promise<Record<string, string[]>> {
  const out: Record<string, string[]> = {}
  if (seriesIds.length === 0) return out
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('id, series_id')
      .in('series_id', seriesIds)
      .not('image_url', 'is', null)
      .or('no_image_index.eq.false,no_image_index.is.null')
    if (error) return out
    for (const row of data ?? []) {
      if (row.series_id) {
        if (!out[row.series_id]) out[row.series_id] = []
        out[row.series_id].push(row.id)
      }
    }
  } catch {
    // ignore
  }
  return out
}

function imageUrlForArtwork(id: string): string {
  return `${BASE_URL}/api/image?id=${encodeURIComponent(id)}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const series = await getSeries(true)
  const [events, indexableBySeries] = await Promise.all([
    getEventsForSitemap(),
    getIndexableArtworkIdsBySeries(series.map((s) => s.id)),
  ])
  const now = new Date()

  const staticZh: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/series`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/events`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ]

  const staticEn: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/en`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/en/series`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/en/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/en/events`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/en/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ]

  const seriesPages: MetadataRoute.Sitemap = series.map((s) => {
    const ids = indexableBySeries[s.id] ?? []
    const images = ids.length > 0 ? ids.map((id) => imageUrlForArtwork(id)) : undefined
    return {
      url: `${BASE_URL}/series/${seriesSlug(s)}`,
      lastModified: new Date(s.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      ...(images && { images }),
    }
  })

  const seriesPagesEn: MetadataRoute.Sitemap = series.map((s) => {
    const ids = indexableBySeries[s.id] ?? []
    const images = ids.length > 0 ? ids.map((id) => imageUrlForArtwork(id)) : undefined
    return {
      url: `${BASE_URL}/en/series/${seriesSlug(s)}`,
      lastModified: new Date(s.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
      ...(images && { images }),
    }
  })

  const eventPages: MetadataRoute.Sitemap = events.map((e) => {
    const images =
      e.cover_image_url && e.cover_image_url.trim()
        ? [absoluteImageUrl(e.cover_image_url.trim())]
        : undefined
    return {
      url: `${BASE_URL}/events/${e.id}`,
      lastModified: new Date(e.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
      ...(images && { images }),
    }
  })

  const eventPagesEn: MetadataRoute.Sitemap = events.map((e) => {
    const images =
      e.cover_image_url && e.cover_image_url.trim()
        ? [absoluteImageUrl(e.cover_image_url.trim())]
        : undefined
    return {
      url: `${BASE_URL}/en/events/${e.id}`,
      lastModified: new Date(e.created_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
      ...(images && { images }),
    }
  })

  return [...staticZh, ...staticEn, ...seriesPages, ...seriesPagesEn, ...eventPages, ...eventPagesEn]
}
