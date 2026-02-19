'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import type { Exhibition, EventGalleryPhoto } from '@/lib/supabaseClient'
import styles from '@/styles/eventDetail.module.css'
import admin from '@/styles/adminUI.module.css'

function formatDate(dateStr: string, zh: boolean): string {
  const date = new Date(dateStr)
  if (zh) {
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDateRange(start?: string, end?: string, zh?: boolean): string {
  if (!start) return ''
  const s = formatDate(start, !!zh)
  if (!end) return s
  const e = formatDate(end, !!zh)
  return `${s} — ${e}`
}

interface EventDetailContentProps {
  event: Exhibition
  galleryPhotos: EventGalleryPhoto[]
}

export default function EventDetailContent({ event, galleryPhotos: initialPhotos }: EventDetailContentProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = !!(session?.user as any)?.isAdmin

  const [showEdit, setShowEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    title: event.title || '', title_en: event.title_en || '',
    description: event.description || '', description_en: event.description_en || '',
    start_date: event.start_date || '', end_date: event.end_date || '',
    location: event.location || '', location_en: event.location_en || '',
    location_url: event.location_url || '',
  })

  // Gallery state
  const [galleryPhotos, setGalleryPhotos] = useState<EventGalleryPhoto[]>(initialPhotos)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const title = zh ? event.title : (event.title_en || event.title)
  const description = zh ? event.description : (event.description_en || event.description)
  const location = zh ? event.location : (event.location_en || event.location)
  const dateRange = formatDateRange(event.start_date, event.end_date, zh)

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrMsg('')
    try {
      let cover_image_url = event.cover_image_url || null

      if (coverFile) {
        const formData = new FormData()
        formData.append('file', coverFile)
        formData.append('folder', 'events')
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json().catch(() => null)
          setErrMsg(uploadErr?.error || '圖片上傳失敗')
          setSaving(false)
          return
        }
        const uploadData = await uploadRes.json()
        cover_image_url = uploadData.url
      }

      const res = await fetch('/api/exhibitions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: event.id, ...form, cover_image_url }),
      })
      if (res.ok) { setShowEdit(false); setCoverFile(null); router.refresh() }
      else { const d = await res.json().catch(() => null); setErrMsg(d?.error || `Error (${res.status})`) }
    } catch (err: any) { setErrMsg(err.message || '網路錯誤') }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm(zh ? '確定要刪除此活動？' : 'Delete this event?')) return
    await fetch('/api/exhibitions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: event.id }),
    })
    router.push('/events')
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadingGallery(true)

    for (let i = 0; i < files.length; i++) {
      try {
        const formData = new FormData()
        formData.append('file', files[i])
        formData.append('folder', 'gallery')
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!uploadRes.ok) continue
        const uploadData = await uploadRes.json()

        const res = await fetch('/api/event-gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exhibition_id: event.id, image_url: uploadData.url }),
        })
        if (res.ok) {
          const photo = await res.json()
          setGalleryPhotos((prev) => [...prev, photo])
        }
      } catch {
        // skip failed uploads
      }
    }

    setUploadingGallery(false)
    if (galleryInputRef.current) galleryInputRef.current.value = ''
  }

  async function handleDeleteGalleryPhoto(photoId: string) {
    if (!confirm(zh ? '確定要刪除此照片？' : 'Delete this photo?')) return
    await fetch('/api/event-gallery', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: photoId }),
    })
    setGalleryPhotos((prev) => prev.filter((p) => p.id !== photoId))
  }

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        <Link href="/events" className={styles.backLink}>
          ← {zh ? '返回活動列表' : 'Back to Events'}
        </Link>

        {event.cover_image_url && (
          <div className={styles.coverWrapper}>
            <Image
              src={event.cover_image_url}
              alt={title}
              fill
              sizes="100vw"
              className={styles.coverImage}
              priority
            />
          </div>
        )}

        <h1 className={styles.title}>{title}</h1>

        {dateRange && <p className={styles.date}>{dateRange}</p>}

        {location && (
          <p className={styles.location}>
            {event.location_url ? (
              <a href={event.location_url} target="_blank" rel="noopener noreferrer" className={styles.locationLink}>
                {location}
              </a>
            ) : location}
          </p>
        )}

        {description && <div className={styles.description}>{description}</div>}

        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
            <button className={admin.editBtn} onClick={() => setShowEdit(true)}>{zh ? '編輯' : 'Edit'}</button>
            <button className={admin.deleteBtn} onClick={handleDelete}>{zh ? '刪除' : 'Delete'}</button>
          </div>
        )}

        {/* Gallery Photos Section */}
        {(galleryPhotos.length > 0 || isAdmin) && (
          <section className={styles.gallerySection}>
            <h2 className={styles.galleryTitle}>{zh ? '花絮照片' : 'Gallery'}</h2>

            {galleryPhotos.length > 0 && (
              <div className={styles.galleryGrid}>
                {galleryPhotos.map((photo) => (
                  <div key={photo.id} className={styles.galleryItem}>
                    <Image
                      src={photo.image_url}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className={styles.galleryImage}
                    />
                    {isAdmin && (
                      <button
                        className={styles.galleryDeleteBtn}
                        onClick={() => handleDeleteGalleryPhoto(photo.id)}
                        title={zh ? '刪除照片' : 'Delete photo'}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {isAdmin && (
              <div style={{ marginTop: '1rem' }}>
                <label className={admin.addBtn} style={{ cursor: 'pointer', display: 'inline-block' }}>
                  {uploadingGallery
                    ? (zh ? '上傳中...' : 'Uploading...')
                    : (zh ? '+ 上傳花絮照片' : '+ Upload Photos')}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    ref={galleryInputRef}
                    style={{ display: 'none' }}
                    onChange={handleGalleryUpload}
                    disabled={uploadingGallery}
                  />
                </label>
              </div>
            )}
          </section>
        )}

        {showEdit && (
          <div className={admin.overlay} onClick={() => setShowEdit(false)}>
            <form className={admin.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleEdit}>
              <h2 className={admin.modalTitle}>{zh ? '編輯活動' : 'Edit Event'}</h2>

              <div className={admin.formGroup}>
                <label className={admin.formLabel}>{zh ? '封面圖片' : 'Cover Image'}</label>
                {event.cover_image_url && !coverFile && (
                  <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>
                    {zh ? '目前已有封面圖片，選擇新檔案將會替換' : 'Current cover exists. Choose a new file to replace.'}
                  </p>
                )}
                <input type="file" accept="image/*" ref={coverInputRef}
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
                {coverFile && (
                  <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                    {coverFile.name}
                  </p>
                )}
              </div>

              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>標題 (中文) *</label>
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
                  <label className={admin.formLabel}>開始日期</label>
                  <input className={admin.formInput} type="date" value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>結束日期</label>
                  <input className={admin.formInput} type="date" value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>地點 (中文)</label>
                  <input className={admin.formInput} value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>Location (EN)</label>
                  <input className={admin.formInput} value={form.location_en}
                    onChange={(e) => setForm({ ...form, location_en: e.target.value })} />
                </div>
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>地點連結</label>
                <input className={admin.formInput} type="url" value={form.location_url}
                  onChange={(e) => setForm({ ...form, location_url: e.target.value })} />
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>說明 (中文)</label>
                <textarea className={admin.formTextarea} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>Description (EN)</label>
                <textarea className={admin.formTextarea} value={form.description_en}
                  onChange={(e) => setForm({ ...form, description_en: e.target.value })} />
              </div>
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
