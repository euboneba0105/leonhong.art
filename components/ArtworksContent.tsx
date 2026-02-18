'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import ArtworkGrid from './ArtworkGrid'
import type { Artwork } from '@/lib/supabaseClient'
import styles from '@/styles/artworks.module.css'
import admin from '@/styles/adminUI.module.css'

interface ArtworksContentProps {
  artworks: Artwork[]
  error: string | null
}

export default function ArtworksContent({ artworks, error }: ArtworksContentProps) {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const { data: session } = useSession()
  const router = useRouter()
  const isAdmin = !!(session?.user as any)?.isAdmin

  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', year: '', medium: '', size: '', description: '', image_url: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/artworks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        year: form.year ? Number(form.year) : null,
      }),
    })
    setSaving(false)
    if (res.ok) {
      setShowForm(false)
      setForm({ title: '', year: '', medium: '', size: '', description: '', image_url: '' })
      router.refresh()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(zh ? '確定要刪除此作品？' : 'Delete this artwork?')) return
    await fetch('/api/artworks', {
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
              + {zh ? '新增作品' : 'Add Artwork'}
            </button>
          </div>
        )}

        {error ? (
          <div className={styles.errorMessage}>
            <p>{zh ? '載入作品失敗，請稍後再試。' : error}</p>
            <p className={styles.errorSubtext}>
              {zh ? '請檢查網路連線後重新整理頁面。' : 'Please check your connection and try refreshing the page.'}
            </p>
          </div>
        ) : artworks.length === 0 ? (
          <div className={styles.emptyState}>
            <p>{zh ? '尚無作品，請稍後再來！' : 'No artworks found yet. Check back soon!'}</p>
          </div>
        ) : (
          <ArtworkGrid artworks={artworks} isAdmin={isAdmin} onDelete={handleDelete} />
        )}

        {showForm && (
          <div className={admin.overlay} onClick={() => setShowForm(false)}>
            <form className={admin.modal} onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
              <h2 className={admin.modalTitle}>{zh ? '新增作品' : 'Add Artwork'}</h2>

              <div className={admin.formGroup}>
                <label className={admin.formLabel}>{zh ? '作品名稱' : 'Title'} *</label>
                <input className={admin.formInput} required value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>

              <div className={admin.formRow}>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>{zh ? '年份' : 'Year'}</label>
                  <input className={admin.formInput} type="number" value={form.year}
                    onChange={(e) => setForm({ ...form, year: e.target.value })} />
                </div>
                <div className={admin.formGroup}>
                  <label className={admin.formLabel}>{zh ? '媒材' : 'Medium'}</label>
                  <input className={admin.formInput} value={form.medium}
                    onChange={(e) => setForm({ ...form, medium: e.target.value })} />
                </div>
              </div>

              <div className={admin.formGroup}>
                <label className={admin.formLabel}>{zh ? '尺寸' : 'Size'}</label>
                <input className={admin.formInput} value={form.size} placeholder="e.g. 120 x 80 cm"
                  onChange={(e) => setForm({ ...form, size: e.target.value })} />
              </div>

              <div className={admin.formGroup}>
                <label className={admin.formLabel}>{zh ? '說明' : 'Description'}</label>
                <textarea className={admin.formTextarea} value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className={admin.formGroup}>
                <label className={admin.formLabel}>{zh ? '圖片網址' : 'Image URL'}</label>
                <input className={admin.formInput} value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
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
