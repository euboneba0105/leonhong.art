'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import { uploadFile } from '@/lib/uploadFile'
import type { Artwork, Series, Tag } from '@/lib/supabaseClient'
import styles from '@/styles/artworkDetail.module.css'
import filterStyles from '@/styles/artworks.module.css'
import admin from '@/styles/adminUI.module.css'

interface ArtworkDetailContentProps {
  artwork: Artwork
  seriesList: Series[]
  allTags: Tag[]
}

export default function ArtworkDetailContent({ artwork, seriesList, allTags }: ArtworkDetailContentProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = !!(session?.user as any)?.isAdmin

  const [showEdit, setShowEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    title: artwork.title || '', title_en: artwork.title_en || '',
    series_id: artwork.series_id || '', year: artwork.year ? String(artwork.year) : '',
    size: artwork.size || '', description: artwork.description || '',
    description_en: artwork.description_en || '',
  })
  const [editTagIds, setEditTagIds] = useState<Set<string>>(
    new Set((artwork.tags || []).map((t) => t.id))
  )

  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
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

  const MAX_ASPECT_RATIO = 5 / 3 // 5:3 (1.667)
  const MIN_ASPECT_RATIO = 1 / 1 // 1:1 (1.0)

  // 計算約束後的寬高比
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

  // 計算縮放倍數：超寬圖片要放大更多
  let zoomScale = 250 // 預設 2.5 倍 (250%)
  if (imageAspectRatio && imageAspectRatio > MAX_ASPECT_RATIO) {
    // 超出範圍的倍數
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
    if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
    isTouchZooming.current = false
    setZooming(false)
  }, [])

  // Native touchmove listener with { passive: false } to allow preventDefault for scroll blocking
  // Also prevent context menu on long press
  useEffect(() => {
    const el = imageSectionRef.current
    if (!el) return

    const onTouchMove = (e: TouchEvent) => {
      if (!isTouchZooming.current) {
        // User is scrolling, cancel long-press
        if (longPressTimer.current) { clearTimeout(longPressTimer.current); longPressTimer.current = null }
        return
      }
      e.preventDefault()
      const touch = e.touches[0]
      const rect = el.getBoundingClientRect()
      const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100))
      const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100))
      setZoomPos({ x, y })
    }

    const onContextMenu = (e: Event) => { if (isTouchZooming.current) e.preventDefault() }

    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('contextmenu', onContextMenu)
    return () => {
      el.removeEventListener('touchmove', onTouchMove)
      el.removeEventListener('contextmenu', onContextMenu)
    }
  }, [])

  const title = zh ? artwork.title : (artwork.title_en || artwork.title)
  const tagNames = (artwork.tags || []).map((t) => zh ? t.name : (t.name_en || t.name)).filter(Boolean)
  const description = zh ? artwork.description : (artwork.description_en || artwork.description)
  const imageUrl = artwork.image_url || '/placeholder.png'

  const series = seriesList.find((s) => s.id === artwork.series_id)
  const seriesName = series ? (zh ? series.name : (series.name_en || series.name)) : null

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrMsg('')
    try {
      let image_url = artwork.image_url
      if (imageFile) {
        try { image_url = await uploadFile(imageFile, 'artworks', (p) => setUploadProgress(p)) }
        catch (uploadErr: any) { setErrMsg(uploadErr.message); setSaving(false); setUploadProgress(null); return }
        setUploadProgress(null)
      }
      const res = await fetch('/api/artworks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: artwork.id, ...form,
          year: form.year ? Number(form.year) : null,
          series_id: form.series_id || null, image_url,
          tag_ids: Array.from(editTagIds),
        }),
      })
      if (res.ok) { setShowEdit(false); setImageFile(null); router.refresh() }
      else { const d = await res.json().catch(() => null); setErrMsg(d?.error || `Error (${res.status})`) }
    } catch (err: any) { setErrMsg(err.message || '網路錯誤') }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm(zh ? '確定要刪除此作品？' : 'Delete this artwork?')) return
    await fetch('/api/artworks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: artwork.id }),
    })
    router.push('/')
  }

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        <button type="button" className={styles.backLink} onClick={() => router.back()}>
          ← {zh ? '返回' : 'Back'}
        </button>

        {/* Large image on top — hover / long-press to zoom */}
        <div
          ref={imageSectionRef}
          className={`${styles.imageSection} ${zooming ? styles.zooming : ''} ${isImageOutOfRange ? styles.constrainedImage : ''}`}
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
            alt={title}
            width={1600}
            height={1200}
            sizes="(max-width: 768px) 100vw, 900px"
            className={styles.image}
            priority
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

        {/* Info below */}
        <div className={styles.infoSection}>
          <h1 className={styles.title}>{title}</h1>

          <div className={styles.metaList}>
            {seriesName && (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>{zh ? '系列' : 'Series'}</span>
                <Link href={`/series/${series!.id}`} className={styles.metaValueLink}>{seriesName}</Link>
              </div>
            )}
            {artwork.year && (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>{zh ? '年份' : 'Year'}</span>
                <span className={styles.metaValue}>{artwork.year}</span>
              </div>
            )}
            {tagNames.length > 0 && (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>{zh ? '媒材' : 'Medium'}</span>
                <span className={styles.metaValue}>{tagNames.join(', ')}</span>
              </div>
            )}
            {artwork.size && (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>{zh ? '尺寸' : 'Size'}</span>
                <span className={styles.metaValue}>{artwork.size}</span>
              </div>
            )}
          </div>

          {description && <p className={styles.description}>{description}</p>}

          {isAdmin && (
            <div className={styles.adminActions}>
              <button className={admin.editBtn} onClick={() => setShowEdit(true)}>{zh ? '編輯' : 'Edit'}</button>
              <button className={admin.deleteBtn} onClick={handleDelete}>{zh ? '刪除' : 'Delete'}</button>
            </div>
          )}
        </div>

        {/* Edit modal */}
        {showEdit && (
          <div className={admin.overlay} onClick={() => setShowEdit(false)}>
            <form className={admin.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleEdit}>
              <h2 className={admin.modalTitle}>{zh ? '編輯作品' : 'Edit Artwork'}</h2>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>{zh ? '更換圖檔' : 'Replace Image'}</label>
                <input ref={fileInputRef} className={admin.formInput} type="file" accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
              </div>
              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>作品名稱 (中文) *</label>
                  <input className={admin.formInput} required value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>Title (EN)</label>
                  <input className={admin.formInput} value={form.title_en}
                    onChange={(e) => setForm({ ...form, title_en: e.target.value })} />
                </div>
              </div>
              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>{zh ? '系列' : 'Series'}</label>
                  <select className={admin.formInput} value={form.series_id}
                    onChange={(e) => setForm({ ...form, series_id: e.target.value })}>
                    <option value="">{zh ? '-- 選擇系列 --' : '-- Select Series --'}</option>
                    {seriesList.map((s) => (
                      <option key={s.id} value={s.id}>{zh ? s.name : (s.name_en || s.name)}</option>
                    ))}
                  </select>
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>{zh ? '年份' : 'Year'}</label>
                  <input className={admin.formInput} type="number" value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })} />
                </div>
              </div>
              {allTags.length > 0 && (
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>{zh ? '媒材' : 'Medium'}</label>
                  <div className={filterStyles.filterChips}>
                    {allTags.map((t) => (
                      <button key={t.id} type="button"
                        className={`${filterStyles.filterChip} ${editTagIds.has(t.id) ? filterStyles.filterChipActive : ''}`}
                        onClick={() => {
                          const next = new Set(editTagIds)
                          if (next.has(t.id)) next.delete(t.id)
                          else next.add(t.id)
                          setEditTagIds(next)
                        }}
                      >
                        {zh ? t.name : (t.name_en || t.name)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>{zh ? '尺寸' : 'Size'}</label>
                <input className={admin.formInput} value={form.size} placeholder="e.g. 120 x 80 cm"
                  onChange={(e) => setForm({ ...form, size: e.target.value })} />
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>敘述 (中文)</label>
                <textarea className={admin.formTextarea} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>Description (EN)</label>
                <textarea className={admin.formTextarea} value={form.description_en}
                  onChange={(e) => setForm({ ...form, description_en: e.target.value })} />
              </div>
              {uploadProgress !== null && (
                <div className={admin.progressWrapper}>
                  <div className={admin.progressLabel}>{zh ? `上傳中 ${uploadProgress}%` : `Uploading ${uploadProgress}%`}</div>
                  <div className={admin.progressTrack}><div className={admin.progressFill} style={{ width: `${uploadProgress}%` }} /></div>
                </div>
              )}
              {errMsg && <p style={{ color: 'red', margin: '0 0 12px' }}>{errMsg}</p>}
              <div className={admin.modalActions}>
                <button type="button" className={admin.cancelBtn} onClick={() => setShowEdit(false)}>
                  {zh ? '取消' : 'Cancel'}
                </button>
                <button type="submit" className={admin.submitBtn} disabled={saving}>
                  {saving ? (zh ? '儲存中...' : 'Saving...') : (zh ? '儲存' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
