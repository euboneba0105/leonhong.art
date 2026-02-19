'use client'

import ArtworkCard from './ArtworkCard'
import type { Artwork } from '@/lib/supabaseClient'
import styles from '@/styles/artworks.module.css'

interface ArtworkGridProps {
  artworks: Artwork[]
  isAdmin?: boolean
  onDelete?: (id: string) => void
}

export default function ArtworkGrid({ artworks, isAdmin, onDelete }: ArtworkGridProps) {
  return (
    <div className={styles.gridContainer}>
      {artworks.map((artwork) => (
        <ArtworkCard key={artwork.id} artwork={artwork} isAdmin={isAdmin} onDelete={onDelete} />
      ))}
    </div>
  )
}
