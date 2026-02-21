'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import styles from '@/styles/artworks.module.css'

const MAX_ASPECT_RATIO = 5 / 3
const MIN_ASPECT_RATIO = 1 / 1

interface ArtworkZoomImageProps {
  imageUrl: string
  alt: string
  /** Optional: constrain max width (e.g. for series page side panel) */
  className?: string
  /** Set true on standalone artwork page for LCP */
  priority?: boolean
}

export default function ArtworkZoomImage({ imageUrl, alt, className, priority = false }: ArtworkZoomImageProps) {
  const [zooming, setZooming] = useState(false)
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 })
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null)
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isTouchZooming = useRef(false)
  const isTouchDevice = useRef(false)
  const imageSectionRef = useRef<HTMLDivElement>(null)

  const handleImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget
    const ratio = img.naturalWidth / img.naturalHeight
    setImageAspectRatio(ratio)
  }, [])

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

  const handleMouseEnter = useCallback(() => {
    if (isTouchDevice.current) return
    setZooming(true)
  }, [])

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
    }, 400)
  }, [])

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
        draggable={false}
        onLoad={handleImageLoad}
      />
      <div
        className={`${styles.zoomLens} ${zooming ? styles.zoomActive : ''}`}
        style={{
          backgroundImage: `url(${imageUrl})`,
          backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
          backgroundSize: `${zoomScale}%`,
        }}
      />
    </div>
  )
}
