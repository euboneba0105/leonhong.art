'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import type { Exhibition, Award } from '@/lib/supabaseClient'
import styles from '@/styles/events.module.css'
import admin from '@/styles/adminUI.module.css'

interface EventsContentProps {
  exhibitions: Exhibition[]
  awards: Award[]
}

export default function EventsContent({ exhibitions, awards }: EventsContentProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = !!(session?.user as any)?.isAdmin

  // Award form state
  const [showAwardForm, setShowAwardForm] = useState(false)
  const [savingAward, setSavingAward] = useState(false)
  const [awardErrMsg, setAwardErrMsg] = useState('')
  const [awardForm, setAwardForm] = useState({
    year: '', name: '', name_en: '', category: '', category_en: '', award: '', award_en: '',
  })

  // Exhibition form state
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [form, setForm] = useState({
    year: '', title: '', title_en: '', venue: '', venue_en: '', region: '', region_en: '',
  })

  async function handleAwardSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSavingAward(true)
    setAwardErrMsg('')
    try {
      const res = await fetch('/api/awards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...awardForm,
          year: awardForm.year ? Number(awardForm.year) : null,
        }),
      })
      if (res.ok) {
        setShowAwardForm(false)
        setAwardForm({ year: '', name: '', name_en: '', category: '', category_en: '', award: '', award_en: '' })
        router.refresh()
      } else {
        const data = await res.json().catch(() => null)
        setAwardErrMsg(data?.error || `儲存失敗 (${res.status})`)
      }
    } catch (err: any) {
      setAwardErrMsg(err.message || '網路錯誤')
    }
    setSavingAward(false)
  }

  async function handleAwardDelete(id: string) {
    if (!confirm(zh ? '確定要刪除此獲獎紀錄？' : 'Delete this award?')) return
    await fetch('/api/awards', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrMsg('')
    try {
      const res = await fetch('/api/exhibitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          year: form.year ? Number(form.year) : null,
        }),
      })
      if (res.ok) {
        setShowForm(false)
        setForm({ year: '', title: '', title_en: '', venue: '', venue_en: '', region: '', region_en: '' })
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

  async function handleDelete(id: string) {
    if (!confirm(zh ? '確定要刪除此展覽？' : 'Delete this exhibition?')) return
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

        {/* ── 獲獎區塊 ── */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className={styles.sectionTitle}>{zh ? '獲獎' : 'Awards'}</h2>
            {isAdmin && (
              <button className={admin.addBtn} onClick={() => setShowAwardForm(true)}>
                + {zh ? '新增獲獎' : 'Add Award'}
              </button>
            )}
          </div>

          {awards.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{zh ? '目前尚無獲獎紀錄。' : 'No awards listed yet.'}</p>
            </div>
          ) : (
            <div className={styles.eventList}>
              {awards.map((a) => {
                const name = zh ? a.name : (a.name_en || a.name)
                const category = zh ? a.category : (a.category_en || a.category)
                const award = zh ? a.award : (a.award_en || a.award)

                return (
                  <article key={a.id} className={styles.eventCard}>
                    <div className={styles.cardBody}>
                      {a.year && <p className={styles.date}>{a.year}</p>}
                      <h2 className={styles.eventTitle}>{name}</h2>
                      <p className={styles.location}>{category}</p>
                      <p>{award}</p>
                      {isAdmin && (
                        <button className={admin.deleteBtn} onClick={() => handleAwardDelete(a.id)}>
                          {zh ? '刪除' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* ── 展覽區塊 ── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h2 className={styles.sectionTitle}>{zh ? '展覽' : 'Exhibitions'}</h2>
            {isAdmin && (
              <button className={admin.addBtn} onClick={() => setShowForm(true)}>
                + {zh ? '新增展覽' : 'Add Exhibition'}
              </button>
            )}
          </div>

          {exhibitions.length === 0 ? (
            <div className={styles.emptyState}>
              <p>{zh ? '目前尚無展覽資訊。' : 'No exhibitions listed yet.'}</p>
            </div>
          ) : (
            <div className={styles.eventList}>
              {exhibitions.map((event) => {
                const title = zh ? event.title : (event.title_en || event.title)
                const venue = zh ? event.venue : (event.venue_en || event.venue)
                const region = zh ? event.region : (event.region_en || event.region)

                return (
                  <article key={event.id} className={styles.eventCard}>
                    <div className={styles.cardBody}>
                      {event.year && <p className={styles.date}>{event.year}</p>}
                      <h2 className={styles.eventTitle}>{title}</h2>
                      {venue && <p className={styles.location}>{venue}</p>}
                      {region && <p className={styles.location}>{region}</p>}
                      {isAdmin && (
                        <button className={admin.deleteBtn} onClick={() => handleDelete(event.id)}>
                          {zh ? '刪除' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        {/* ── 新增獲獎 Modal ── */}
        {showAwardForm && (
          <div className={admin.overlay} onClick={() => setShowAwardForm(false)}>
            <form className={admin.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleAwardSubmit}>
              <h2 className={admin.modalTitle}>{zh ? '新增獲獎' : 'Add Award'}</h2>

              <div className={admin.formGroup}>
                <label className={admin.formLabel}>{zh ? '年份' : 'Year'}</label>
                <input className={admin.formInput} type="number" value={awardForm.year}
                  onChange={(e) => setAwardForm({ ...awardForm, year: e.target.value })} />
              </div>

              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>獎項名稱 (中文) *</label>
                  <input className={admin.formInput} required value={awardForm.name}
                    onChange={(e) => setAwardForm({ ...awardForm, name: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>Award Name (EN)</label>
                  <input className={admin.formInput} value={awardForm.name_en}
                    onChange={(e) => setAwardForm({ ...awardForm, name_en: e.target.value })} />
                </div>
              </div>

              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>競賽類別 (中文) *</label>
                  <input className={admin.formInput} required value={awardForm.category}
                    onChange={(e) => setAwardForm({ ...awardForm, category: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>Competition Category (EN)</label>
                  <input className={admin.formInput} value={awardForm.category_en}
                    onChange={(e) => setAwardForm({ ...awardForm, category_en: e.target.value })} />
                </div>
              </div>

              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>獎項 (中文) *</label>
                  <input className={admin.formInput} required value={awardForm.award}
                    onChange={(e) => setAwardForm({ ...awardForm, award: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>Award (EN)</label>
                  <input className={admin.formInput} value={awardForm.award_en}
                    onChange={(e) => setAwardForm({ ...awardForm, award_en: e.target.value })} />
                </div>
              </div>

              {awardErrMsg && <p style={{ color: 'red', margin: '0 0 12px' }}>{awardErrMsg}</p>}
              <div className={admin.modalActions}>
                <button type="button" className={admin.cancelBtn} onClick={() => setShowAwardForm(false)}>
                  {zh ? '取消' : 'Cancel'}
                </button>
                <button type="submit" className={admin.submitBtn} disabled={savingAward}>
                  {savingAward ? (zh ? '儲存中...' : 'Saving...') : (zh ? '儲存' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── 新增展覽 Modal ── */}
        {showForm && (
          <div className={admin.overlay} onClick={() => setShowForm(false)}>
            <form className={admin.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
              <h2 className={admin.modalTitle}>{zh ? '新增展覽' : 'Add Exhibition'}</h2>

              <div className={admin.formGroup}>
                <label className={admin.formLabel}>{zh ? '年份' : 'Year'}</label>
                <input className={admin.formInput} type="number" value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })} />
              </div>

              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>展覽名稱 (中文) *</label>
                  <input className={admin.formInput} required value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>Exhibition Name (EN)</label>
                  <input className={admin.formInput} value={form.title_en}
                    onChange={(e) => setForm({ ...form, title_en: e.target.value })} />
                </div>
              </div>

              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>場地空間 (中文)</label>
                  <input className={admin.formInput} value={form.venue}
                    onChange={(e) => setForm({ ...form, venue: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>Venue (EN)</label>
                  <input className={admin.formInput} value={form.venue_en}
                    onChange={(e) => setForm({ ...form, venue_en: e.target.value })} />
                </div>
              </div>

              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>地區 (中文)</label>
                  <input className={admin.formInput} value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>Region (EN)</label>
                  <input className={admin.formInput} value={form.region_en}
                    onChange={(e) => setForm({ ...form, region_en: e.target.value })} />
                </div>
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
      </main>
    </div>
  )
}
