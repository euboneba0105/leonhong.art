'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import ArtworkGrid from './ArtworkGrid'
import type { Artwork, Series } from '@/lib/supabaseClient'
import styles from '@/styles/artworks.module.css'
import admin from '@/styles/adminUI.module.css'

interface SeriesDetailContentProps {
  series: Series | null
  artworks: Artwork[]
  seriesList: Series[]
  isStandalone: boolean
}

export default function SeriesDetailContent({ series, artworks, seriesList, isStandalone }: SeriesDetailContentProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = !!(session?.user as any)?.isAdmin

  const title = isStandalone
    ? (zh ? '獨立作品' : 'Standalone')
    : (zh ? series!.name : (series!.name_en || series!.name))

  const description = !isStandalone && series
    ? (zh ? series.description : (series.description_en || series.description))
    : null

  async function handleDelete(id: string) {
    if (!confirm(zh ? '確定要刪除此作品？' : 'Delete this artwork?')) return
    await fetch('/api/artworks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ color: '#555', textDecoration: 'none', fontSize: '0.95rem' }}>
            ← {zh ? '返回全部作品' : 'Back to All Works'}
          </Link>
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1a1a1a' }}>
          {title}
        </h1>

        {description && (
          <p style={{ color: '#555', marginBottom: '2rem', lineHeight: 1.6 }}>{description}</p>
        )}

        {artworks.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{zh ? '此系列尚無作品。' : 'No artworks in this series yet.'}</p>
          </div>
        ) : (
          <ArtworkGrid artworks={artworks} seriesList={seriesList} isAdmin={isAdmin} onDelete={handleDelete} />
        )}
      </main>
    </div>
  )
}
