'use client'

import Image from 'next/image'
import type { Artwork } from '@/lib/supabaseClient'
import styles from '@/styles/artworks.module.css'

interface ArtworkCardProps {
  artwork: Artwork
}

export default function ArtworkCard({ artwork }: ArtworkCardProps) {
  const imageUrl = artwork.image_url || '/placeholder.png'
  
  return (
    <article className={styles.artworkCard}>
      <div className={styles.imageWrapper}>
        <Image
          src={imageUrl}
          alt={artwork.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className={styles.image}
          priority={false}
        />
      </div>
      
      <div className={styles.cardContent}>
        <h3 className={styles.title}>{artwork.title}</h3>
        
        <div className={styles.metadata}>
          {artwork.year && (
            <span className={styles.metaItem}>{artwork.year}</span>
          )}
          {artwork.medium && (
            <span className={styles.metaItem}>{artwork.medium}</span>
          )}
          {artwork.size && (
            <span className={styles.metaItem}>{artwork.size}</span>
          )}
        </div>
        
        {artwork.description && (
          <p className={styles.description}>{artwork.description}</p>
        )}
      </div>
    </article>
  )
}
