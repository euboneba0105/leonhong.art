'use client'

import Link from 'next/link'
import { useLanguage } from './LanguageProvider'
import Footer from './Footer'
import ArtworkGrid from './ArtworkGrid'
import type { Artwork } from '@/lib/supabaseClient'
import styles from '@/styles/artworks.module.css'

interface ArtworksContentProps {
  artworks: Artwork[]
  error: string | null
}

export default function ArtworksContent({ artworks, error }: ArtworksContentProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'

  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <h1>{zh ? '作品集' : 'Artworks Gallery'}</h1>
        <p>{zh ? '瀏覽原創藝術作品' : 'Browse the collection of original artworks'}</p>
        <Link href="/" className={styles.backLink}>
          {zh ? '← 回到首頁' : '← Back to Home'}
        </Link>
      </header>

      <main className={styles.mainContent}>
        {error ? (
          <div className={styles.errorMessage}>
            <p>{zh ? '載入作品失敗，請稍後再試。' : error}</p>
            <p className={styles.errorSubtext}>
              {zh ? '請檢查網路連線後重新整理頁面。' : 'Please check your connection and try refreshing the page.'}
            </p>
          </div>
        ) : artworks.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{zh ? '尚無作品，請稍後再來！' : 'No artworks found yet. Check back soon!'}</p>
          </div>
        ) : (
          <ArtworkGrid artworks={artworks} />
        )}
      </main>

      <Footer />
    </div>
  )
}
