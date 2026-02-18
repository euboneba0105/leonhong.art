'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import type { Exhibition } from '@/lib/supabaseClient'
import styles from '@/styles/events.module.css'
import admin from '@/styles/adminUI.module.css'

interface EventsContentProps {
  events: Exhibition[]
}

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

export default function EventsContent({ events }: EventsContentProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = !!(session?.user as any)?.isAdmin

  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', title_en: '', description: '', description_en: '',
    start_date: '', end_date: '', location: '', location_en: '',
    location_url: '', cover_image_url: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/exhibitions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) {
      setShowForm(false)
      setForm({
        title: '', title_en: '', description: '', description_en: '',
        start_date: '', end_date: '', location: '', location_en: '',
        location_url: '', cover_image_url: '',
      })
      router.refresh()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(zh ? '確定要刪除此活動？' : 'Delete this event?')) return
    await fetch('/api/exhibitions', {
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
            <button className={admin.addBtn} onClick={() => setShowForm(true)}>
              + {zh ? '新增活動' : 'Add Event'}
            </button>
          </div>
        )}

        {events.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{zh ? '目前尚無活動資訊。' : 'No events listed yet.'}</p>
          </div>
        ) : (
          <div className={styles.eventList}>
            {events.map((event) => {
              const title = zh ? event.title : (event.title_en || event.title)
              const description = zh ? event.description : (event.description_en || event.description)
              const location = zh ? event.location : (event.location_en || event.location)
              const dateRange = formatDateRange(event.start_date, event.end_date, zh)

              return (
                <article key={event.id} className={styles.eventCard}>
                  {event.cover_image_url && (
                    <div className={styles.coverWrapper}>
                      <Image
                        src={event.cover_image_url}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className={styles.coverImage}
                      />
                    </div>
                  )}
                  <div className={styles.cardBody}>
                    <h2 className={styles.eventTitle}>{title}</h2>

                    {dateRange && (
                      <p className={styles.date}>{dateRange}</p>
                    )}

                    {location && (
                      <p className={styles.location}>
                        {event.location_url ? (
                          <a
                            href={event.location_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles.locationLink}
                          >
                            {location}
                          </a>
                        ) : (
                          location
                        )}
                      </p>
                    )}

                    {description && (
                      <p className={styles.description}>{description}</p>
                    )}

                    {isAdmin && (
                      <button className={admin.deleteBtn} onClick={() => handleDelete(event.id)}>
                        刪除
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {showForm && (
          <div className={admin.overlay} onClick={() => setShowForm(false)}>
            <form className={admin.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
              <h2 className={admin.modalTitle}>{zh ? '新增活動' : 'Add Event'}</h2>

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
