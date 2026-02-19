'use client'

import { useState, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import ArtworkGrid from './ArtworkGrid'
import type { Artwork, Series } from '@/lib/supabaseClient'
import styles from '@/styles/artworks.module.css'
import admin from '@/styles/adminUI.module.css'

interface ArtworksContentProps {
  artworks: Artwork[]
  seriesList: Series[]
  error: string | null
}

export default function ArtworksContent({ artworks, seriesList, error }: ArtworksContentProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = !!(session?.user as any)?.isAdmin

  const [showForm, setShowForm] = useState(false)
  const [showSeriesForm, setShowSeriesForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    title: '', title_en: '', series_id: '', year: '',
    medium: '', medium_en: '', size: '', description: '', description_en: '',
  })
  const [seriesForm, setSeriesForm] = useState({
    name: '', name_en: '', description: '', description_en: '',
  })
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)
  const [editForm, setEditForm] = useState({
    title: '', title_en: '', series_id: '', year: '',
    medium: '', medium_en: '', size: '', description: '', description_en: '',
  })
  const [editingSeries, setEditingSeries] = useState<Series | null>(null)
  const [editSeriesForm, setEditSeriesForm] = useState({
    name: '', name_en: '', description: '', description_en: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrMsg('')

    try {
      let image_url: string | null = null

      // Upload image file if provided
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!uploadRes.ok) {
          const uploadErr = await uploadRes.json().catch(() => null)
          setErrMsg(uploadErr?.error || 'Image upload failed')
          setSaving(false)
          return
        }
        const uploadData = await uploadRes.json()
        image_url = uploadData.url
      }

      const res = await fetch('/api/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          year: form.year ? Number(form.year) : null,
          series_id: form.series_id || null,
          image_url,
        }),
      })
      if (res.ok) {
        setShowForm(false)
        setForm({ title: '', title_en: '', series_id: '', year: '', medium: '', medium_en: '', size: '', description: '', description_en: '' })
        setImageFile(null)
        router.refresh()
      } else {
        const data = await res.json().catch(() => null)
        setErrMsg(data?.error || `儲存失敗 (${res.status})`)
      }
    } catch (err: any) {
      setErrMsg(err.message || '網路錯誤')
    }
    setSaving(false)
  }

  function openArtworkEdit(artwork: Artwork) {
    setEditingArtwork(artwork)
    setEditImageFile(null)
    setEditForm({
      title: artwork.title || '', title_en: artwork.title_en || '',
      series_id: artwork.series_id || '', year: artwork.year ? String(artwork.year) : '',
      medium: artwork.medium || '', medium_en: artwork.medium_en || '',
      size: artwork.size || '', description: artwork.description || '',
      description_en: artwork.description_en || '',
    })
  }

  async function handleArtworkEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingArtwork) return
    setSaving(true)
    setErrMsg('')
    try {
      let image_url = editingArtwork.image_url
      if (editImageFile) {
        const fd = new FormData()
        fd.append('file', editImageFile)
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: fd })
        if (!uploadRes.ok) { setErrMsg('Image upload failed'); setSaving(false); return }
        image_url = (await uploadRes.json()).url
      }
      const res = await fetch('/api/artworks', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingArtwork.id, ...editForm,
          year: editForm.year ? Number(editForm.year) : null,
          series_id: editForm.series_id || null, image_url,
        }),
      })
      if (res.ok) { setEditingArtwork(null); setEditImageFile(null); router.refresh() }
      else { const d = await res.json().catch(() => null); setErrMsg(d?.error || `Error (${res.status})`) }
    } catch (err: any) { setErrMsg(err.message || '網路錯誤') }
    setSaving(false)
  }

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
    } catch (err: any) {
      setErrMsg(err.message || '網路錯誤')
    }
    setSaving(false)
  }

  function openSeriesEdit(s: Series) {
    setEditingSeries(s)
    setEditSeriesForm({
      name: s.name || '', name_en: s.name_en || '',
      description: s.description || '', description_en: s.description_en || '',
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

  async function handleDelete(id: string) {
    if (!confirm(zh ? '確定要刪除此作品？' : 'Delete this artwork?')) return
    await fetch('/api/artworks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        {isAdmin && (
          <div className={admin.adminBar}>
            <button className={admin.addBtn} onClick={() => setShowSeriesForm(true)}>
              + {zh ? '新增系列' : 'Add Series'}
            </button>
            <button className={admin.addBtn} onClick={() => setShowForm(true)}>
              + {zh ? '新增作品' : 'Add Artwork'}
            </button>
          </div>
        )}

        {/* Series management list (admin only) */}
        {isAdmin && seriesList.length > 0 && (
          <div className={styles.seriesAdminList}>
            <h3 className={styles.seriesAdminTitle}>{zh ? '系列管理' : 'Series Management'}</h3>
            <div className={styles.seriesChips}>
              {seriesList.map((s) => (
                <span key={s.id} className={styles.seriesChip}>
                  {zh ? s.name : (s.name_en || s.name)}
                  <button className={styles.seriesChipEdit} onClick={() => openSeriesEdit(s)}>✎</button>
                  <button className={styles.seriesChipDelete} onClick={() => handleSeriesDelete(s.id)}>×</button>
                </span>
              ))}
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
        ) : artworks.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{zh ? '尚無作品，請稍後再來！' : 'No artworks found yet. Check back soon!'}</p>
          </div>
        ) : (
          <ArtworkGrid artworks={artworks} isAdmin={isAdmin} onEdit={openArtworkEdit} onDelete={handleDelete} />
        )}

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
              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>媒材 (中文)</label>
                  <input className={admin.formInput} value={editForm.medium}
                    onChange={(e) => setEditForm({ ...editForm, medium: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>Medium (EN)</label>
                  <input className={admin.formInput} value={editForm.medium_en}
                    onChange={(e) => setEditForm({ ...editForm, medium_en: e.target.value })} />
                </div>
              </div>
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

        {showForm && (
          <div className={admin.overlay} onClick={() => setShowForm(false)}>
            <form className={admin.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
              <h2 className={admin.modalTitle}>{zh ? '新增作品' : 'Add Artwork'}</h2>

              <div className={admin.formGroup}>
                <label className={admin.formLabel}>{zh ? '作品圖檔' : 'Artwork Image'}</label>
                <input
                  ref={fileInputRef}
                  className={admin.formInput}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
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
                      <option key={s.id} value={s.id}>
                        {zh ? s.name : (s.name_en || s.name)}
                      </option>
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
                <label className={admin.formLabel}>敘述 (中文，選填)</label>
                <textarea className={admin.formTextarea} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className={admin.formGroup}>
                <label className={admin.formLabel}>Description (EN, optional)</label>
                <textarea className={admin.formTextarea} value={form.description_en}
                  onChange={(e) => setForm({ ...form, description_en: e.target.value })} />
              </div>

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
