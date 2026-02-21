'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import styles from '@/styles/artworks.module.css'

const MAX_ASPECT_RATIO = 5 / 3
const MIN_ASPECT_RATIO = 1 / 1

function getArtworkIdFromImageUrl(imageUrl: string): string | null {
  try {
    return new URL(imageUrl, typeof window !== 'undefined' ? window.location.origin : 'http://x').searchParams.get('id')
  } catch {
    return null
  }
}

interface ArtworkZoomImageProps {
  imageUrl: string
  alt: string
  /** Optional: constrain max width (e.g. for series page side panel) */
  className?: string
  /** Set true on standalone artwork page for LCP */
  priority?: boolean
}

export default function ArtworkZoomImage({ imageUrl, alt, className, priority = false }: ArtworkZoomImageProps) {
  const artworkId = getArtworkIdFromImageUrl(imageUrl)
  const [zooming, setZooming] = useState(false)
  const [zoomBlobUrl, setZoomBlobUrl] = useState<string | null>(null)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTouchZooming = useRef(false)
  const isTouchDevice = useRef(false)
  const imageSectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (zoomBlobUrl) URL.revokeObjectURL(zoomBlobUrl)
    }
  }, [zoomBlobUrl])

  useEffect(() => {
    if (!imageUrl) return
    setZoomBlobUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
  }, [imageUrl])

  useEffect(() => {
    return () => {
      if (zoomBlobUrl) URL.revokeObjectURL(zoomBlobUrl)
    }
  }, [zoomBlobUrl])

  const handleLoadingComplete = useCallback(
    (img: { naturalWidth: number; naturalHeight: number }) => {
      setImageAspectRatio(img.naturalWidth / img.naturalHeight)
    },
    []
  )

  let displayAspectRatio = imageAspectRatio
  let isImageOutOfRange = false
  if (imageAspectRatio) {
    if (imageAspectRatio > MAX_ASPECT_RATIO) {
      displayAspectRatio = MAX_ASPECT_RATIO
      isImageOutOfRange = true
    } else if (imageAspectRatio < MIN_ASPECT_RATIO) {
      displayAspectRatio = MIN_ASPECT_RATIO
      isImageOutOfRange = true
    }
  }

  let zoomScale = 250
  if (imageAspectRatio && imageAspectRatio > MAX_ASPECT_RATIO) {
    const excessRatio = imageAspectRatio / MAX_ASPECT_RATIO
    zoomScale = Math.round(250 * excessRatio)
  }

  const loadZoomImage = useCallback(() => {
    if (!artworkId || zoomBlobUrl) return
    fetch(`/api/image/zoom?id=${encodeURIComponent(artworkId)}`)
      .then((r) => r.blob())
      .then((blob) => setZoomBlobUrl(URL.createObjectURL(blob)))
      .catch(() => {})
  }, [artworkId, zoomBlobUrl])

  const handleMouseEnter = useCallback(() => {
    if (isTouchDevice.current) return
    setZooming(true)
    loadZoomImage()
  }, [loadZoomImage])

  const handleMouseLeave = useCallback(() => {
    if (isTouchDevice.current) return
    setZooming(false)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice.current) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
  }, [])

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    isTouchDevice.current = true
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((touch.clientX - rect.left) / rect.width) * 100
    const y = ((touch.clientY - rect.top) / rect.height) * 100
    setZoomPos({ x, y })
    longPressTimer.current = setTimeout(() => {
      isTouchZooming.current = true
      setZooming(true)
      if (artworkId && !zoomBlobUrl) {
        fetch(`/api/image/zoom?id=${encodeURIComponent(artworkId)}`)
          .then((r) => r.blob())
          .then((blob) => setZoomBlobUrl(URL.createObjectURL(blob)))
          .catch(() => {})
      }
    }, 400)
  }, [artworkId, zoomBlobUrl])

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
    isTouchZooming.current = false
    setZooming(false)
  }, [])

  useEffect(() => {
    const el = imageSectionRef.current
    if (!el) return
    const onTouchMove = (e: TouchEvent) => {
      if (!isTouchZooming.current) {
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current)
          longPressTimer.current = null
        }
        return
      }
      e.preventDefault()
      const touch = e.touches[0]
      const rect = el.getBoundingClientRect()
      const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100))
      const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100))
      setZoomPos({ x, y })
    }
    const onContextMenu = (e: Event) => {
      if (isTouchZooming.current) e.preventDefault()
    }
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('contextmenu', onContextMenu)
    return () => {
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('contextmenu', onContextMenu)
    }
  }, [])

  return (
    <div
      ref={imageSectionRef}
      className={`${styles.zoomImageSection} ${zooming ? styles.zooming : ''} ${isImageOutOfRange ? styles.constrainedImage : ''} ${className ?? ''}`}
      style={{
        aspectRatio: displayAspectRatio ? `${displayAspectRatio} / 1` : 'auto',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      <Image
        src={imageUrl}
        alt={alt}
        width={1600}
        height={1200}
        sizes="(max-width: 768px) 100vw, 900px"
        className={styles.zoomImg}
        priority={priority}
        quality={85}
        draggable={false}
        onLoadingComplete={handleLoadingComplete}
      />
      <div
        className={`${styles.zoomLens} ${zooming ? styles.zoomActive : ''}`}
        style={{
          backgroundImage: zoomBlobUrl ? `url(${zoomBlobUrl})` : 'none',
          backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
          backgroundSize: `${zoomScale}%`,
        }}
      />
    </div>
  )
}
