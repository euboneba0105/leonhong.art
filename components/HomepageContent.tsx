'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import type { Artwork, Series } from '@/lib/supabaseClient'
import styles from '@/styles/homepage.module.css'
import admin from '@/styles/adminUI.module.css'

interface HomepageContentProps {
  allArtworks: Artwork[]
  carouselArtworkIds: string[]
  seriesList: Series[]
}

export default function HomepageContent({
  allArtworks,
  carouselArtworkIds,
  seriesList,
}: HomepageContentProps) {
  const { lang, toggle } = useLanguage()
  const zh = lang === 'zh'
  const { data: session } = useSession()
  const isAdmin = !!(session?.user as any)?.isAdmin
  const router = useRouter()

  // ── Hero carousel artworks ──
  const heroArtworks = useMemo(() => {
    if (carouselArtworkIds.length > 0) {
      return carouselArtworkIds
        .map((id) => allArtworks.find((a) => a.id === id))
        .filter((a): a is Artwork => !!a && !!a.image_url)
    }
    // Fallback: first 5 artworks with images
    return allArtworks.filter((a) => a.image_url).slice(0, 5)
  }, [allArtworks, carouselArtworkIds])

  // ── Slide state ──
  const [activeSlide, setActiveSlide] = useState(0)

  useEffect(() => {
    if (heroArtworks.length <= 1) return
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % heroArtworks.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroArtworks.length])

  // ── Scroll-driven overlay, fog & logo push ──
  const [overlayOpacity, setOverlayOpacity] = useState(0)
  const [fogAmount, setFogAmount] = useState(0)
  const [logoOffsetY, setLogoOffsetY] = useState(0)

  useEffect(() => {
    function handleScroll() {
      const scrollY = window.scrollY
      const vh = window.innerHeight

      // Overlay: starts immediately, max 50%
      setOverlayOpacity(Math.min(1, scrollY / (vh * 0.8)) * 0.5)

      // Fog: background blurs as nav approaches (0.3vh → 0.8vh)
      const fStart = vh * 0.3
      const fEnd = vh * 0.8
      setFogAmount(
        Math.min(1, Math.max(0, (scrollY - fStart) / (fEnd - fStart)))
      )

      // Logo push: nav section top in viewport = 1.0*vh - scrollY
      // When nav rises to meet the logo center (42vh), push logo up with it
      const navTopInVp = vh * 1.0 - scrollY
      const logoCenterY = vh * 0.42
      const pushMargin = 60 // px gap between logo bottom and nav top
      const pushPoint = logoCenterY + pushMargin
      if (navTopInVp < pushPoint) {
        setLogoOffsetY(pushPoint - navTopInVp)
      } else {
        setLogoOffsetY(0)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // initialise on mount
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ── Series cards data ──
  const seriesCards = useMemo(() => {
    return seriesList.map((s) => {
      let cover = null
      if (s.cover_image_id) {
        cover = allArtworks.find((a) => a.id === s.cover_image_id)
      } else {
        cover = allArtworks.find((a) => a.series_id === s.id)
      }
      return { series: s, coverUrl: cover?.image_url || null }
    })
  }, [seriesList, allArtworks])

  // ── Intersection observer for series float-up ──
  const seriesSectionRef = useRef<HTMLElement>(null)
  const [seriesVisible, setSeriesVisible] = useState(false)

  useEffect(() => {
    const el = seriesSectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setSeriesVisible(true)
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // ── Admin carousel editor ──
  const [showCarouselEditor, setShowCarouselEditor] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(carouselArtworkIds)
  )
  const [saving, setSaving] = useState(false)

  function toggleCarouselArtwork(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function saveCarousel() {
    setSaving(true)
    try {
      const res = await fetch('/api/homepage-carousel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artwork_ids: Array.from(selectedIds) }),
      })
      if (res.ok) {
        setShowCarouselEditor(false)
        router.refresh()
      }
    } catch {
      // silent
    }
    setSaving(false)
  }

  return (
    <div className={styles.homepage}>
      {/* ── Fixed hero background ── */}
      <div className={styles.heroBackground}>
        {/* Artwork layer — blur controlled by fog */}
        <div
          className={styles.heroArtworkLayer}
          style={fogAmount > 0 ? { filter: `blur(${fogAmount * 12}px)` } : undefined}
        >
          {heroArtworks.map((artwork, i) => (
            <div
              key={artwork.id}
              className={`${styles.heroSlide} ${
                i === activeSlide ? styles.heroSlideActive : ''
              }`}
            >
              {artwork.image_url && (
                <Image
                  src={artwork.image_url}
                  alt={artwork.title}
                  fill
                  sizes="100vw"
                  style={{ objectFit: 'cover' }}
                  priority={i === 0}
                  quality={80}
                  unoptimized={(artwork.image_url ?? '').startsWith('/api/image')}
                />
              )}
            </div>
          ))}

          {/* Dark overlay — opacity driven by scroll */}
          <div
            className={styles.heroOverlay}
            style={{ opacity: overlayOpacity }}
          />

          {/* White fog tint */}
          <div
            className={styles.heroFog}
            style={{ opacity: fogAmount * 0.25 }}
          />
        </div>

        {/* White logo — always visible, pushed up by nav on scroll */}
        <div
          className={styles.heroLogo}
          style={{
            transform: `translate(-50%, calc(-50% - ${logoOffsetY}px))`,
          }}
        >
          {/* 請上傳白色 logo 為 /public/logo-white.png */}
          <Image
            src="/logo-white.png"
            alt={zh ? '洪德忠' : 'Leon Hong'}
            width={300}
            height={90}
            priority
            className={styles.heroLogoImage}
          />
        </div>
      </div>

      {/* ── Scroll spacer (hero + logo reveal) ── */}
      <div className={styles.heroSpacer} />

      {/* ── Title + Enter button ── */}
      <section className={styles.navSection}>
        <h1 className={styles.heroTitle}>Leon Hong Art</h1>
        <Link href="/gallery" className={styles.enterBtn}>
          <span>{zh ? '進入網站' : 'Visit Website'}</span>
          <span className={styles.enterBtnArrow}>→</span>
        </Link>
      </section>

      {/* ── Series cards — desktop only ── */}
      {seriesCards.length > 0 && (
        <section
          ref={seriesSectionRef}
          className={`${styles.seriesSection} ${
            seriesVisible ? styles.seriesSectionVisible : ''
          }`}
        >
          <div className={styles.seriesGrid}>
            {seriesCards.map(({ series: s, coverUrl }) => (
              <Link
                key={s.id}
                href={`/series/${s.id}`}
                className={styles.seriesCard}
              >
                <div className={styles.seriesCardImageWrap}>
                  {coverUrl ? (
                    <Image
                      src={coverUrl}
                      alt={zh ? s.name : s.name_en || s.name}
                      fill
                      sizes="220px"
                      style={{ objectFit: 'cover' }}
                      unoptimized={coverUrl.startsWith('/api/image')}
                    />
                  ) : (
                    <div className={styles.seriesCardPlaceholder} />
                  )}
                </div>
                <span className={styles.seriesCardName}>
                  {zh ? s.name : s.name_en || s.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Language toggle — outside series section so visible on mobile too */}
      <section className={styles.langSection}>
        <div className={styles.langToggle}>
          <button
            className={`${styles.langOption} ${zh ? styles.langActive : ''}`}
            onClick={() => { if (!zh) toggle() }}
          >
            中文
          </button>
          <button
            className={`${styles.langOption} ${!zh ? styles.langActive : ''}`}
            onClick={() => { if (zh) toggle() }}
          >
            EN
          </button>
        </div>
      </section>

      {/* ── Admin: Edit carousel button ── */}
      {isAdmin && (
        <button
          className={styles.editCarouselBtn}
          onClick={() => setShowCarouselEditor(true)}
        >
          {zh ? '編輯首頁輪播' : 'Edit Carousel'}
        </button>
      )}

      {/* ── Admin: Carousel editor modal ── */}
      {showCarouselEditor && (
        <div
          className={admin.overlay}
          onClick={() => setShowCarouselEditor(false)}
        >
          <div
            className={styles.carouselEditor}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={admin.modalTitle}>
              {zh ? '選擇輪播作品' : 'Select Carousel Artworks'}
            </h2>
            <p className={styles.carouselEditorHint}>
              {zh
                ? '點擊選取要在首頁滿版輪播的作品'
                : 'Click to select artworks for the homepage carousel'}
            </p>
            <div className={styles.carouselEditorGrid}>
              {allArtworks
                .filter((a) => a.image_url)
                .map((artwork) => (
                  <div
                    key={artwork.id}
                    className={`${styles.carouselEditorItem} ${
                      selectedIds.has(artwork.id)
                        ? styles.carouselEditorItemSelected
                        : ''
                    }`}
                    onClick={() => toggleCarouselArtwork(artwork.id)}
                  >
                    <div className={styles.carouselEditorImageWrap}>
                      <Image
                        src={artwork.image_url!}
                        alt={artwork.title}
                        fill
                        sizes="120px"
                        style={{ objectFit: 'cover' }}
                        unoptimized={(artwork.image_url ?? '').startsWith('/api/image')}
                      />
                      {selectedIds.has(artwork.id) && (
                        <div className={styles.carouselEditorCheck}>✓</div>
                      )}
                    </div>
                    <span className={styles.carouselEditorTitle}>
                      {zh
                        ? artwork.title
                        : artwork.title_en || artwork.title}
                    </span>
                  </div>
                ))}
            </div>
            <div className={admin.modalActions}>
              <button
                className={admin.cancelBtn}
                onClick={() => setShowCarouselEditor(false)}
              >
                {zh ? '取消' : 'Cancel'}
              </button>
              <button
                className={admin.submitBtn}
                disabled={saving}
                onClick={saveCarousel}
              >
                {saving
                  ? zh
                    ? '儲存中...'
                    : 'Saving...'
                  : zh
                    ? '儲存'
                    : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
