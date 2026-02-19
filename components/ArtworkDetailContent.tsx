'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import type { Artwork, Series } from '@/lib/supabaseClient'
import styles from '@/styles/artworkDetail.module.css'
import admin from '@/styles/adminUI.module.css'

interface ArtworkDetailContentProps {
  artwork: Artwork
  seriesList: Series[]
}

export default function ArtworkDetailContent({ artwork, seriesList }: ArtworkDetailContentProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = !!(session?.user as any)?.isAdmin

  const title = zh ? artwork.title : (artwork.title_en || artwork.title)
  const medium = zh ? artwork.medium : (artwork.medium_en || artwork.medium)
  const description = zh ? artwork.description : (artwork.description_en || artwork.description)
  const imageUrl = artwork.image_url || '/placeholder.png'

  const series = seriesList.find((s) => s.id === artwork.series_id)
  const seriesName = series ? (zh ? series.name : (series.name_en || series.name)) : null

  async function handleDelete() {
    if (!confirm(zh ? '確定要刪除此作品？' : 'Delete this artwork?')) return
    await fetch('/api/artworks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: artwork.id }),
    })
    router.push('/')
  }

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        <Link href={series ? `/series/${series.id}` : '/'} className={styles.backLink}>
          ← {zh ? '返回' : 'Back'}
        </Link>

        <div className={styles.detailLayout}>
          <div className={styles.imageSection}>
            <div className={styles.imageWrapper}>
              <Image
                src={imageUrl}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className={styles.image}
                priority
              />
            </div>
          </div>

          <div className={styles.infoSection}>
            <h1 className={styles.title}>{title}</h1>

            <div className={styles.metaList}>
              {seriesName && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>{zh ? '系列' : 'Series'}</span>
                  <Link href={`/series/${series!.id}`} className={styles.metaValueLink}>
                    {seriesName}
                  </Link>
                </div>
              )}
              {artwork.year && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>{zh ? '年份' : 'Year'}</span>
                  <span className={styles.metaValue}>{artwork.year}</span>
                </div>
              )}
              {medium && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>{zh ? '媒材' : 'Medium'}</span>
                  <span className={styles.metaValue}>{medium}</span>
                </div>
              )}
              {artwork.size && (
                <div className={styles.metaRow}>
                  <span className={styles.metaLabel}>{zh ? '尺寸' : 'Size'}</span>
                  <span className={styles.metaValue}>{artwork.size}</span>
                </div>
              )}
            </div>

            {description && (
              <p className={styles.description}>{description}</p>
            )}

            {isAdmin && (
              <button className={admin.deleteBtn} onClick={handleDelete}>
                {zh ? '刪除此作品' : 'Delete Artwork'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
