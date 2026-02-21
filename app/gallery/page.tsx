export const dynamic = 'force-dynamic'
export const revalidate = 0

import { supabase, type Artwork, type Series, type Tag } from '@/lib/supabaseClient'
import { artworkWithProxyUrl } from '@/lib/imageProxy'
import ArtworksContent from '@/components/ArtworksContent'

function attachTags(rows: any[]): Artwork[] {
  return (rows || []).map(({ artwork_tags, ...rest }) => ({
    ...rest,
    tags: (artwork_tags || []).map((at: any) => at.tags).filter(Boolean),
  }))
}

async function getArtworks(): Promise<Artwork[]> {
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*, artwork_tags(tags(id, name, name_en))')
      .order('year', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw new Error('Failed to fetch artworks')
    }

    return attachTags(data).map(artworkWithProxyUrl)
  } catch (error) {
    console.error('Error fetching artworks:', error)
    throw error
  }
}

async function getSeries(): Promise<Series[]> {
  try {
    const { data, error } = await supabase
      .from('series')
      .select('*')
      .order('sort_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) return []
    return data || []
  } catch {
    return []
  }
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

export const metadata = {
  title: 'Gallery — Leon Hong',
  description: 'Browse the collection of original artworks by Leon Hong.',
}

export default async function GalleryPage() {
  let artworks: Artwork[] = []
  let error: string | null = null

  try {
    artworks = await getArtworks()
  } catch (err) {
    error = 'Failed to load artworks. Please try again later.'
    console.error(err)
  }

  const seriesList = await getSeries()
  const allTags = await getTags()

  return <ArtworksContent artworks={artworks} seriesList={seriesList} allTags={allTags} error={error} />
}
