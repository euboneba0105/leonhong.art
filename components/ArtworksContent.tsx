'use client'

import { useState, useRef, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import { uploadFile } from '@/lib/uploadFile'
import ArtworkGrid from './ArtworkGrid'
import type { Artwork, Series, Tag } from '@/lib/supabaseClient'
import styles from '@/styles/artworks.module.css'
import admin from '@/styles/adminUI.module.css'

interface ArtworksContentProps {
  artworks: Artwork[]
  seriesList: Series[]
  allTags: Tag[]
  error: string | null
}

export default function ArtworksContent({ artworks, seriesList, allTags, error }: ArtworksContentProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = !!(session?.user as any)?.isAdmin

  const [showForm, setShowForm] = useState(false)
  const [showSeriesForm, setShowSeriesForm] = useState(false)
  const [showTagForm, setShowTagForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    title: '', title_en: '', series_id: '', year: '',
    size: '', description: '', description_en: '',
  })
  const [formTagIds, setFormTagIds] = useState<Set<string>>(new Set())
  const [seriesForm, setSeriesForm] = useState({
    name: '', name_en: '', description: '', description_en: '',
  })
  const [tagForm, setTagForm] = useState({ name: '', name_en: '' })
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)
  const [editForm, setEditForm] = useState({
    title: '', title_en: '', series_id: '', year: '',
    size: '', description: '', description_en: '',
  })
  const [editTagIds, setEditTagIds] = useState<Set<string>>(new Set())
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [editingSeries, setEditingSeries] = useState<Series | null>(null)
  const [editSeriesForm, setEditSeriesForm] = useState({
    name: '', name_en: '', description: '', description_en: '', cover_image_id: '',
  })
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [editTagForm, setEditTagForm] = useState({ name: '', name_en: '' })
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(new Set())

  // Build series cards data
  const seriesCards = useMemo(() => {
    return seriesList.map((s) => {
      let cover = null
      if (s.cover_image_id) {
        cover = artworks.find((a) => a.id === s.cover_image_id)
      } else {
        cover = artworks.find((a) => a.series_id === s.id)
      }
      return { series: s, coverUrl: cover?.image_url || null }
    })
  }, [seriesList, artworks])

  // Filter artworks by selected tags
  const filteredArtworks = useMemo(() => {
    if (selectedTagIds.size === 0) return artworks
    return artworks.filter((a) =>
      a.tags?.some((t) => selectedTagIds.has(t.id))
    )
  }, [artworks, selectedTagIds])

  function toggleFilterTag(id: string) {
    setSelectedTagIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ── Artwork CRUD ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrMsg('')
    try {
      let image_url: string | null = null
      if (imageFile) {
        try { image_url = await uploadFile(imageFile, 'artworks', (p) => setUploadProgress(p)) }
        catch (uploadErr: any) { setErrMsg(uploadErr.message); setSaving(false); setUploadProgress(null); return }
        setUploadProgress(null)
      }
      const res = await fetch('/api/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          year: form.year ? Number(form.year) : null,
          series_id: form.series_id || null,
          image_url,
          tag_ids: Array.from(formTagIds),
        }),
      })
      if (res.ok) {
        setShowForm(false)
        setForm({ title: '', title_en: '', series_id: '', year: '', size: '', description: '', description_en: '' })
        setFormTagIds(new Set())
        setImageFile(null)
        router.refresh()
      } else {
        const data = await res.json().catch(() => null)
        setErrMsg(data?.error || `儲存失敗 (${res.status})`)
      }
    } catch (err: any) { setErrMsg(err.message || '網路錯誤') }
    setSaving(false)
  }

  function openArtworkEdit(artwork: Artwork) {
    setEditingArtwork(artwork)
    setEditImageFile(null)
    setEditForm({
      title: artwork.title || '', title_en: artwork.title_en || '',
      series_id: artwork.series_id || '', year: artwork.year ? String(artwork.year) : '',
      size: artwork.size || '', description: artwork.description || '',
      description_en: artwork.description_en || '',
    })
    setEditTagIds(new Set((artwork.tags || []).map((t) => t.id)))
  }

  async function handleArtworkEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingArtwork) return
    setSaving(true)
    setErrMsg('')
    try {
      let image_url = editingArtwork.image_url
      if (editImageFile) {
        try { image_url = await uploadFile(editImageFile, 'artworks', (p) => setUploadProgress(p)) }
        catch (uploadErr: any) { setErrMsg(uploadErr.message); setSaving(false); setUploadProgress(null); return }
        setUploadProgress(null)
      }
      const res = await fetch('/api/artworks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingArtwork.id, ...editForm,
          year: editForm.year ? Number(editForm.year) : null,
          series_id: editForm.series_id || null, image_url,
          tag_ids: Array.from(editTagIds),
        }),
      })
      if (res.ok) { setEditingArtwork(null); setEditImageFile(null); router.refresh() }
      else { const d = await res.json().catch(() => null); setErrMsg(d?.error || `Error (${res.status})`) }
    } catch (err: any) { setErrMsg(err.message || '網路錯誤') }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm(zh ? '確定要刪除此作品？' : 'Delete this artwork?')) return
    await fetch('/api/artworks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  // ── Series CRUD ──
  async function handleSeriesSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrMsg('')
    try {
      const res = await fetch('/api/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seriesForm),
      })
      if (res.ok) {
        setShowSeriesForm(false)
        setSeriesForm({ name: '', name_en: '', description: '', description_en: '' })
        router.refresh()
      } else {
        const data = await res.json().catch(() => null)
        setErrMsg(data?.error || `儲存失敗 (${res.status})`)
      }
    } catch (err: any) { setErrMsg(err.message || '網路錯誤') }
    setSaving(false)
  }

  function openSeriesEdit(s: Series) {
    setEditingSeries(s)
    setEditSeriesForm({
      name: s.name || '', name_en: s.name_en || '',
      description: s.description || '', description_en: s.description_en || '',
      cover_image_id: s.cover_image_id || '',
    })
  }

  async function handleSeriesEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingSeries) return
    setSaving(true)
    setErrMsg('')
    try {
      const res = await fetch('/api/series', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingSeries.id, ...editSeriesForm }),
      })
      if (res.ok) { setEditingSeries(null); router.refresh() }
      else { const d = await res.json().catch(() => null); setErrMsg(d?.error || `Error (${res.status})`) }
    } catch (err: any) { setErrMsg(err.message || '網路錯誤') }
    setSaving(false)
  }

  async function handleSeriesDelete(id: string) {
    if (!confirm(zh ? '確定要刪除此系列？' : 'Delete this series?')) return
    await fetch('/api/series', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  // ── Tag CRUD ──
  async function handleTagSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrMsg('')
    try {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tagForm),
      })
      if (res.ok) {
        setShowTagForm(false)
        setTagForm({ name: '', name_en: '' })
        router.refresh()
      } else {
        const data = await res.json().catch(() => null)
        setErrMsg(data?.error || `儲存失敗 (${res.status})`)
      }
    } catch (err: any) { setErrMsg(err.message || '網路錯誤') }
    setSaving(false)
  }

  function openTagEdit(t: Tag) {
    setEditingTag(t)
    setEditTagForm({ name: t.name || '', name_en: t.name_en || '' })
  }

  async function handleTagEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingTag) return
    setSaving(true)
    setErrMsg('')
    try {
      const res = await fetch('/api/tags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingTag.id, ...editTagForm }),
      })
      if (res.ok) { setEditingTag(null); router.refresh() }
      else { const d = await res.json().catch(() => null); setErrMsg(d?.error || `Error (${res.status})`) }
    } catch (err: any) { setErrMsg(err.message || '網路錯誤') }
    setSaving(false)
  }

  async function handleTagDelete(id: string) {
    if (!confirm(zh ? '確定要刪除此媒材？' : 'Delete this medium?')) return
    await fetch('/api/tags', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  // Tag multi-select toggle helper
  function toggleTag(set: Set<string>, id: string): Set<string> {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return next
  }

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        {isAdmin && (
          <div className={admin.adminBar}>
            <button className={admin.addBtn} onClick={() => setShowSeriesForm(true)}>
              + {zh ? '新增系列' : 'Add Series'}
            </button>
            <button className={admin.addBtn} onClick={() => setShowTagForm(true)}>
              + {zh ? '新增媒材' : 'Add Medium'}
            </button>
            <button className={admin.addBtn} onClick={() => setShowForm(true)}>
              + {zh ? '新增作品' : 'Add Artwork'}
            </button>
          </div>
        )}

        {/* Tag management (admin only) */}
        {isAdmin && allTags.length > 0 && (
          <div className={styles.seriesAdminList}>
            <h3 className={styles.seriesAdminTitle}>{zh ? '媒材管理' : 'Medium Management'}</h3>
            <div className={styles.seriesChips}>
              {allTags.map((t) => (
                <span key={t.id} className={styles.seriesChip}>
                  {zh ? t.name : (t.name_en || t.name)}
                  <button className={styles.seriesChipEdit} onClick={() => openTagEdit(t)}>✎</button>
                  <button className={styles.seriesChipDelete} onClick={() => handleTagDelete(t.id)}>×</button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Series cards */}
        {seriesCards.length > 0 && (
          <div className={styles.seriesCardsSection}>
            <div className={styles.seriesCardsGrid}>
              {seriesCards.map(({ series: s, coverUrl }) => (
                <div key={s.id} className={styles.seriesCardWrap}>
                  <Link href={`/series/${s.id}`} className={styles.seriesCard}>
                    <div className={styles.seriesCardImageWrap}>
                      {coverUrl ? (
                        <Image
                          src={coverUrl}
                          alt={zh ? s.name : (s.name_en || s.name)}
                          fill
                          sizes="(max-width: 768px) 40vw, 200px"
                          className={styles.seriesCardImage}
                        />
                      ) : (
                        <div className={styles.seriesCardPlaceholder} />
                      )}
                    </div>
                    <span className={styles.seriesCardName}>
                      {zh ? s.name : (s.name_en || s.name)}
                    </span>
                  </Link>
                  {isAdmin && (
                    <div className={styles.seriesCardAdmin}>
                      <button className={styles.seriesCardAdminBtn} onClick={() => openSeriesEdit(s)}>✎</button>
                      <button className={`${styles.seriesCardAdminBtn} ${styles.seriesCardDeleteBtn}`} onClick={() => handleSeriesDelete(s.id)}>×</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tag filter */}
        {allTags.length > 1 && (
          <div className={styles.filterSection}>
            <div className={styles.filterChips}>
              {allTags.map((t) => (
                <button
                  key={t.id}
                  className={`${styles.filterChip} ${selectedTagIds.has(t.id) ? styles.filterChipActive : ''}`}
                  onClick={() => toggleFilterTag(t.id)}
                >
                  {zh ? t.name : (t.name_en || t.name)}
                </button>
              ))}
              {selectedTagIds.size > 0 && (
                <button
                  className={styles.filterClear}
                  onClick={() => setSelectedTagIds(new Set())}
                >
                  {zh ? '清除' : 'Clear'}
                </button>
              )}
            </div>
          </div>
        )}

        {error ? (
          <div className={styles.errorMessage}>
            <p>{zh ? '載入作品失敗，請稍後再試。' : error}</p>
            <p className={styles.errorSubtext}>
              {zh ? '請檢查網路連線後重新整理頁面。' : 'Please check your connection and try refreshing the page.'}
            </p>
          </div>
        ) : filteredArtworks.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{zh ? (selectedTagIds.size > 0 ? '沒有符合條件的作品。' : '尚無作品，請稍後再來！') : (selectedTagIds.size > 0 ? 'No artworks match the selected filters.' : 'No artworks found yet. Check back soon!')}</p>
          </div>
        ) : (
          <ArtworkGrid artworks={filteredArtworks} isAdmin={isAdmin} onEdit={openArtworkEdit} onDelete={handleDelete} />
        )}

        {/* ── Modals ── */}

        {/* Edit Series */}
        {editingSeries && (
          <div className={admin.overlay} onClick={() => setEditingSeries(null)}>
            <form className={admin.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleSeriesEdit}>
              <h2 className={admin.modalTitle}>{zh ? '編輯系列' : 'Edit Series'}</h2>
              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>系列名稱 (中文) *</label>
                  <input className={admin.formInput} required value={editSeriesForm.name}
                    onChange={(e) => setEditSeriesForm({ ...editSeriesForm, name: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>Series Name (EN)</label>
                  <input className={admin.formInput} value={editSeriesForm.name_en}
                    onChange={(e) => setEditSeriesForm({ ...editSeriesForm, name_en: e.target.value })} />
                </div>
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>敘述 (中文)</label>
                <textarea className={admin.formTextarea} value={editSeriesForm.description}
                  onChange={(e) => setEditSeriesForm({ ...editSeriesForm, description: e.target.value })} />
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>Description (EN)</label>
                <textarea className={admin.formTextarea} value={editSeriesForm.description_en}
                  onChange={(e) => setEditSeriesForm({ ...editSeriesForm, description_en: e.target.value })} />
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>{zh ? '選擇封面照片' : 'Select Cover Image'}</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                  gap: '0.75rem'
                }}>
                  {/* Clear button */}
                  <button
                    type="button"
                    onClick={() => setEditSeriesForm({ ...editSeriesForm, cover_image_id: '' })}
                    style={{
                      padding: '0.75rem',
                      border: editSeriesForm.cover_image_id === '' ? '2px solid #333' : '1px solid #ddd',
                      borderRadius: '4px',
                      backgroundColor: editSeriesForm.cover_image_id === '' ? '#f0f0f0' : '#fff',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: editSeriesForm.cover_image_id === '' ? 'bold' : 'normal',
                      transition: 'all 0.2s'
                    }}
                  >
                    {zh ? '無封面' : 'None'}
                  </button>

                  {/* Artwork thumbnails */}
                  {artworks
                    .filter((a) => a.series_id === editingSeries?.id)
                    .map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => setEditSeriesForm({ ...editSeriesForm, cover_image_id: a.id })}
                        style={{
                          padding: 0,
                          border: editSeriesForm.cover_image_id === a.id ? '2px solid #333' : '1px solid #ddd',
                          borderRadius: '4px',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          aspectRatio: '1',
                          backgroundColor: '#f5f5f5',
                          transition: 'border 0.2s'
                        }}
                        title={a.title}
                      >
                        {a.image_url && (
                          <img
                            src={a.image_url}
                            alt={a.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                      </button>
                    ))}
                </div>
              </div>
              {errMsg && <p style={{ color: 'red', margin: '0 0 12px' }}>{errMsg}</p>}
              <div className={admin.modalActions}>
                <button type="button" className={admin.cancelBtn} onClick={() => setEditingSeries(null)}>
                  {zh ? '取消' : 'Cancel'}
                </button>
                <button type="submit" className={admin.submitBtn} disabled={saving}>
                  {saving ? (zh ? '儲存中...' : 'Saving...') : (zh ? '儲存' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Tag */}
        {editingTag && (
          <div className={admin.overlay} onClick={() => setEditingTag(null)}>
            <form className={admin.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleTagEdit}>
              <h2 className={admin.modalTitle}>{zh ? '編輯媒材' : 'Edit Medium'}</h2>
              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>媒材名稱 (中文) *</label>
                  <input className={admin.formInput} required value={editTagForm.name}
                    onChange={(e) => setEditTagForm({ ...editTagForm, name: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>Medium Name (EN)</label>
                  <input className={admin.formInput} value={editTagForm.name_en}
                    onChange={(e) => setEditTagForm({ ...editTagForm, name_en: e.target.value })} />
                </div>
              </div>
              {errMsg && <p style={{ color: 'red', margin: '0 0 12px' }}>{errMsg}</p>}
              <div className={admin.modalActions}>
                <button type="button" className={admin.cancelBtn} onClick={() => setEditingTag(null)}>
                  {zh ? '取消' : 'Cancel'}
                </button>
                <button type="submit" className={admin.submitBtn} disabled={saving}>
                  {saving ? (zh ? '儲存中...' : 'Saving...') : (zh ? '儲存' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Edit Artwork */}
        {editingArtwork && (
          <div className={admin.overlay} onClick={() => setEditingArtwork(null)}>
            <form className={admin.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleArtworkEdit}>
              <h2 className={admin.modalTitle}>{zh ? '編輯作品' : 'Edit Artwork'}</h2>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>{zh ? '更換圖檔' : 'Replace Image'}</label>
                <input ref={editFileInputRef} className={admin.formInput} type="file" accept="image/*"
                  onChange={(e) => setEditImageFile(e.target.files?.[0] || null)} />
              </div>
              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>作品名稱 (中文) *</label>
                  <input className={admin.formInput} required value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>Title (EN)</label>
                  <input className={admin.formInput} value={editForm.title_en}
                    onChange={(e) => setEditForm({ ...editForm, title_en: e.target.value })} />
                </div>
              </div>
              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>{zh ? '系列' : 'Series'}</label>
                  <select className={admin.formInput} value={editForm.series_id}
                    onChange={(e) => setEditForm({ ...editForm, series_id: e.target.value })}>
                    <option value="">{zh ? '-- 選擇系列 --' : '-- Select Series --'}</option>
                    {seriesList.map((s) => (
                      <option key={s.id} value={s.id}>{zh ? s.name : (s.name_en || s.name)}</option>
                    ))}
                  </select>
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>{zh ? '年份' : 'Year'}</label>
                  <input className={admin.formInput} type="number" value={editForm.year}
                    onChange={(e) => setEditForm({ ...editForm, year: e.target.value })} />
                </div>
              </div>
              {allTags.length > 0 && (
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>{zh ? '媒材' : 'Medium'}</label>
                  <div className={styles.filterChips}>
                    {allTags.map((t) => (
                      <button key={t.id} type="button"
                        className={`${styles.filterChip} ${editTagIds.has(t.id) ? styles.filterChipActive : ''}`}
                        onClick={() => setEditTagIds(toggleTag(editTagIds, t.id))}
                      >
                        {zh ? t.name : (t.name_en || t.name)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>{zh ? '尺寸' : 'Size'}</label>
                <input className={admin.formInput} value={editForm.size} placeholder="e.g. 120 x 80 cm"
                  onChange={(e) => setEditForm({ ...editForm, size: e.target.value })} />
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>敘述 (中文)</label>
                <textarea className={admin.formTextarea} value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>Description (EN)</label>
                <textarea className={admin.formTextarea} value={editForm.description_en}
                  onChange={(e) => setEditForm({ ...editForm, description_en: e.target.value })} />
              </div>
              {uploadProgress !== null && (
                <div className={admin.progressWrapper}>
                  <div className={admin.progressLabel}>{zh ? `上傳中 ${uploadProgress}%` : `Uploading ${uploadProgress}%`}</div>
                  <div className={admin.progressTrack}><div className={admin.progressFill} style={{ width: `${uploadProgress}%` }} /></div>
                </div>
              )}
              {errMsg && <p style={{ color: 'red', margin: '0 0 12px' }}>{errMsg}</p>}
              <div className={admin.modalActions}>
                <button type="button" className={admin.cancelBtn} onClick={() => setEditingArtwork(null)}>
                  {zh ? '取消' : 'Cancel'}
                </button>
                <button type="submit" className={admin.submitBtn} disabled={saving}>
                  {saving ? (zh ? '儲存中...' : 'Saving...') : (zh ? '儲存' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Series */}
        {showSeriesForm && (
          <div className={admin.overlay} onClick={() => setShowSeriesForm(false)}>
            <form className={admin.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleSeriesSubmit}>
              <h2 className={admin.modalTitle}>{zh ? '新增系列' : 'Add Series'}</h2>
              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>系列名稱 (中文) *</label>
                  <input className={admin.formInput} required value={seriesForm.name}
                    onChange={(e) => setSeriesForm({ ...seriesForm, name: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>Series Name (EN)</label>
                  <input className={admin.formInput} value={seriesForm.name_en}
                    onChange={(e) => setSeriesForm({ ...seriesForm, name_en: e.target.value })} />
                </div>
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>敘述 (中文，選填)</label>
                <textarea className={admin.formTextarea} value={seriesForm.description}
                  onChange={(e) => setSeriesForm({ ...seriesForm, description: e.target.value })} />
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>Description (EN, optional)</label>
                <textarea className={admin.formTextarea} value={seriesForm.description_en}
                  onChange={(e) => setSeriesForm({ ...seriesForm, description_en: e.target.value })} />
              </div>
              {errMsg && <p style={{ color: 'red', margin: '0 0 12px' }}>{errMsg}</p>}
              <div className={admin.modalActions}>
                <button type="button" className={admin.cancelBtn} onClick={() => setShowSeriesForm(false)}>
                  {zh ? '取消' : 'Cancel'}
                </button>
                <button type="submit" className={admin.submitBtn} disabled={saving}>
                  {saving ? (zh ? '儲存中...' : 'Saving...') : (zh ? '儲存' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Tag */}
        {showTagForm && (
          <div className={admin.overlay} onClick={() => setShowTagForm(false)}>
            <form className={admin.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleTagSubmit}>
              <h2 className={admin.modalTitle}>{zh ? '新增媒材' : 'Add Medium'}</h2>
              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>媒材名稱 (中文) *</label>
                  <input className={admin.formInput} required value={tagForm.name}
                    onChange={(e) => setTagForm({ ...tagForm, name: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>Medium Name (EN)</label>
                  <input className={admin.formInput} value={tagForm.name_en}
                    onChange={(e) => setTagForm({ ...tagForm, name_en: e.target.value })} />
                </div>
              </div>
              {errMsg && <p style={{ color: 'red', margin: '0 0 12px' }}>{errMsg}</p>}
              <div className={admin.modalActions}>
                <button type="button" className={admin.cancelBtn} onClick={() => setShowTagForm(false)}>
                  {zh ? '取消' : 'Cancel'}
                </button>
                <button type="submit" className={admin.submitBtn} disabled={saving}>
                  {saving ? (zh ? '儲存中...' : 'Saving...') : (zh ? '儲存' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Add Artwork */}
        {showForm && (
          <div className={admin.overlay} onClick={() => setShowForm(false)}>
            <form className={admin.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
              <h2 className={admin.modalTitle}>{zh ? '新增作品' : 'Add Artwork'}</h2>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>{zh ? '作品圖檔' : 'Artwork Image'}</label>
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
                  <div className={styles.filterChips}>
                    {allTags.map((t) => (
                      <button key={t.id} type="button"
                        className={`${styles.filterChip} ${formTagIds.has(t.id) ? styles.filterChipActive : ''}`}
                        onClick={() => setFormTagIds(toggleTag(formTagIds, t.id))}
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
                <label className={admin.formLabel}>敘述 (中文，選填)</label>
                <textarea className={admin.formTextarea} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>Description (EN, optional)</label>
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
                <button type="button" className={admin.cancelBtn} onClick={() => setShowForm(false)}>
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
