'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from './LanguageProvider'
import type { Artwork } from '@/lib/supabaseClient'
import { artworkImageProxyUrl } from '@/lib/imageProxy'
import styles from '@/styles/artworks.module.css'
import admin from '@/styles/adminUI.module.css'

interface ArtworkCardProps {
  artwork: Artwork
  /** 系列的 URL slug（英文名），未提供時會用 series_id（相容舊連結） */
  seriesSlug?: string | null
  isAdmin?: boolean
  onEdit?: (artwork: Artwork) => void
  onDelete?: (id: string) => void
}

export default function ArtworkCard({ artwork, seriesSlug: seriesSlugProp, isAdmin, onEdit, onDelete }: ArtworkCardProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const imageUrl = artwork.image_url
    ? artworkImageProxyUrl(artwork.id, 520)
    : '/placeholder.png'
  const title = zh ? artwork.title : (artwork.title_en || artwork.title)
  const seriesSlug = seriesSlugProp ?? artwork.series_id ?? 'standalone'
  const seriesHref = `/series/${seriesSlug}?artwork=${artwork.id}`

  return (
    <article className={styles.artworkCard}>
      <Link href={seriesHref} className={styles.artworkLink}>
        <Image
          src={imageUrl}
          alt={title}
          width={520}
          height={520}
          quality={65}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className={styles.image}
          loading="lazy"
          unoptimized={imageUrl.startsWith('/api/image')}
        />
      </Link>

      {isAdmin && onEdit && onDelete && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button className={admin.editBtn} onClick={() => onEdit(artwork)}>
            {zh ? '編輯' : 'Edit'}
          </button>
          <button className={admin.deleteBtn} onClick={() => onDelete(artwork.id)}>
            {zh ? '刪除' : 'Delete'}
          </button>
        </div>
      )}
    </article>
  )
}
