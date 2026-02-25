import type { MetadataRoute } from 'next'
import { seriesSlug } from '@/lib/slug'
import { getSeries } from '@/lib/seriesData'
import { supabase } from '@/lib/supabaseClient'

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://leonhong.art')

async function getEventIdsForSitemap(): Promise<{ id: string; created_at: string }[]> {
  try {
    const { data, error } = await supabase
      .from('exhibitions')
      .select('id, created_at')
      .order('start_date', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })
    if (error) return []
    return data ?? []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [series, events] = await Promise.all([getSeries(true), getEventIdsForSitemap()])
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

  const standaloneZh = { url: `${BASE_URL}/series/standalone`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 }
  const standaloneEn = { url: `${BASE_URL}/en/series/standalone`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.8 }

  const seriesPages: MetadataRoute.Sitemap = series.map((s) => ({
    url: `${BASE_URL}/series/${seriesSlug(s)}`,
    lastModified: new Date(s.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const seriesPagesEn: MetadataRoute.Sitemap = series.map((s) => ({
    url: `${BASE_URL}/en/series/${seriesSlug(s)}`,
    lastModified: new Date(s.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const eventPages: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${BASE_URL}/events/${e.id}`,
    lastModified: new Date(e.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  const eventPagesEn: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${BASE_URL}/en/events/${e.id}`,
    lastModified: new Date(e.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticZh, ...staticEn, standaloneZh, standaloneEn, ...seriesPages, ...seriesPagesEn, ...eventPages, ...eventPagesEn]
}
