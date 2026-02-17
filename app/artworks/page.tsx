export const dynamic = 'force-dynamic'
export const revalidate = 0

import { supabase, type Artwork } from '@/lib/supabaseClient'
import ArtworkGrid from '@/components/ArtworkGrid'
import Link from 'next/link'
import styles from '@/styles/artworks.module.css'

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

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <h1>Artworks Gallery</h1>
        <p>Browse the collection of original artworks</p>
        <Link href="/" className={styles.backLink}>
          ← Back to Home
        </Link>
      </header>

      <main className={styles.mainContent}>
        {error ? (
          <div className={styles.errorMessage}>
            <p>{error}</p>
            <p className={styles.errorSubtext}>
              Please check your connection and try refreshing the page.
            </p>
          </div>
        ) : artworks.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No artworks found yet. Check back soon!</p>
          </div>
        ) : (
          <ArtworkGrid artworks={artworks} />
        )}
      </main>
    </div>
  )
}
