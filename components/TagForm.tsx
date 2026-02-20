'use client'

import { useState } from 'react'
import type { Tag } from '@/lib/supabaseClient'
import { useLanguage } from './LanguageProvider'
import admin from '@/styles/adminUI.module.css'

interface TagFormProps {
  tag?: Tag | null
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function TagForm({ tag, onSubmit, onCancel, loading = false }: TagFormProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const [errMsg, setErrMsg] = useState('')
  const [form, setForm] = useState({
    name: tag?.name || '',
    name_en: tag?.name_en || '',
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

  return (
    <form className={admin.modal} onSubmit={handleSubmit}>
      <h2 className={admin.modalTitle}>{zh ? (tag ? '編輯媒材' : '新增媒材') : (tag ? 'Edit Medium' : 'Add Medium')}</h2>

      <div className={admin.formRow}>
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>{zh ? '媒材名稱 (中文)' : 'Name (ZH)'} *</label>
          <input
            className={admin.formInput}
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>{zh ? '媒材名稱 (英文)' : 'Name (EN)'}</label>
          <input
            className={admin.formInput}
            value={form.name_en}
            onChange={(e) => setForm({ ...form, name_en: e.target.value })}
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
