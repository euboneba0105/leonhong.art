export const dynamic = 'force-dynamic'
export const revalidate = 0

import { supabase, type Artwork, type Series, type Tag } from '@/lib/supabaseClient'
import { artworkWithProxyUrl } from '@/lib/imageProxy'
import { redirect } from 'next/navigation'
import { seriesSlug } from '@/lib/slug'
import SeriesDetailContent from '@/components/SeriesDetailContent'

function attachTags(rows: any[]): Artwork[] {
  return (rows || []).map(({ artwork_tags, ...rest }) => ({
    ...rest,
    tags: (artwork_tags || []).map((at: any) => at.tags).filter(Boolean),
  }))
}

async function getSeriesById(id: string): Promise<Series | null> {
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data
}

async function getSeriesBySlug(slug: string): Promise<Series | null> {
  const { data: list } = await supabase
    .from('series')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  const found = (list || []).find((s: Series) => seriesSlug(s) === slug)
  return found ?? null
}

async function getArtworksBySeries(seriesId: string | null): Promise<Artwork[]> {
  let query = supabase.from('artworks').select('*, artwork_tags(tags(id, name, name_en))')

  if (seriesId) {
    query = query.eq('series_id', seriesId)
  } else {
    query = query.is('series_id', null)
  }

  const { data } = await query
    .order('year', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  return attachTags(data).map(artworkWithProxyUrl)
}

async function getAllSeries(): Promise<Series[]> {
  const { data } = await supabase
    .from('series')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  return data || []
}

async function getTags(): Promise<Tag[]> {
  try {
    const { data } = await supabase
      .from('tags')
      .select('*')
      .order('name', { ascending: true })
    return data || []
  } catch {
    return []
  }
}

async function getSeriesForSegment(segment: string): Promise<Series | null> {
  if (segment === 'standalone') return null
  const byId = await getSeriesById(segment)
  if (byId) return byId
  return getSeriesBySlug(segment)
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params
  const segment = resolved?.id?.trim()
  if (!segment) return { title: 'Series' }
  if (segment === 'standalone') {
    return { title: 'Standalone' }
  }
  const series = await getSeriesForSegment(segment)
  const name = series ? (series.name_en || series.name) : 'Series'
  return { title: name }
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params
  const segment = resolved?.id?.trim()
  if (!segment) {
    redirect('/series')
  }
  const isStandalone = segment === 'standalone'

  let series: Series | null = null
  if (!isStandalone) {
    series = await getSeriesById(segment)
    if (series && seriesSlug(series) !== segment) {
      redirect(`/series/${seriesSlug(series)}`)
    }
    if (!series) {
      series = await getSeriesBySlug(segment)
    }
    if (!series) {
      redirect('/series')
    }
  }

  const seriesId = series?.id ?? null
  const artworks = await getArtworksBySeries(seriesId)
  const allSeries = await getAllSeries()
  const allTags = await getTags()

  return (
    <SeriesDetailContent
      series={series}
      artworks={artworks}
      seriesList={allSeries}
      allTags={allTags}
      isStandalone={isStandalone}
      currentSlug={segment}
    />
  )
}
