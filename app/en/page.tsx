export const dynamic = 'force-dynamic'
export const revalidate = 0

import { getServerSession } from 'next-auth'
import { authOptions, ADMIN_EMAILS } from '@/lib/auth'
import { supabase } from '@/lib/supabaseClient'
import { getSeries } from '@/lib/seriesData'
import { getHomepageArtworks } from '@/lib/homepageData'
import HomepageContent from '@/components/HomepageContent'
import { alternatesFor } from '@/lib/locale'

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
  description: 'Leon Hong artist portfolio. Contemporary art, water-based and mixed media.',
  alternates: alternatesFor('/en'),
}

export default async function EnHomePage() {
  const session = await getServerSession(authOptions)
  const isAdmin = !!(session?.user?.email && ADMIN_EMAILS.includes(session.user.email))
  const [seriesList, carouselIds] = await Promise.all([
    getSeries(!isAdmin),
    getCarouselIds(),
  ])
  const { carouselArtworks, coverBySeriesId } = await getHomepageArtworks(carouselIds, seriesList)

  const firstCarouselId =
    carouselIds.length > 0 ? carouselIds[0] : carouselArtworks[0]?.id ?? null

  return (
    <HomepageContent
      carouselArtworks={carouselArtworks}
      carouselArtworkIds={carouselIds}
      seriesList={seriesList}
      coverBySeriesId={coverBySeriesId}
      firstHeroImageId={firstCarouselId}
    />
  )
}
