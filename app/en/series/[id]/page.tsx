export const dynamic = 'force-dynamic'
export const revalidate = 0

import { getServerSession } from 'next-auth'
import { authOptions, ADMIN_EMAILS } from '@/lib/auth'
import { supabase, type Artwork, type Series, type Tag } from '@/lib/supabaseClient'
import { artworkWithProxyUrl } from '@/lib/imageProxy'
import { redirect } from 'next/navigation'
import { seriesSlug } from '@/lib/slug'
import SeriesDetailContent from '@/components/SeriesDetailContent'
import { alternatesFor } from '@/lib/locale'

function attachTags(rows: any[]): Artwork[] {
  return (rows || []).map(({ artwork_tags, ...rest }) => ({
    ...rest,
    tags: (artwork_tags || []).map((at: any) => at.tags).filter(Boolean),
  }))
}

async function getSeriesById(id: string, publicOnly: boolean): Promise<Series | null> {
  let query = supabase.from('series').select('*').eq('id', id)
  if (publicOnly) query = query.eq('is_public', true)
  const { data, error } = await query.single()
  if (error || !data) return null
  return data
}

async function getSeriesBySlug(slug: string, publicOnly: boolean): Promise<Series | null> {
  let query = supabase
    .from('series')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (publicOnly) query = query.eq('is_public', true)
  const { data: list } = await query
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

async function getAllSeries(publicOnly: boolean): Promise<Series[]> {
  let query = supabase
    .from('series')
    .select('*')
    .order('sort_order', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (publicOnly) query = query.eq('is_public', true)
  const { data } = await query
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

async function getSeriesForSegment(segment: string, publicOnly: boolean): Promise<Series | null> {
  if (segment === 'standalone') return null
  const byId = await getSeriesById(segment, publicOnly)
  if (byId) return byId
  return getSeriesBySlug(segment, publicOnly)
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params
  const segment = resolved?.id?.trim()
  const enPath = `/en/series/${segment ?? ''}`
  if (!segment) return { title: 'Series', alternates: alternatesFor('/en/series') }
  if (segment === 'standalone') {
    return { title: 'Standalone', alternates: alternatesFor(enPath) }
  }
  const series = await getSeriesForSegment(segment, true)
  const name = series ? (series.name_en || series.name) : 'Series'
  return { title: name, alternates: alternatesFor(enPath) }
}

export default async function EnSeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params
  const segment = resolved?.id?.trim()
  if (!segment) {
    redirect('/en/series')
  }
  const session = await getServerSession(authOptions)
  const isAdmin = !!(session?.user?.email && ADMIN_EMAILS.includes(session.user.email))
  const publicOnly = !isAdmin
  const isStandalone = segment === 'standalone'

  let series: Series | null = null
  if (!isStandalone) {
    series = await getSeriesById(segment, publicOnly)
    if (series && seriesSlug(series) !== segment) {
      redirect(`/en/series/${seriesSlug(series)}`)
    }
    if (!series) {
      series = await getSeriesBySlug(segment, publicOnly)
    }
    if (!series) {
      redirect('/en/series')
    }
  }

  const seriesId = series?.id ?? null
  const artworks = await getArtworksBySeries(seriesId)
  const allSeries = await getAllSeries(publicOnly)
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
