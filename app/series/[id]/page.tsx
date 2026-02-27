export const dynamic = 'force-dynamic'
export const revalidate = 0

import { getServerSession } from 'next-auth'
import { authOptions, ADMIN_EMAILS } from '@/lib/auth'
import { supabase, type Artwork, type Series, type Tag } from '@/lib/supabaseClient'
import { artworkWithProxyUrl } from '@/lib/imageProxy'
import { redirect } from 'next/navigation'
import { seriesSlug } from '@/lib/slug'
import { alternatesFor } from '@/lib/locale'
import SeriesDetailContent from '@/components/SeriesDetailContent'

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
  const zhPath = segment ? `/series/${segment}` : '/series'
  if (!segment) return { title: '作品集', alternates: alternatesFor('/series') }
  if (segment === 'standalone') {
    return { title: '獨立作品', alternates: alternatesFor(zhPath) }
  }
  const series = await getSeriesForSegment(segment, true)
  const name = series ? (series.name || series.name_en) : '作品集'
  return { title: name, alternates: alternatesFor(zhPath) }
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params
  const segment = resolved?.id?.trim()
  if (!segment) {
    redirect('/series')
  }
  const session = await getServerSession(authOptions)
  const isAdmin = !!(session?.user?.email && ADMIN_EMAILS.includes(session.user.email))
  const publicOnly = !isAdmin
  const isStandalone = segment === 'standalone'

  let series: Series | null = null
  if (!isStandalone) {
    series = await getSeriesById(segment, publicOnly)
    if (series && seriesSlug(series) !== segment) {
      redirect(`/series/${seriesSlug(series)}`)
    }
    if (!series) {
      series = await getSeriesBySlug(segment, publicOnly)
    }
    if (!series) {
      redirect('/series')
    }
  }

  const seriesId = series?.id ?? null
  const [artworks, allSeries, allTags] = await Promise.all([
    getArtworksBySeries(seriesId),
    getAllSeries(publicOnly),
    isAdmin ? getTags() : Promise.resolve([]),
  ])

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
