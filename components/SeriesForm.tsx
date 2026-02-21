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
    sort_order: series?.sort_order != null ? String(series.sort_order) : '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrMsg('')
    const sortOrder =
      form.sort_order === '' || form.sort_order === undefined
        ? null
        : parseInt(String(form.sort_order), 10)
    const payload = { ...form, sort_order: Number.isNaN(sortOrder as number) ? null : sortOrder }
    try {
      await onSubmit(payload)
    } catch (err: any) {
      setErrMsg(err.message || (zh ? '網路錯誤' : 'Network error'))
    }
  }

  return (
    <form className={admin.modal} onSubmit={handleSubmit}>
      <h2 className={admin.modalTitle}>{zh ? (series ? '編輯系列' : '創建系列') : (series ? 'Edit Series' : 'Create Series')}</h2>

      <div className={admin.formGroup}>
        <label className={admin.formLabel}>{zh ? '排列順序（數字越小越前面）' : 'Display order (smaller = first)'}</label>
        <input
          type="number"
          className={admin.formInput}
          placeholder={zh ? '留空則排在最後' : 'Leave empty to appear last'}
          value={form.sort_order}
          onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
        />
      </div>

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
        <label className={admin.formLabel}>{zh ? '選擇封面圖片' : 'Select Cover Image'}</label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
          gap: '0.75rem'
        }}>
          {/* Clear button */}
          <button
            type="button"
            onClick={() => setForm({ ...form, cover_image_id: '' })}
            style={{
              padding: '0.75rem',
              border: form.cover_image_id === '' ? '2px solid #333' : '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: form.cover_image_id === '' ? '#f0f0f0' : '#fff',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: form.cover_image_id === '' ? 'bold' : 'normal',
              transition: 'all 0.2s'
            }}
          >
            {zh ? '無封面' : 'None'}
          </button>

          {/* Artwork thumbnails */}
          {artworks
            .filter(a => !series || a.series_id === series.id)
            .map(artwork => (
              <button
                key={artwork.id}
                type="button"
                onClick={() => setForm({ ...form, cover_image_id: artwork.id })}
                style={{
                  padding: 0,
                  border: form.cover_image_id === artwork.id ? '2px solid #333' : '1px solid #ddd',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  aspectRatio: '1',
                  backgroundColor: '#f5f5f5',
                  transition: 'border 0.2s'
                }}
                title={artwork.title}
              >
                {artwork.image_url && (
                  <img
                    src={artwork.image_url}
                    alt={artwork.title}
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
