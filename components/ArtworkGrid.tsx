'use client'

import ArtworkCard from './ArtworkCard'
import type { Artwork, Series } from '@/lib/supabaseClient'
import styles from '@/styles/artworks.module.css'

interface ArtworkGridProps {
  artworks: Artwork[]
  seriesList?: Series[]
  isAdmin?: boolean
  onDelete?: (id: string) => void
}

export default function ArtworkGrid({ artworks, seriesList, isAdmin, onDelete }: ArtworkGridProps) {
  return (
    <div className={styles.gridContainer}>
      {artworks.map((artwork) => (
        <ArtworkCard key={artwork.id} artwork={artwork} seriesList={seriesList} isAdmin={isAdmin} onDelete={onDelete} />
      ))}
    </div>
  )
}
