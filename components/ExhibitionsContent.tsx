'use client'

import Image from 'next/image'
import { useLanguage } from './LanguageProvider'
import type { Exhibition } from '@/lib/supabaseClient'
import styles from '@/styles/exhibitions.module.css'

interface ExhibitionsContentProps {
  exhibitions: Exhibition[]
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

export default function ExhibitionsContent({ exhibitions }: ExhibitionsContentProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        {exhibitions.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{zh ? '目前尚無展覽資訊。' : 'No exhibitions listed yet.'}</p>
          </div>
        ) : (
          <div className={styles.exhibitionList}>
            {exhibitions.map((exhibition) => {
              const title = zh ? exhibition.title : (exhibition.title_en || exhibition.title)
              const description = zh ? exhibition.description : (exhibition.description_en || exhibition.description)
              const location = zh ? exhibition.location : (exhibition.location_en || exhibition.location)
              const dateRange = formatDateRange(exhibition.start_date, exhibition.end_date, zh)

              return (
                <article key={exhibition.id} className={styles.exhibitionCard}>
                  {exhibition.cover_image_url && (
                    <div className={styles.coverWrapper}>
                      <Image
                        src={exhibition.cover_image_url}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className={styles.coverImage}
                      />
                    </div>
                  )}
                  <div className={styles.cardBody}>
                    <h2 className={styles.exhibitionTitle}>{title}</h2>

                    {dateRange && (
                      <p className={styles.date}>{dateRange}</p>
                    )}

                    {location && (
                      <p className={styles.location}>
                        {exhibition.location_url ? (
                          <a
                            href={exhibition.location_url}
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
