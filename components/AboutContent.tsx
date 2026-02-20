'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import AwardForm from './AwardForm'
import CvExhibitionForm from './CvExhibitionForm'
import type { Award, CvExhibition } from '@/lib/supabaseClient'
import styles from '@/styles/about.module.css'
import admin from '@/styles/adminUI.module.css'

interface AboutContentProps {
  awards: Award[]
  cvExhibitions: CvExhibition[]
}

export default function AboutContent({ awards, cvExhibitions }: AboutContentProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = !!(session?.user as any)?.isAdmin

  const [showAwardForm, setShowAwardForm] = useState(false)
  const [editingAward, setEditingAward] = useState<Award | null>(null)
  const [savingAward, setSavingAward] = useState(false)

  const [showExhForm, setShowExhForm] = useState(false)
  const [editingExh, setEditingExh] = useState<CvExhibition | null>(null)
  const [savingExh, setSavingExh] = useState(false)

  async function handleAwardSubmit(form: any) {
    if (editingAward) {
      setSavingAward(true)
      try {
        const res = await fetch('/api/awards', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingAward.id, ...form }),
        })
        if (!res.ok) {
          const d = await res.json().catch(() => null)
          throw new Error(d?.error || 'Error')
        }
        setEditingAward(null)
        router.refresh()
      } finally {
        setSavingAward(false)
      }
    } else {
      setSavingAward(true)
      try {
        const res = await fetch('/api/awards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) {
          const d = await res.json().catch(() => null)
          throw new Error(d?.error || 'Error')
        }
        setShowAwardForm(false)
        router.refresh()
      } finally {
        setSavingAward(false)
      }
    }
  }

  async function handleExhSubmit(form: any) {
    if (editingExh) {
      setSavingExh(true)
      try {
        const res = await fetch('/api/cv-exhibitions', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingExh.id, ...form }),
        })
        if (!res.ok) {
          const d = await res.json().catch(() => null)
          throw new Error(d?.error || 'Error')
        }
        setEditingExh(null)
        router.refresh()
      } finally {
        setSavingExh(false)
      }
    } else {
      setSavingExh(true)
      try {
        const res = await fetch('/api/cv-exhibitions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        })
        if (!res.ok) {
          const d = await res.json().catch(() => null)
          throw new Error(d?.error || 'Error')
        }
        setShowExhForm(false)
        router.refresh()
      } finally {
        setSavingExh(false)
      }
    }
  }

  // Group by year
  const awardsByYear = awards.reduce<Record<number, Award[]>>((acc, a) => {
    if (!acc[a.year]) acc[a.year] = []
    acc[a.year].push(a)
    return acc
  }, {})
  const awardYears = Object.keys(awardsByYear).map(Number).sort((a, b) => b - a)

  const exhByYear = cvExhibitions.reduce<Record<number, CvExhibition[]>>((acc, e) => {
    if (!acc[e.year]) acc[e.year] = []
    acc[e.year].push(e)
    return acc
  }, {})
  const exhYears = Object.keys(exhByYear).map(Number).sort((a, b) => b - a)


  async function handleDeleteAward(id: string) {
    if (!confirm(zh ? '確定要刪除此獲獎紀錄？' : 'Delete this award?')) return
    await fetch('/api/awards', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  async function handleDeleteExh(id: string) {
    if (!confirm(zh ? '確定要刪除此展覽紀錄？' : 'Delete this exhibition?')) return
    await fetch('/api/cv-exhibitions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        {/* Artist Bio Section */}
        <section className={styles.bioSection}>
          <div className={styles.portraitWrapper}>
            <Image
              src="/portrait.jpg"
              alt="洪德忠 Leon Hong"
              width={320}
              height={320}
              className={styles.portrait}
              priority
            />
          </div>
          <div className={styles.bioContent}>
            {zh ? (
              <>
                <h2 className={styles.artistName}>洪德忠</h2>
                <p className={styles.artistNameSub}>Leon Hong</p>
                <p className={styles.bioText}>
                  {'出生於台灣屏東鄉下的小鎮——潮州。1997年國立台灣藝術學院（現為國立台灣藝術大學）複合媒材組畢業，後投入教職近十數年，近期專職於創作。\n\n藝術對於我而言，是生活當下對現實環境的感受與深刻的體驗，經過反思沉澱，內化後與自我的對話內容；在環境與人的對話關係中思尋自我的定位。\n\n大學時期複合的概念一直影響著我，不論是材質或是觀念的複合皆是我在創作時的重要訴求；我所關心的並非哪種具體的社會現象，而是現象背後的生命體認。\n\n水性媒材目前是相當能傳達我的創作歷程與衝擊的性格。水的多變與不受控制恰巧反映著我自己的內在精神，喜歡不受拘束的自由，在流動的特質中既可動也可靜既溫柔卻也剛強；創作的過程，從無到有，從破壞到建設是一連串的經驗累積與再現。繪畫中的重要元素——色彩、造型，透映出自我與外在環境的對話內容，它象徵著層層不同的心境也象徵著心與外界的各種起承轉合。創作就我而言像是與外界溝通的橋樑，藉由作品表達我的思想與精神，也探討生命存在的課題。'}
                </p>
              </>
            ) : (
              <>
                <h2 className={styles.artistName}>Leon Hong</h2>
                <p className={styles.artistNameSub}>洪德忠</p>
                <p className={styles.bioText}>
                  {'Born in the small town of Chaozhou, Pingtung, Taiwan. Graduated from the National Taiwan Academy of Arts (now the National Taiwan University of Arts), Mixed Media Group, in 1997. After working nearly ten years as a teacher, he has recently dedicated himself full-time to art.\n\nFor me, art is to contemplate, collect and fully understand the feeling and experience of reality in that exact moment, and to reflect an inner dialogue onto myself. It is a search for self-positioning within the relationship between the dialogue of environment and people.\n\nThe concept of fusion has influenced me greatly since university and has always been an essential appeal when creating, whether it be fusion of materials or concepts. I have no regard for distinctive social anomalies — only for life\'s recognition behind the anomaly.\n\nWater-based materials are currently able to convey my creative journey and characteristic impacts to a satisfying degree. The diversity and unpredictable attributes of water coincidentally reflect my inner mentality: a love for unrestricted freedom as well as the flowing features of simultaneously being tranquil or set into motion, gentle or robust. The process of creation — from nothing to something, from destruction to reconstruction — is a series of collective experience and its recitation. The important elements of painting, color and form, reflect the dialogue between me and the environment. They symbolize different layers of emotion and the twists and turns of my heart against the outside world. Creation is my window of communication towards the outside world. Through my works I convey my thoughts and mentality, and delve into the question of the meaning of life.'}
                </p>
              </>
            )}
          </div>
        </section>

        {/* ---- 獲獎 Awards Section ---- */}
        <section className={styles.timelineSection}>
          <div className={styles.timelineHeader}>
            <h2 className={styles.sectionTitle}>{zh ? '獲獎' : 'Awards'}</h2>
            {isAdmin && (
              <button className={admin.addBtn} onClick={() => setShowAwardForm(true)}>
                + {zh ? '新增獲獎' : 'Add Award'}
              </button>
            )}
          </div>

          {awardYears.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{zh ? '尚無獲獎資料。' : 'No awards listed yet.'}</p>
            </div>
          ) : (
            <div className={styles.timeline}>
              {awardYears.map((year) => (
                <div key={year} className={styles.yearGroup}>
                  <div className={styles.yearLabel}>{year}</div>
                  <div className={styles.yearEntries}>
                    {awardsByYear[year].map((award) => {
                      const name = zh ? award.name : (award.name_en || award.name)
                      const competition = zh ? award.competition : (award.competition_en || award.competition)
                      const prize = zh ? award.prize : (award.prize_en || award.prize)

                      return (
                        <div key={award.id} className={styles.entry}>
                          <h3 className={styles.entryTitle}>{name}</h3>
                          <p className={styles.entryDescription}>
                            {competition && prize && `${competition} · ${prize}`}
                            {competition && !prize && competition}
                            {!competition && prize && prize}
                          </p>
                          {isAdmin && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                              <button className={admin.editBtn} onClick={() => openAwardEdit(award)}>
                                {zh ? '編輯' : 'Edit'}
                              </button>
                              <button className={admin.deleteBtn} onClick={() => handleDeleteAward(award.id)}>
                                刪除
                              </button>
                            </div>
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

        {/* ---- 展覽 CV Exhibitions Section ---- */}
        <section className={styles.timelineSection}>
          <div className={styles.timelineHeader}>
            <h2 className={styles.sectionTitle}>{zh ? '展覽' : 'Exhibitions'}</h2>
            {isAdmin && (
              <button className={admin.addBtn} onClick={() => setShowExhForm(true)}>
                + {zh ? '新增展覽' : 'Add Exhibition'}
              </button>
            )}
          </div>

          {exhYears.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{zh ? '尚無展覽資料。' : 'No exhibitions listed yet.'}</p>
            </div>
          ) : (
            <div className={styles.timeline}>
              {exhYears.map((year) => (
                <div key={year} className={styles.yearGroup}>
                  <div className={styles.yearLabel}>{year}</div>
                  <div className={styles.yearEntries}>
                    {exhByYear[year].map((exh) => {
                      const title = zh ? exh.title : (exh.title_en || exh.title)
                      const venue = zh ? exh.venue : (exh.venue_en || exh.venue)
                      const region = zh ? exh.region : (exh.region_en || exh.region)

                      return (
                        <div key={exh.id} className={styles.entry}>
                          <h3 className={styles.entryTitle}>{title}</h3>
                          <p className={styles.entryDescription}>
                            {venue && region && `${venue} · ${region}`}
                            {venue && !region && venue}
                            {!venue && region && region}
                          </p>
                          {isAdmin && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                              <button className={admin.editBtn} onClick={() => openExhEdit(exh)}>
                                {zh ? '編輯' : 'Edit'}
                              </button>
                              <button className={admin.deleteBtn} onClick={() => handleDeleteExh(exh.id)}>
                                刪除
                              </button>
                            </div>
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

        {/* ---- Award Edit Modal ---- */}
        {editingAward && (
          <div className={admin.overlay} onClick={() => setEditingAward(null)}>
            <div onClick={(e) => e.stopPropagation()}>
              <AwardForm
                award={editingAward}
                onSubmit={handleAwardSubmit}
                onCancel={() => setEditingAward(null)}
                loading={savingAward}
              />
            </div>
          </div>
        )}

        {/* ---- CV Exhibition Edit Modal ---- */}
        {editingExh && (
          <div className={admin.overlay} onClick={() => setEditingExh(null)}>
            <div onClick={(e) => e.stopPropagation()}>
              <CvExhibitionForm
                exhibition={editingExh}
                onSubmit={handleExhSubmit}
                onCancel={() => setEditingExh(null)}
                loading={savingExh}
              />
            </div>
          </div>
        )}

        {/* ---- Award Modal ---- */}
        {showAwardForm && (
          <div className={admin.overlay} onClick={() => setShowAwardForm(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <AwardForm
                onSubmit={handleAwardSubmit}
                onCancel={() => setShowAwardForm(false)}
                loading={savingAward}
              />
            </div>
          </div>
        )}

        {/* ---- CV Exhibition Modal ---- */}
        {showExhForm && (
          <div className={admin.overlay} onClick={() => setShowExhForm(false)}>
            <div onClick={(e) => e.stopPropagation()}>
              <CvExhibitionForm
                onSubmit={handleExhSubmit}
                onCancel={() => setShowExhForm(false)}
                loading={savingExh}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
