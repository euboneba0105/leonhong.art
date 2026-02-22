'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import EventForm from './EventForm'
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

function isOngoing(start?: string, end?: string): boolean {
  if (!start) return false
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startTime = new Date(start).setHours(0, 0, 0, 0)
  const endTime = end ? new Date(end).setHours(23, 59, 59, 999) : startTime
  return today >= startTime && today <= endTime
}

export default function EventsContent({ events }: EventsContentProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = !!(session?.user as any)?.isAdmin

  const [showForm, setShowForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Exhibition | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleEventSubmit(form: any) {
    setSaving(true)
    try {
      const method = editingEvent ? 'PATCH' : 'POST'
      const body = editingEvent ? { id: editingEvent.id, ...form } : form

      const res = await fetch('/api/exhibitions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => null)
        throw new Error(d?.error || `Error (${res.status})`)
      }

      if (editingEvent) {
        setEditingEvent(null)
      } else {
        setShowForm(false)
      }
      router.refresh()
    } finally {
      setSaving(false)
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

                      <div className={styles.infoRow}>
                        <div className={styles.infoBlock}>
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
                        {isOngoing(event.start_date, event.end_date) && (
                          <span className={styles.ongoingTag}>{zh ? '進行中' : 'On View'}</span>
                        )}
                      </div>
                    </div>
                  </Link>

                  {isAdmin && (
                    <div style={{ padding: '0 2rem 1rem', display: 'flex', gap: '0.5rem' }}>
                      <button className={admin.editBtn} onClick={() => setEditingEvent(event)}>
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
            <div onClick={(e) => e.stopPropagation()}>
              <EventForm
                onSubmit={handleEventSubmit}
                onCancel={() => setShowForm(false)}
                loading={saving}
              />
            </div>
          </div>
        )}
        {editingEvent && (
          <div className={admin.overlay} onClick={() => setEditingEvent(null)}>
            <div onClick={(e) => e.stopPropagation()}>
              <EventForm
                event={editingEvent}
                onSubmit={handleEventSubmit}
                onCancel={() => setEditingEvent(null)}
                loading={saving}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
