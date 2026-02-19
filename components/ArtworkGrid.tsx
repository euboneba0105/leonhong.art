'use client'

import ArtworkCard from './ArtworkCard'
import type { Artwork } from '@/lib/supabaseClient'
import styles from '@/styles/artworks.module.css'

interface ArtworkGridProps {
  artworks: Artwork[]
  isAdmin?: boolean
  onEdit?: (artwork: Artwork) => void
  onDelete?: (id: string) => void
}

export default function ArtworkGrid({ artworks, isAdmin, onEdit, onDelete }: ArtworkGridProps) {
  return (
    <div className={styles.gridContainer}>
      {artworks.map((artwork) => (
        <ArtworkCard key={artwork.id} artwork={artwork} isAdmin={isAdmin} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
