'use client'

import Image from 'next/image'
import { useLanguage } from './LanguageProvider'
import type { Exhibition } from '@/lib/supabaseClient'
import styles from '@/styles/events.module.css'

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

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
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
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
