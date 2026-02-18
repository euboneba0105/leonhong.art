'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import type { Experience } from '@/lib/supabaseClient'
import styles from '@/styles/about.module.css'
import admin from '@/styles/adminUI.module.css'

interface AboutContentProps {
  experiences: Experience[]
}

export default function AboutContent({ experiences }: AboutContentProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = !!(session?.user as any)?.isAdmin

  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    year: '', title: '', title_en: '', category: '', category_en: '',
    description: '', description_en: '',
  })

  // Group experiences by year
  const experiencesByYear = experiences.reduce<Record<number, Experience[]>>((acc, exp) => {
    if (!acc[exp.year]) acc[exp.year] = []
    acc[exp.year].push(exp)
    return acc
  }, {})

  const sortedYears = Object.keys(experiencesByYear)
    .map(Number)
    .sort((a, b) => b - a)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/experiences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        year: Number(form.year),
      }),
    })
    setSaving(false)
    if (res.ok) {
      setShowForm(false)
      setForm({ year: '', title: '', title_en: '', category: '', category_en: '', description: '', description_en: '' })
      router.refresh()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(zh ? '確定要刪除此經歷？' : 'Delete this experience?')) return
    await fetch('/api/experiences', {
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

        {/* Experience Timeline Section */}
        <section className={styles.timelineSection}>
          <div className={styles.timelineHeader}>
            <h2 className={styles.sectionTitle}>{zh ? '經歷' : 'Experience'}</h2>
            {isAdmin && (
              <button className={admin.addBtn} onClick={() => setShowForm(true)}>
                + {zh ? '新增經歷' : 'Add Experience'}
              </button>
            )}
          </div>

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
                          {isAdmin && (
                            <button className={admin.deleteBtn} onClick={() => handleDelete(exp.id)}>
                              刪除
                            </button>
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

        {showForm && (
          <div className={admin.overlay} onClick={() => setShowForm(false)}>
            <form className={admin.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
              <h2 className={admin.modalTitle}>{zh ? '新增經歷' : 'Add Experience'}</h2>

              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>年份 *</label>
                  <input className={admin.formInput} type="number" required value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>類別 (中文) *</label>
                  <input className={admin.formInput} required value={form.category} placeholder="例：個展、聯展、獲獎"
                    onChange={(e) => setForm({ ...form, category: e.target.value })} />
                </div>
              </div>

              <div className={admin.formGroup}>
                <label className={admin.formLabel}>Category (EN)</label>
                <input className={admin.formInput} value={form.category_en} placeholder="e.g. Solo Exhibition"
                  onChange={(e) => setForm({ ...form, category_en: e.target.value })} />
              </div>

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
