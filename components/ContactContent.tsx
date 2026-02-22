'use client'

import { useState, FormEvent } from 'react'
import { useLanguage } from './LanguageProvider'
import styles from '@/styles/contact.module.css'

export default function ContactContent() {
  const { lang } = useLanguage()
  const zh = lang === 'zh'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const labels = {
    name: zh ? '姓名' : 'Name',
    email: zh ? '信箱' : 'Email',
    message: zh ? '訊息' : 'Message',
    send: zh ? '送出' : 'Send',
    sending: zh ? '送出中…' : 'Sending…',
    successMessage: zh ? '感謝您的來信，我們會盡快回覆。' : 'Thank you for your message. We will get back to you soon.',
    errorGeneric: zh ? '無法送出，請稍後再試。' : 'Something went wrong. Please try again later.',
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error ?? labels.errorGeneric)
        return
      }
      setSuccess(true)
      setName('')
      setEmail('')
      setMessage('')
    } catch {
      setError(labels.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        <h1 className={styles.title}>{zh ? '聯繫' : 'Contact'}</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="contact-name" className={styles.label}>
              {labels.name}
            </label>
            <input
              id="contact-name"
              type="text"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              disabled={loading}
              autoComplete="name"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="contact-email" className={styles.label}>
              {labels.email}
            </label>
            <input
              id="contact-email"
              type="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="contact-message" className={styles.label}>
              {labels.message}
            </label>
            <textarea
              id="contact-message"
              className={styles.textarea}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              maxLength={5000}
              rows={5}
              disabled={loading}
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          {success && <p className={styles.success}>{labels.successMessage}</p>}
          <button
            type="submit"
            className={styles.submit}
            disabled={loading}
          >
            {loading ? labels.sending : labels.send}
          </button>
        </form>

        <div className={styles.socialList}>
          <a
            href="https://www.instagram.com/superleon0122"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialItem}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <circle cx="12" cy="12" r="5" />
              <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            <span>Instagram</span>
          </a>

          <a
            href="https://www.facebook.com/leon.hong.35"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.socialItem}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
            </svg>
            <span>Facebook</span>
          </a>
        </div>
      </main>
    </div>
  )
}
