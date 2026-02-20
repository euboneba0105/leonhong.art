'use client'

import { useState } from 'react'
import type { Award } from '@/lib/supabaseClient'
import { useLanguage } from './LanguageProvider'
import admin from '@/styles/adminUI.module.css'

interface AwardFormProps {
  award?: Award | null
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function AwardForm({ award, onSubmit, onCancel, loading = false }: AwardFormProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const [errMsg, setErrMsg] = useState('')
  const [form, setForm] = useState({
    year: award?.year ? String(award.year) : '',
    name: award?.name || '',
    name_en: award?.name_en || '',
    competition: award?.competition || '',
    competition_en: award?.competition_en || '',
    prize: award?.prize || '',
    prize_en: award?.prize_en || '',
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
      <h2 className={admin.modalTitle}>{zh ? (award ? '編輯獲獎' : '新增獲獎') : (award ? 'Edit Award' : 'Add Award')}</h2>

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
          <label className={admin.formLabel}>{zh ? '獎項名稱 (中文)' : 'Award Name (ZH)'} *</label>
          <input
            className={admin.formInput}
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>Award Name (EN)</label>
          <input
            className={admin.formInput}
            value={form.name_en}
            onChange={(e) => setForm({ ...form, name_en: e.target.value })}
          />
        </div>
      </div>

      <div className={admin.formRow}>
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>{zh ? '競賽類別 (中文)' : 'Competition (ZH)'}</label>
          <input
            className={admin.formInput}
            value={form.competition}
            onChange={(e) => setForm({ ...form, competition: e.target.value })}
          />
        </div>
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>Competition (EN)</label>
          <input
            className={admin.formInput}
            value={form.competition_en}
            onChange={(e) => setForm({ ...form, competition_en: e.target.value })}
          />
        </div>
      </div>

      <div className={admin.formRow}>
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>{zh ? '獎項 (中文)' : 'Prize (ZH)'} *</label>
          <input
            className={admin.formInput}
            required
            value={form.prize}
            onChange={(e) => setForm({ ...form, prize: e.target.value })}
          />
        </div>
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>Prize (EN)</label>
          <input
            className={admin.formInput}
            value={form.prize_en}
            onChange={(e) => setForm({ ...form, prize_en: e.target.value })}
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
