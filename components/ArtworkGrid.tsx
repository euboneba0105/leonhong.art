'use client'

import ArtworkCard from './ArtworkCard'
import type { Artwork, Series } from '@/lib/supabaseClient'
import { seriesSlug } from '@/lib/slug'
import styles from '@/styles/artworks.module.css'

interface ArtworkGridProps {
  artworks: Artwork[]
  seriesList?: Series[]
  isAdmin?: boolean
  onEdit?: (artwork: Artwork) => void
  onDelete?: (id: string) => void
}

export default function ArtworkGrid({ artworks, seriesList, isAdmin, onEdit, onDelete }: ArtworkGridProps) {
  return (
    <div className={styles.gridContainer}>
      {artworks.map((artwork) => {
        const series = seriesList?.find((s) => s.id === artwork.series_id)
        const slug = series ? seriesSlug(series) : (artwork.series_id ? undefined : 'standalone')
        return (
          <ArtworkCard
            key={artwork.id}
            artwork={artwork}
            seriesSlug={slug ?? artwork.series_id ?? 'standalone'}
            isAdmin={isAdmin}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        )
      })}
    </div>
  )
}
