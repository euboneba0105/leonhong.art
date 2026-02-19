'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useLanguage } from './LanguageProvider'
import type { Artwork } from '@/lib/supabaseClient'
import styles from '@/styles/artworks.module.css'
import admin from '@/styles/adminUI.module.css'

interface ArtworkCardProps {
  artwork: Artwork
  isAdmin?: boolean
  onEdit?: (artwork: Artwork) => void
  onDelete?: (id: string) => void
}

export default function ArtworkCard({ artwork, isAdmin, onEdit, onDelete }: ArtworkCardProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const imageUrl = artwork.image_url || '/placeholder.png'
  const title = zh ? artwork.title : (artwork.title_en || artwork.title)

  const [showZoom, setShowZoom] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }, [])

  return (
    <article className={styles.artworkCard}>
      <Link href={`/artworks/${artwork.id}`} className={styles.artworkLink}>
        <div
          className={styles.imageWrapper}
          onMouseEnter={() => setShowZoom(true)}
          onMouseLeave={() => setShowZoom(false)}
          onMouseMove={handleMouseMove}
        >
          <Image
            src={imageUrl}
            alt={title}
            width={800}
            height={800}
            quality={40}
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            className={styles.image}
            priority={false}
          />
          {showZoom && (
            <div
              className={styles.zoomLens}
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
            />
          )}
        </div>
      </Link>

      {isAdmin && onDelete && (
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
          <button className={admin.editBtn} onClick={() => onEdit?.(artwork)}>
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
