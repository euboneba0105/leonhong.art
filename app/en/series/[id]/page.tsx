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

/** Only select columns needed for series detail (omit medium, medium_en to reduce payload). No standalone artworks. */
async function getArtworksBySeries(seriesId: string): Promise<Artwork[]> {
  const cols = 'id, title, title_en, year, size, description, description_en, series_id, created_at, image_url, no_image_index, artwork_tags(tags(id, name, name_en))'
  const { data } = await supabase
    .from('artworks')
    .select(cols)
    .eq('series_id', seriesId)
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

/** Resolve series by id or slug; run both lookups in parallel. */
async function getSeriesForSegment(segment: string, publicOnly: boolean): Promise<Series | null> {
  const [byId, bySlug] = await Promise.all([
    getSeriesById(segment, publicOnly),
    getSeriesBySlug(segment, publicOnly),
  ])
  return byId ?? bySlug
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params
  const segment = resolved?.id?.trim()
  const enPath = `/en/series/${segment ?? ''}`
  if (!segment) return { title: 'Series', alternates: alternatesFor('/en/series') }
  if (segment === 'standalone') return { title: 'Series', alternates: alternatesFor('/en/series') }
  const series = await getSeriesForSegment(segment, true)
  const name = series ? (series.name_en || series.name) : 'Series'
  return { title: name, alternates: alternatesFor(enPath) }
}

export default async function EnSeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolved = await params
  const segment = resolved?.id?.trim()
  if (!segment) redirect('/en/series')
  if (segment === 'standalone') redirect('/en/series')

  const session = await getServerSession(authOptions)
  const isAdmin = !!(session?.user?.email && ADMIN_EMAILS.includes(session.user.email))
  const publicOnly = !isAdmin

  const [byId, bySlug, allSeries] = await Promise.all([
    getSeriesById(segment, publicOnly),
    getSeriesBySlug(segment, publicOnly),
    getAllSeries(publicOnly),
  ])
  const series = byId ?? bySlug
  if (series && seriesSlug(series) !== segment) {
    redirect(`/en/series/${seriesSlug(series)}`)
  }
  if (!series) {
    redirect('/en/series')
  }

  const [artworks, allTags] = await Promise.all([
    getArtworksBySeries(series.id),
    isAdmin ? getTags() : Promise.resolve([]),
  ])

  return (
    <SeriesDetailContent
      series={series}
      artworks={artworks}
      seriesList={allSeries}
      allTags={allTags}
      isStandalone={false}
      currentSlug={segment}
    />
  )
}
