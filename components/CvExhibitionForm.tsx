'use client'

import { useState } from 'react'
import type { CvExhibition } from '@/lib/supabaseClient'
import { useLanguage } from './LanguageProvider'
import admin from '@/styles/adminUI.module.css'

interface CvExhibitionFormProps {
  exhibition?: CvExhibition | null
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function CvExhibitionForm({ exhibition, onSubmit, onCancel, loading = false }: CvExhibitionFormProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const [errMsg, setErrMsg] = useState('')
  const [form, setForm] = useState({
    year: exhibition?.year ? String(exhibition.year) : '',
    title: exhibition?.title || '',
    title_en: exhibition?.title_en || '',
    venue: exhibition?.venue || '',
    venue_en: exhibition?.venue_en || '',
    region: exhibition?.region || '',
    region_en: exhibition?.region_en || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrMsg('')
    try {
      await onSubmit({ ...form, year: Number(form.year) })
    } catch (err: any) {
      setErrMsg(err.message || (zh ? '網路錯誤' : 'Network error'))
    }
  }

  return (
    <form className={admin.modal} onSubmit={handleSubmit}>
      <h2 className={admin.modalTitle}>{zh ? (exhibition ? '編輯展覽' : '新增展覽') : (exhibition ? 'Edit Exhibition' : 'Add Exhibition')}</h2>

      <div className={admin.formGroup}>
        <label className={admin.formLabel}>{zh ? '年份' : 'Year'} *</label>
        <input
          className={admin.formInput}
          type="number"
          required
          value={form.year}
          onChange={(e) => setForm({ ...form, year: e.target.value })}
        />
      </div>

      <div className={admin.formRow}>
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>{zh ? '展覽名稱 (中文)' : 'Title (ZH)'} *</label>
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
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>{zh ? '場地空間 (中文)' : 'Venue (ZH)'}</label>
          <input
            className={admin.formInput}
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
          />
        </div>
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>Venue (EN)</label>
          <input
            className={admin.formInput}
            value={form.venue_en}
            onChange={(e) => setForm({ ...form, venue_en: e.target.value })}
          />
        </div>
      </div>

      <div className={admin.formRow}>
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>{zh ? '地區 (中文)' : 'Region (ZH)'} *</label>
          <input
            className={admin.formInput}
            required
            value={form.region}
            onChange={(e) => setForm({ ...form, region: e.target.value })}
          />
        </div>
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>Region (EN)</label>
          <input
            className={admin.formInput}
            value={form.region_en}
            onChange={(e) => setForm({ ...form, region_en: e.target.value })}
          />
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
