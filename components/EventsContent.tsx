'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import { uploadFile } from '@/lib/uploadFile'
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
  const [errMsg, setErrMsg] = useState('')
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({
    title: '', title_en: '', description: '', description_en: '',
    start_date: '', end_date: '', location: '', location_en: '',
    location_url: '',
  })

  const [editingEvent, setEditingEvent] = useState<Exhibition | null>(null)
  const [editCoverFile, setEditCoverFile] = useState<File | null>(null)
  const editCoverInputRef = useRef<HTMLInputElement>(null)
  const [editForm, setEditForm] = useState({
    title: '', title_en: '', description: '', description_en: '',
    start_date: '', end_date: '', location: '', location_en: '',
    location_url: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrMsg('')
    try {
      let cover_image_url: string | null = null

      if (coverFile) {
        cover_image_url = await uploadFile(coverFile, 'events')
      }

      const res = await fetch('/api/exhibitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, cover_image_url }),
      })
      if (res.ok) {
        setShowForm(false)
        setForm({
          title: '', title_en: '', description: '', description_en: '',
          start_date: '', end_date: '', location: '', location_en: '',
          location_url: '',
        })
        setCoverFile(null)
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

  function openEventEdit(event: Exhibition) {
    setEditingEvent(event)
    setEditCoverFile(null)
    setEditForm({
      title: event.title || '', title_en: event.title_en || '',
      description: event.description || '', description_en: event.description_en || '',
      start_date: event.start_date || '', end_date: event.end_date || '',
      location: event.location || '', location_en: event.location_en || '',
      location_url: event.location_url || '',
    })
  }

  async function handleEventEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingEvent) return
    setSaving(true)
    setErrMsg('')
    try {
      let cover_image_url = editingEvent.cover_image_url || null
      if (editCoverFile) {
        cover_image_url = await uploadFile(editCoverFile, 'events')
      }
      const res = await fetch('/api/exhibitions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingEvent.id, ...editForm, cover_image_url }),
      })
      if (res.ok) { setEditingEvent(null); setEditCoverFile(null); router.refresh() }
      else { const d = await res.json().catch(() => null); setErrMsg(d?.error || `Error (${res.status})`) }
    } catch (err: any) { setErrMsg(err.message || '網路錯誤') }
    setSaving(false)
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
                  <Link href={`/events/${event.id}`} className={styles.eventLink}>
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
                        <p className={styles.location}>{location}</p>
                      )}

                      {description && (
                        <p className={styles.description}>{description}</p>
                      )}
                    </div>
                  </Link>

                  {isAdmin && (
                    <div style={{ padding: '0 2rem 1rem', display: 'flex', gap: '0.5rem' }}>
                      <button className={admin.editBtn} onClick={() => openEventEdit(event)}>
                        {zh ? '編輯' : 'Edit'}
                      </button>
                      <button className={admin.deleteBtn} onClick={() => handleDelete(event.id)}>
                        {zh ? '刪除' : 'Delete'}
                      </button>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}

        {showForm && (
          <div className={admin.overlay} onClick={() => setShowForm(false)}>
            <form className={admin.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
              <h2 className={admin.modalTitle}>{zh ? '新增活動' : 'Add Event'}</h2>

              <div className={admin.formGroup}>
                <label className={admin.formLabel}>{zh ? '封面圖片' : 'Cover Image'}</label>
                <input type="file" accept="image/*" ref={coverInputRef}
                  onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
                {coverFile && (
                  <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.25rem' }}>
                    {coverFile.name}
                  </p>
                )}
              </div>

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
        {editingEvent && (
          <div className={admin.overlay} onClick={() => setEditingEvent(null)}>
            <form className={admin.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleEventEdit}>
              <h2 className={admin.modalTitle}>{zh ? '編輯活動' : 'Edit Event'}</h2>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>{zh ? '封面圖片' : 'Cover Image'}</label>
                {editingEvent.cover_image_url && !editCoverFile && (
                  <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>
                    {zh ? '目前已有封面圖片，選擇新檔案將會替換' : 'Current cover exists. Choose a new file to replace.'}
                  </p>
                )}
                <input type="file" accept="image/*" ref={editCoverInputRef}
                  onChange={(e) => setEditCoverFile(e.target.files?.[0] || null)} />
              </div>
              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>標題 (中文) *</label>
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
                  <label className={admin.formLabel}>開始日期</label>
                  <input className={admin.formInput} type="date" value={editForm.start_date}
                    onChange={(e) => setEditForm({ ...editForm, start_date: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>結束日期</label>
                  <input className={admin.formInput} type="date" value={editForm.end_date}
                    onChange={(e) => setEditForm({ ...editForm, end_date: e.target.value })} />
                </div>
              </div>
              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>地點 (中文)</label>
                  <input className={admin.formInput} value={editForm.location}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>Location (EN)</label>
                  <input className={admin.formInput} value={editForm.location_en}
                    onChange={(e) => setEditForm({ ...editForm, location_en: e.target.value })} />
                </div>
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>地點連結</label>
                <input className={admin.formInput} type="url" value={editForm.location_url}
                  onChange={(e) => setEditForm({ ...editForm, location_url: e.target.value })} />
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>說明 (中文)</label>
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
                <button type="button" className={admin.cancelBtn} onClick={() => setEditingEvent(null)}>
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
