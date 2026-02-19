'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import ArtworkGrid from './ArtworkGrid'
import type { Artwork, Series } from '@/lib/supabaseClient'
import styles from '@/styles/artworks.module.css'
import admin from '@/styles/adminUI.module.css'

interface SeriesDetailContentProps {
  series: Series | null
  artworks: Artwork[]
  seriesList: Series[]
  isStandalone: boolean
}

export default function SeriesDetailContent({ series, artworks, seriesList, isStandalone }: SeriesDetailContentProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = !!(session?.user as any)?.isAdmin

  const [showEdit, setShowEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [form, setForm] = useState({
    name: series?.name || '',
    name_en: series?.name_en || '',
    description: series?.description || '',
    description_en: series?.description_en || '',
  })

  const title = isStandalone
    ? (zh ? '獨立作品' : 'Standalone')
    : (zh ? series!.name : (series!.name_en || series!.name))

  const description = !isStandalone && series
    ? (zh ? series.description : (series.description_en || series.description))
    : null

  async function handleDeleteArtwork(id: string) {
    if (!confirm(zh ? '確定要刪除此作品？' : 'Delete this artwork?')) return
    await fetch('/api/artworks', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  async function handleEditSeries(e: React.FormEvent) {
    e.preventDefault()
    if (!series) return
    setSaving(true)
    setErrMsg('')
    try {
      const res = await fetch('/api/series', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: series.id, ...form }),
      })
      if (res.ok) { setShowEdit(false); router.refresh() }
      else { const d = await res.json().catch(() => null); setErrMsg(d?.error || `Error (${res.status})`) }
    } catch (err: any) { setErrMsg(err.message || '網路錯誤') }
    setSaving(false)
  }

  async function handleDeleteSeries() {
    if (!series) return
    if (!confirm(zh ? '確定要刪除此系列？系列內的作品不會被刪除。' : 'Delete this series? Artworks in this series will not be deleted.')) return
    await fetch('/api/series', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: series.id }),
    })
    router.push('/')
  }

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/" style={{ color: '#555', textDecoration: 'none', fontSize: '0.95rem' }}>
            ← {zh ? '返回全部作品' : 'Back to All Works'}
          </Link>
        </div>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1a1a1a' }}>
          {title}
        </h1>

        {description && (
          <p style={{ color: '#555', marginBottom: '2rem', lineHeight: 1.6 }}>{description}</p>
        )}

        {isAdmin && !isStandalone && series && (
          <div className={admin.adminBar} style={{ justifyContent: 'flex-start', marginBottom: '2rem' }}>
            <button className={admin.editBtn} onClick={() => setShowEdit(true)}>{zh ? '編輯系列' : 'Edit Series'}</button>
            <button className={admin.deleteBtn} onClick={handleDeleteSeries}>{zh ? '刪除系列' : 'Delete Series'}</button>
          </div>
        )}

        {artworks.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{zh ? '此系列尚無作品。' : 'No artworks in this series yet.'}</p>
          </div>
        ) : (
          <ArtworkGrid artworks={artworks} isAdmin={isAdmin} onDelete={handleDeleteArtwork} />
        )}

        {showEdit && series && (
          <div className={admin.overlay} onClick={() => setShowEdit(false)}>
            <form className={admin.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleEditSeries}>
              <h2 className={admin.modalTitle}>{zh ? '編輯系列' : 'Edit Series'}</h2>
              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>系列名稱 (中文) *</label>
                  <input className={admin.formInput} required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>Series Name (EN)</label>
                  <input className={admin.formInput} value={form.name_en}
                    onChange={(e) => setForm({ ...form, name_en: e.target.value })} />
                </div>
              </div>
              <div className={admin.formGroup}>
                <label className={admin.formLabel}>敘述 (中文)</label>
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
                <button type="button" className={admin.cancelBtn} onClick={() => setShowEdit(false)}>
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
