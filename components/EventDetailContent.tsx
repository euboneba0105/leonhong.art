'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import type { Exhibition } from '@/lib/supabaseClient'
import styles from '@/styles/eventDetail.module.css'
import admin from '@/styles/adminUI.module.css'

function formatDate(dateStr: string, zh: boolean): string {
  const date = new Date(dateStr)
  if (zh) {
    return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
  }
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatDateRange(start?: string, end?: string, zh?: boolean): string {
  if (!start) return ''
  const s = formatDate(start, !!zh)
  if (!end) return s
  const e = formatDate(end, !!zh)
  return `${s} — ${e}`
}

interface EventDetailContentProps {
  event: Exhibition
}

export default function EventDetailContent({ event }: EventDetailContentProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = !!(session?.user as any)?.isAdmin

  const [showEdit, setShowEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [form, setForm] = useState({
    title: event.title || '', title_en: event.title_en || '',
    description: event.description || '', description_en: event.description_en || '',
    start_date: event.start_date || '', end_date: event.end_date || '',
    location: event.location || '', location_en: event.location_en || '',
    location_url: event.location_url || '', cover_image_url: event.cover_image_url || '',
  })

  const title = zh ? event.title : (event.title_en || event.title)
  const description = zh ? event.description : (event.description_en || event.description)
  const location = zh ? event.location : (event.location_en || event.location)
  const dateRange = formatDateRange(event.start_date, event.end_date, zh)

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrMsg('')
    try {
      const res = await fetch('/api/exhibitions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: event.id, ...form }),
      })
      if (res.ok) { setShowEdit(false); router.refresh() }
      else { const d = await res.json().catch(() => null); setErrMsg(d?.error || `Error (${res.status})`) }
    } catch (err: any) { setErrMsg(err.message || '網路錯誤') }
    setSaving(false)
  }

  async function handleDelete() {
    if (!confirm(zh ? '確定要刪除此活動？' : 'Delete this event?')) return
    await fetch('/api/exhibitions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: event.id }),
    })
    router.push('/events')
  }

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        <Link href="/events" className={styles.backLink}>
          ← {zh ? '返回活動列表' : 'Back to Events'}
        </Link>

        {event.cover_image_url && (
          <div className={styles.coverWrapper}>
            <Image
              src={event.cover_image_url}
              alt={title}
              fill
              sizes="100vw"
              className={styles.coverImage}
              priority
            />
          </div>
        )}

        <h1 className={styles.title}>{title}</h1>

        {dateRange && <p className={styles.date}>{dateRange}</p>}

        {location && (
          <p className={styles.location}>
            {event.location_url ? (
              <a href={event.location_url} target="_blank" rel="noopener noreferrer" className={styles.locationLink}>
                {location}
              </a>
            ) : location}
          </p>
        )}

        {description && <div className={styles.description}>{description}</div>}

        {isAdmin && (
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem' }}>
            <button className={admin.editBtn} onClick={() => setShowEdit(true)}>{zh ? '編輯' : 'Edit'}</button>
            <button className={admin.deleteBtn} onClick={handleDelete}>{zh ? '刪除' : 'Delete'}</button>
          </div>
        )}

        {showEdit && (
          <div className={admin.overlay} onClick={() => setShowEdit(false)}>
            <form className={admin.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleEdit}>
              <h2 className={admin.modalTitle}>{zh ? '編輯活動' : 'Edit Event'}</h2>
              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>標題 (中文) *</label>
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
                  <label className={admin.formLabel}>開始日期</label>
                  <input className={admin.formInput} type="date" value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>結束日期</label>
                  <input className={admin.formInput} type="date" value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
                </div>
              </div>
              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>地點 (中文)</label>
                  <input className={admin.formInput} value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>Location (EN)</label>
                  <input className={admin.formInput} value={form.location_en}
                    onChange={(e) => setForm({ ...form, location_en: e.target.value })} />
                </div>
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>地點連結</label>
                <input className={admin.formInput} type="url" value={form.location_url}
                  onChange={(e) => setForm({ ...form, location_url: e.target.value })} />
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>說明 (中文)</label>
                <textarea className={admin.formTextarea} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>Description (EN)</label>
                <textarea className={admin.formTextarea} value={form.description_en}
                  onChange={(e) => setForm({ ...form, description_en: e.target.value })} />
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>封面圖片網址</label>
                <input className={admin.formInput} value={form.cover_image_url}
                  onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} />
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
