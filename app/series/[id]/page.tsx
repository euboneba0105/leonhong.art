export const dynamic = 'force-dynamic'
export const revalidate = 0

import { supabase, type Artwork, type Series } from '@/lib/supabaseClient'
import { notFound } from 'next/navigation'
import SeriesDetailContent from '@/components/SeriesDetailContent'

async function getSeriesById(id: string): Promise<Series | null> {
  if (id === 'standalone') return null
  const { data, error } = await supabase
    .from('series')
    .select('*')
    .eq('id', id)
    .single()
  if (error || !data) return null
  return data
}

async function getArtworksBySeries(seriesId: string | null): Promise<Artwork[]> {
  let query = supabase.from('artworks').select('*')

  if (seriesId) {
    query = query.eq('series_id', seriesId)
  } else {
    query = query.is('series_id', null)
  }

  const { data } = await query
    .order('year', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  return data || []
}

async function getAllSeries(): Promise<Series[]> {
  const { data } = await supabase
    .from('series')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const isStandalone = id === 'standalone'

  if (!isStandalone) {
    const series = await getSeriesById(id)
    if (!series) notFound()
  }

  const series = isStandalone ? null : await getSeriesById(id)
  const artworks = await getArtworksBySeries(isStandalone ? null : id)
  const allSeries = await getAllSeries()

  return (
    <SeriesDetailContent
      series={series}
      artworks={artworks}
      seriesList={allSeries}
      isStandalone={isStandalone}
    />
  )
}
