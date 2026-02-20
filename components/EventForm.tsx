'use client'

import { useState, useRef } from 'react'
import type { Exhibition } from '@/lib/supabaseClient'
import { uploadFile } from '@/lib/uploadFile'
import { useLanguage } from './LanguageProvider'
import admin from '@/styles/adminUI.module.css'

interface EventFormProps {
  event?: Exhibition | null
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function EventForm({ event, onSubmit, onCancel, loading = false }: EventFormProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [errMsg, setErrMsg] = useState('')
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    title: event?.title || '',
    title_en: event?.title_en || '',
    description: event?.description || '',
    description_en: event?.description_en || '',
    start_date: event?.start_date || '',
    end_date: event?.end_date || '',
    location: event?.location || '',
    location_en: event?.location_en || '',
    location_url: event?.location_url || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrMsg('')
    try {
      let cover_image_url = event?.cover_image_url || null

      if (coverFile) {
        try {
          cover_image_url = await uploadFile(coverFile, 'events', (p) => setUploadProgress(p))
        } catch (uploadErr: any) {
          setErrMsg(uploadErr.message)
          setUploadProgress(null)
          return
        }
        setUploadProgress(null)
      }

      await onSubmit({ ...form, cover_image_url })
    } catch (err: any) {
      setErrMsg(err.message || (zh ? '網路錯誤' : 'Network error'))
    }
  }

  return (
    <form className={admin.modal} onSubmit={handleSubmit}>
      <h2 className={admin.modalTitle}>{zh ? (event ? '編輯活動' : '新增活動') : (event ? 'Edit Event' : 'Add Event')}</h2>

      <div className={admin.formGroup}>
        <label className={admin.formLabel}>{zh ? '封面圖片' : 'Cover Image'}</label>
        <input
          ref={coverInputRef}
          className={admin.formInput}
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
        />
        {coverFile && (
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
            {coverFile.name}
          </p>
        )}
        {event?.cover_image_url && !coverFile && (
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
            {zh ? '目前已有封面圖片，選擇新檔案將會替換' : 'Current cover exists. Choose a new file to replace.'}
          </p>
        )}
      </div>

      <div className={admin.formRow}>
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>{zh ? '標題 (中文)' : 'Title (ZH)'} *</label>
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
          <label className={admin.formLabel}>{zh ? '開始日期' : 'Start Date'}</label>
          <input
            className={admin.formInput}
            type="date"
            value={form.start_date}
            onChange={(e) => setForm({ ...form, start_date: e.target.value })}
          />
        </div>
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>{zh ? '結束日期' : 'End Date'}</label>
          <input
            className={admin.formInput}
            type="date"
            value={form.end_date}
            onChange={(e) => setForm({ ...form, end_date: e.target.value })}
          />
        </div>
      </div>

      <div className={admin.formRow}>
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>{zh ? '地點 (中文)' : 'Location (ZH)'}</label>
          <input
            className={admin.formInput}
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </div>
        <div className={admin.formGroup}>
          <label className={admin.formLabel}>Location (EN)</label>
          <input
            className={admin.formInput}
            value={form.location_en}
            onChange={(e) => setForm({ ...form, location_en: e.target.value })}
          />
        </div>
      </div>

      <div className={admin.formGroup}>
        <label className={admin.formLabel}>{zh ? '地點連結' : 'Location URL'}</label>
        <input
          className={admin.formInput}
          type="url"
          value={form.location_url}
          onChange={(e) => setForm({ ...form, location_url: e.target.value })}
        />
      </div>

      <div className={admin.formGroup}>
        <label className={admin.formLabel}>{zh ? '說明 (中文)' : 'Description (ZH)'}</label>
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
          <div className={admin.progressLabel}>{zh ? `上傳中 ${uploadProgress}%` : `Uploading ${uploadProgress}%`}</div>
          <div className={admin.progressTrack}><div className={admin.progressFill} style={{ width: `${uploadProgress}%` }} /></div>
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
