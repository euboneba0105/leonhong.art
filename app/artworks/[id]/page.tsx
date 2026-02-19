export const dynamic = 'force-dynamic'
export const revalidate = 0

import { supabase, type Artwork, type Series, type Tag } from '@/lib/supabaseClient'
import { notFound } from 'next/navigation'
import ArtworkDetailContent from '@/components/ArtworkDetailContent'

async function getArtwork(id: string): Promise<Artwork | null> {
  const { data, error } = await supabase
    .from('artworks')
    .select('*, artwork_tags(tags(id, name, name_en))')
    .eq('id', id)
    .single()

  if (error || !data) return null
  const { artwork_tags, ...rest } = data as any
  return {
    ...rest,
    tags: (artwork_tags || []).map((at: any) => at.tags).filter(Boolean),
  }
}

async function getSeries(): Promise<Series[]> {
  const { data } = await supabase
    .from('series')
    .select('*')
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

export default async function ArtworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const artwork = await getArtwork(id)
  if (!artwork) notFound()

  const seriesList = await getSeries()
  const allTags = await getTags()

  return <ArtworkDetailContent artwork={artwork} seriesList={seriesList} allTags={allTags} />
}
