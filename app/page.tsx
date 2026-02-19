export const dynamic = 'force-dynamic'
export const revalidate = 0

import { supabase, type Artwork, type Series } from '@/lib/supabaseClient'
import ArtworksContent from '@/components/ArtworksContent'

async function getArtworks(): Promise<Artwork[]> {
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('year', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      throw new Error('Failed to fetch artworks')
    }

    return data || []
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
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error (series):', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching series:', error)
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

  return <ArtworksContent artworks={artworks} seriesList={seriesList} error={error} />
}
