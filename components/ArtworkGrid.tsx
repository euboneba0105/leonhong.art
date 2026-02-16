'use client'

import Image from 'next/image'
import type { Artwork } from '@/lib/supabaseClient'
import ArtworkCard from './ArtworkCard'
import styles from '@/styles/artworks.module.css'

interface ArtworkGridProps {
  artworks: Artwork[]
}

export default function ArtworkGrid({ artworks }: ArtworkGridProps) {
  return (
    <div className={styles.gridContainer}>
      {artworks.map((artwork) => (
        <ArtworkCard key={artwork.id} artwork={artwork} />
      ))}
    </div>
  )
}
