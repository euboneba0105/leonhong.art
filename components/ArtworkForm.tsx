'use client'

import { useState, useRef } from 'react'
import type { Artwork, Series, Tag } from '@/lib/supabaseClient'
import { uploadFile } from '@/lib/uploadFile'
import { useLanguage } from './LanguageProvider'
import styles from '@/styles/artworks.module.css'
import admin from '@/styles/adminUI.module.css'

interface ArtworkFormProps {
  artwork?: Artwork | null
  seriesList: Series[]
  allTags: Tag[]
  /** 從系列頁開啟時傳入，鎖定所屬系列不顯示選擇器 */
  fixedSeriesId?: string | null
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function ArtworkForm({
  artwork,
  seriesList,
  allTags,
  fixedSeriesId,
  onSubmit,
  onCancel,
  loading = false,
}: ArtworkFormProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [errMsg, setErrMsg] = useState('')
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [tagIds, setTagIds] = useState<Set<string>>(
    new Set((artwork?.tags || []).map((t) => t.id))
  )
  const [form, setForm] = useState({
    title: artwork?.title || '',
    title_en: artwork?.title_en || '',
    series_id: fixedSeriesId !== undefined ? (fixedSeriesId ?? '') : (artwork?.series_id || ''),
    year: artwork?.year ? String(artwork.year) : '',
    size: artwork?.size || '',
    description: artwork?.description || '',
    description_en: artwork?.description_en || '',
  })

  const toggleTag = (id: string) => {
    const next = new Set(tagIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setTagIds(next)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrMsg('')
    try {
      let image_url = artwork?.image_url || null

      if (imageFile) {
        try {
          image_url = await uploadFile(imageFile, 'artworks', (p) => setUploadProgress(p))
        } catch (uploadErr: any) {
          setErrMsg(uploadErr.message)
          setUploadProgress(null)
          return
        }
        setUploadProgress(null)
      }

      await onSubmit({
        ...form,
        year: form.year ? Number(form.year) : null,
        series_id: fixedSeriesId !== undefined ? (fixedSeriesId ?? null) : (form.series_id || null),
        image_url,
        tag_ids: Array.from(tagIds),
      })
    } catch (err: any) {
      setErrMsg(err.message || (zh ? '網路錯誤' : 'Network error'))
    }
  }

  return (
    <form className={admin.modal} onSubmit={handleSubmit}>
      <h2 className={admin.modalTitle}>
        {zh ? (artwork ? '編輯作品' : '新增作品') : (artwork ? 'Edit Artwork' : 'Add Artwork')}
      </h2>

      <div className={admin.formGroup}>
        <label className={admin.formLabel}>
          {zh ? '作品圖檔' : 'Artwork Image'}
          {!artwork && ' *'}
        </label>
        <input
          ref={fileInputRef}
          className={admin.formInput}
          type="file"
          accept="image/*"
          required={!artwork}
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />
        {imageFile && (
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
            {imageFile.name}
          </p>
        )}
      </div>

      <div className={admin.formRow}>
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>{zh ? '作品名稱 (中文)' : 'Title (ZH)'} *</label>
          <input
            className={admin.formInput}
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>Title (EN)</label>
          <input
            className={admin.formInput}
            value={form.title_en}
            onChange={(e) => setForm({ ...form, title_en: e.target.value })}
          />
        </div>
      </div>

      <div className={admin.formRow}>
        {fixedSeriesId === undefined && (
          <div className={admin.formGroup}>
            <label className={admin.formLabel}>{zh ? '系列' : 'Series'}</label>
            <select
              className={admin.formInput}
              value={form.series_id}
              onChange={(e) => setForm({ ...form, series_id: e.target.value })}
            >
              <option value="">{zh ? '-- 選擇系列 --' : '-- Select Series --'}</option>
              {seriesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {zh ? s.name : s.name_en || s.name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>{zh ? '年份' : 'Year'}</label>
          <input
            className={admin.formInput}
            type="number"
            value={form.year}
            onChange={(e) => setForm({ ...form, year: e.target.value })}
          />
        </div>
      </div>

      {allTags.length > 0 && (
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>{zh ? '媒材' : 'Medium'}</label>
          <div className={styles.filterChips}>
            {allTags.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`${styles.filterChip} ${tagIds.has(t.id) ? styles.filterChipActive : ''}`}
                onClick={() => toggleTag(t.id)}
              >
                {zh ? t.name : t.name_en || t.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={admin.formGroup}>
        <label className={admin.formLabel}>{zh ? '尺寸' : 'Size'}</label>
        <input
          className={admin.formInput}
          placeholder="e.g. 120 x 80 cm"
          value={form.size}
          onChange={(e) => setForm({ ...form, size: e.target.value })}
        />
      </div>

      <div className={admin.formGroup}>
        <label className={admin.formLabel}>{zh ? '敘述 (中文)' : 'Description (ZH)'}</label>
        <textarea
          className={admin.formTextarea}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>

      <div className={admin.formGroup}>
        <label className={admin.formLabel}>Description (EN)</label>
        <textarea
          className={admin.formTextarea}
          value={form.description_en}
          onChange={(e) => setForm({ ...form, description_en: e.target.value })}
        />
      </div>

      {uploadProgress !== null && (
        <div className={admin.progressWrapper}>
          <div className={admin.progressLabel}>
            {zh ? `上傳中 ${uploadProgress}%` : `Uploading ${uploadProgress}%`}
          </div>
          <div className={admin.progressTrack}>
            <div className={admin.progressFill} style={{ width: `${uploadProgress}%` }} />
          </div>
        </div>
      )}

      {errMsg && <p style={{ color: 'red', margin: '0 0 12px' }}>{errMsg}</p>}

      <div className={admin.modalActions}>
        <button type="button" className={admin.cancelBtn} onClick={onCancel}>
          {zh ? '取消' : 'Cancel'}
        </button>
        <button type="submit" className={admin.submitBtn} disabled={loading}>
          {loading ? (zh ? '儲存中...' : 'Saving...') : (zh ? '儲存' : 'Save')}
        </button>
      </div>
    </form>
  )
}
