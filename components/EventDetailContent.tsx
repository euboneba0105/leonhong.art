'use client'

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

  const title = zh ? event.title : (event.title_en || event.title)
  const description = zh ? event.description : (event.description_en || event.description)
  const location = zh ? event.location : (event.location_en || event.location)
  const dateRange = formatDateRange(event.start_date, event.end_date, zh)

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
          <div className={styles.description}>{description}</div>
        )}

        {isAdmin && (
          <button className={admin.deleteBtn} onClick={handleDelete} style={{ marginTop: '2rem' }}>
            {zh ? '刪除此活動' : 'Delete Event'}
          </button>
        )}
      </main>
    </div>
  )
}
