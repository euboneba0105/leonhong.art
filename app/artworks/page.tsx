export const dynamic = 'force-dynamic'
export const revalidate = 0

import { supabase, type Artwork } from '@/lib/supabaseClient'
import ArtworksContent from '@/components/ArtworksContent'

async function getArtworks(): Promise<Artwork[]> {
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('sort_order', { ascending: true })

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

export const metadata = {
  title: 'Artworks Gallery',
  description: 'Browse the collection of original artworks.',
}

export default async function ArtworksPage() {
  let artworks: Artwork[] = []
  let error: string | null = null

  try {
    artworks = await getArtworks()
  } catch (err) {
    error = 'Failed to load artworks. Please try again later.'
    console.error(err)
  }

  return <ArtworksContent artworks={artworks} error={error} />
}
