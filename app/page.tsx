export const dynamic = 'force-dynamic'
export const revalidate = 0

import { supabase, type Artwork, type Series } from '@/lib/supabaseClient'
import { artworkWithProxyUrl } from '@/lib/imageProxy'
import HomepageContent from '@/components/HomepageContent'

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

    if (error) throw new Error('Failed to fetch artworks')
    return attachTags(data).map(artworkWithProxyUrl)
  } catch (error) {
    console.error('Error fetching artworks:', error)
    return []
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

async function getCarouselIds(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('homepage_carousel')
      .select('artwork_id')
      .order('display_order', { ascending: true })

    if (error) return []
    return (data || []).map((d: any) => d.artwork_id)
  } catch {
    return []
  }
}

export const metadata = {
  title: 'Leon Hong — Art Portfolio',
  description: 'Explore the art of Leon Hong.',
}

export default async function HomePage() {
  const [artworks, seriesList, carouselIds] = await Promise.all([
    getArtworks(),
    getSeries(),
    getCarouselIds(),
  ])

  return (
    <HomepageContent
      allArtworks={artworks}
      carouselArtworkIds={carouselIds}
      seriesList={seriesList}
    />
  )
}
