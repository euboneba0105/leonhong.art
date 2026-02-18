'use client'

import { useLanguage } from './LanguageProvider'
import type { Experience } from '@/lib/supabaseClient'
import styles from '@/styles/about.module.css'

interface AboutContentProps {
  experiences: Experience[]
}

export default function AboutContent({ experiences }: AboutContentProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'

  // Group experiences by year
  const experiencesByYear = experiences.reduce<Record<number, Experience[]>>((acc, exp) => {
    if (!acc[exp.year]) acc[exp.year] = []
    acc[exp.year].push(exp)
    return acc
  }, {})

  const sortedYears = Object.keys(experiencesByYear)
    .map(Number)
    .sort((a, b) => b - a)

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        {/* Artist Bio Section */}
        <section className={styles.bioSection}>
          <div className={styles.bioContent}>
            {zh ? (
              <>
                <h2 className={styles.artistName}>洪德忠</h2>
                <p className={styles.artistNameSub}>Leon Hong</p>
                <p className={styles.bioText}>
                  洪德忠，專業藝術家，擅長油畫、水彩及素描。多年來致力於探索色彩與光影的對話，作品融合東西方美學，展現對自然與人文的深刻觀察。曾於國內外多次舉辦個展與聯展，作品廣受藏家與藝術愛好者的喜愛。
                </p>
              </>
            ) : (
              <>
                <h2 className={styles.artistName}>Leon Hong</h2>
                <p className={styles.artistNameSub}>洪德忠</p>
                <p className={styles.bioText}>
                  Leon Hong is a professional artist specializing in oil painting, watercolor, and drawing. Over the years, he has dedicated himself to exploring the dialogue between color and light, blending Eastern and Western aesthetics to express profound observations of nature and humanity. He has held numerous solo and group exhibitions both domestically and internationally, with works widely appreciated by collectors and art enthusiasts.
                </p>
              </>
            )}
          </div>
        </section>

        {/* Experience Timeline Section */}
        <section className={styles.timelineSection}>
          <h2 className={styles.sectionTitle}>{zh ? '經歷' : 'Experience'}</h2>

          {sortedYears.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{zh ? '尚無經歷資料。' : 'No experiences listed yet.'}</p>
            </div>
          ) : (
            <div className={styles.timeline}>
              {sortedYears.map((year) => (
                <div key={year} className={styles.yearGroup}>
                  <div className={styles.yearLabel}>{year}</div>
                  <div className={styles.yearEntries}>
                    {experiencesByYear[year].map((exp) => {
                      const title = zh ? exp.title : (exp.title_en || exp.title)
                      const category = zh ? exp.category : (exp.category_en || exp.category)
                      const description = zh ? exp.description : (exp.description_en || exp.description)

                      return (
                        <div key={exp.id} className={styles.entry}>
                          <span className={styles.categoryBadge}>{category}</span>
                          <h3 className={styles.entryTitle}>{title}</h3>
                          {description && (
                            <p className={styles.entryDescription}>{description}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
