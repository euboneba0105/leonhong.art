export const dynamic = 'force-dynamic'
export const revalidate = 0

import { getServerSession } from 'next-auth'
import { authOptions, ADMIN_EMAILS } from '@/lib/auth'
import { supabase, type Artwork, type Tag } from '@/lib/supabaseClient'
import { getSeries, getSeriesCoverArtworkIds } from '@/lib/seriesData'
import { artworkWithProxyUrl } from '@/lib/imageProxy'
import ArtworksContent from '@/components/ArtworksContent'
import { alternatesFor } from '@/lib/locale'

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
  title: 'Series',
  description: 'Browse original artworks by Leon Hong.',
  alternates: alternatesFor('/en/series'),
}

export default async function EnSeriesPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = !!(session?.user?.email && ADMIN_EMAILS.includes(session.user.email))
  const seriesList = await getSeries(!isAdmin)

  let artworks: Artwork[] = []
  let seriesCovers: Record<string, string> | null = null
  let error: string | null = null

  const [allTags, artworksOrCovers] = await Promise.all([
    getTags(),
    isAdmin
      ? getArtworks()
          .then((a) => ({ artworks: a as Artwork[], seriesCovers: null as Record<string, string> | null }))
          .catch((err) => {
            console.error(err)
            error = 'Failed to load artworks. Please try again later.'
            return { artworks: null, seriesCovers: null }
          })
      : getSeriesCoverArtworkIds(seriesList).then((c) => ({ artworks: null, seriesCovers: c })),
  ])

  if (artworksOrCovers.artworks) {
    artworks = artworksOrCovers.artworks
  } else if (artworksOrCovers.seriesCovers) {
    seriesCovers = artworksOrCovers.seriesCovers
  }

  return (
    <ArtworksContent
      artworks={artworks}
      seriesCovers={seriesCovers ?? undefined}
      seriesList={seriesList}
      allTags={allTags}
      error={error}
    />
  )
}
