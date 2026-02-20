'use client'

import { useState, useEffect } from 'react'
import type { Artwork, Series } from '@/lib/supabaseClient'
import { useLanguage } from './LanguageProvider'
import admin from '@/styles/adminUI.module.css'

interface SeriesFormProps {
  series?: Series | null
  artworks: Artwork[]
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function SeriesForm({ series, artworks, onSubmit, onCancel, loading = false }: SeriesFormProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const [errMsg, setErrMsg] = useState('')
  const [form, setForm] = useState({
    name: series?.name || '',
    name_en: series?.name_en || '',
    description: series?.description || '',
    description_en: series?.description_en || '',
    cover_image_id: series?.cover_image_id || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrMsg('')
    try {
      await onSubmit(form)
    } catch (err: any) {
      setErrMsg(err.message || (zh ? '網路錯誤' : 'Network error'))
    }
  }

  // 找到選中的封面圖片
  const selectedArtwork = form.cover_image_id ? artworks.find(a => a.id === form.cover_image_id) : null

  return (
    <form className={admin.modal} onSubmit={handleSubmit}>
      <h2 className={admin.modalTitle}>{zh ? (series ? '編輯系列' : '創建系列') : (series ? 'Edit Series' : 'Create Series')}</h2>

      <div className={admin.formRow}>
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>{zh ? '系列名稱 (中文)' : 'Series Name (ZH)'} *</label>
          <input
            className={admin.formInput}
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>Series Name (EN)</label>
          <input
            className={admin.formInput}
            value={form.name_en}
            onChange={(e) => setForm({ ...form, name_en: e.target.value })}
          />
        </div>
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

      <div className={admin.formGroup}>
        <label className={admin.formLabel}>{zh ? '封面圖片' : 'Cover Image'}</label>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <select
            className={admin.formInput}
            value={form.cover_image_id}
            onChange={(e) => setForm({ ...form, cover_image_id: e.target.value })}
            style={{ flex: 1 }}
          >
            <option value="">{zh ? '-- 選擇封面 --' : '-- Select Cover --'}</option>
            {artworks.map(artwork => (
              <option key={artwork.id} value={artwork.id}>
                {artwork.title} ({artwork.year || 'N/A'})
              </option>
            ))}
          </select>

          {selectedArtwork && selectedArtwork.image_url && (
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid #ddd',
              flexShrink: 0
            }}>
              <img
                src={selectedArtwork.image_url}
                alt="cover preview"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
            </div>
          )}
        </div>
      </div>

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
