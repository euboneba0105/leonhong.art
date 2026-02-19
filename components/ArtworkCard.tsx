'use client'

import Image from 'next/image'
import { useLanguage } from './LanguageProvider'
import type { Artwork, Series } from '@/lib/supabaseClient'
import styles from '@/styles/artworks.module.css'
import admin from '@/styles/adminUI.module.css'

interface ArtworkCardProps {
  artwork: Artwork
  seriesList?: Series[]
  isAdmin?: boolean
  onDelete?: (id: string) => void
}

export default function ArtworkCard({ artwork, seriesList, isAdmin, onDelete }: ArtworkCardProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const imageUrl = artwork.image_url || '/placeholder.png'

  const title = zh ? artwork.title : (artwork.title_en || artwork.title)
  const medium = zh ? artwork.medium : (artwork.medium_en || artwork.medium)
  const description = zh ? artwork.description : (artwork.description_en || artwork.description)

  const series = seriesList?.find((s) => s.id === artwork.series_id)
  const seriesName = series ? (zh ? series.name : (series.name_en || series.name)) : null

  return (
    <article className={styles.artworkCard}>
      <div className={styles.imageWrapper}>
        <Image
          src={imageUrl}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={styles.image}
          priority={false}
        />
      </div>

      <div className={styles.cardContent}>
        <h3 className={styles.title}>{title}</h3>

        <div className={styles.metadata}>
          {seriesName && (
            <span className={styles.metaItem}>{seriesName}</span>
          )}
          {artwork.year && (
            <span className={styles.metaItem}>{artwork.year}</span>
          )}
          {medium && (
            <span className={styles.metaItem}>{medium}</span>
          )}
          {artwork.size && (
            <span className={styles.metaItem}>{artwork.size}</span>
          )}
        </div>

        {description && (
          <p className={styles.description}>{description}</p>
        )}

        {isAdmin && onDelete && (
          <button className={admin.deleteBtn} onClick={() => onDelete(artwork.id)}>
            刪除
          </button>
        )}
      </div>
    </article>
  )
}
