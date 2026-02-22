import type { MetadataRoute } from 'next'
import { supabase } from '@/lib/supabaseClient'
import { seriesSlug } from '@/lib/slug'
import type { Series } from '@/lib/supabaseClient'

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://leonhong.art')

async function getSeries(): Promise<Series[]> {
  try {
    const { data, error } = await supabase
      .from('series')
      .select('id, name, name_en, sort_order, created_at')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })
    if (error) return []
    return data || []
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const series = await getSeries()
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/series`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/events`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
  ]

  const seriesPages: MetadataRoute.Sitemap = series.map((s) => ({
    url: `${BASE_URL}/series/${seriesSlug(s)}`,
    lastModified: new Date(s.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...seriesPages]
}
