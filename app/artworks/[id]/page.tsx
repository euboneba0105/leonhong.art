export const dynamic = 'force-dynamic'
export const revalidate = 0

import { supabase, type Artwork, type Series } from '@/lib/supabaseClient'
import { notFound } from 'next/navigation'
import ArtworkDetailContent from '@/components/ArtworkDetailContent'

async function getArtwork(id: string): Promise<Artwork | null> {
  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) return null
  return data
}

async function getSeries(): Promise<Series[]> {
  const { data } = await supabase
    .from('series')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function ArtworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const artwork = await getArtwork(id)
  if (!artwork) notFound()

  const seriesList = await getSeries()

  return <ArtworkDetailContent artwork={artwork} seriesList={seriesList} />
}
