'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import type { Artwork, Series } from '@/lib/supabaseClient'
import styles from '@/styles/artworkDetail.module.css'
import admin from '@/styles/adminUI.module.css'

interface ArtworkDetailContentProps {
  artwork: Artwork
  seriesList: Series[]
}

export default function ArtworkDetailContent({ artwork, seriesList }: ArtworkDetailContentProps) {
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
    medium: artwork.medium || '', medium_en: artwork.medium_en || '',
    size: artwork.size || '', description: artwork.description || '',
    description_en: artwork.description_en || '',
  })

  const title = zh ? artwork.title : (artwork.title_en || artwork.title)
  const medium = zh ? artwork.medium : (artwork.medium_en || artwork.medium)
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
        const fd = new FormData()
        fd.append('file', imageFile)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!uploadRes.ok) { setErrMsg('Image upload failed'); setSaving(false); return }
        image_url = (await uploadRes.json()).url
      }
      const res = await fetch('/api/artworks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: artwork.id, ...form,
          year: form.year ? Number(form.year) : null,
          series_id: form.series_id || null, image_url,
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
        <Link href={series ? `/series/${series.id}` : '/'} className={styles.backLink}>
          ← {zh ? '返回' : 'Back'}
        </Link>

        {/* Large image on top, full width, no crop */}
        <div className={styles.imageSection}>
          <Image
            src={imageUrl}
            alt={title}
            width={1600}
            height={1200}
            sizes="(max-width: 768px) 100vw, 900px"
            className={styles.image}
            priority
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
            {medium && (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>{zh ? '媒材' : 'Medium'}</span>
                <span className={styles.metaValue}>{medium}</span>
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
              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>媒材 (中文)</label>
                  <input className={admin.formInput} value={form.medium}
                    onChange={(e) => setForm({ ...form, medium: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>Medium (EN)</label>
                  <input className={admin.formInput} value={form.medium_en}
                    onChange={(e) => setForm({ ...form, medium_en: e.target.value })} />
                </div>
              </div>
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
