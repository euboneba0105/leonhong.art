'use client'

import { useState, FormEvent } from 'react'
import { useLanguage } from './LanguageProvider'
import styles from '@/styles/contact.module.css'

export default function ContactContent() {
  const { lang } = useLanguage()
  const zh = lang === 'zh'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const labels = {
    to: zh ? '收件者' : 'To',
    from: zh ? '寄件者' : 'From',
    name: zh ? '姓名' : 'Name',
    email: zh ? '信箱' : 'Email',
    subject: zh ? '主旨' : 'Subject',
    message: zh ? '內文' : 'Message',
    send: zh ? '送出' : 'Send',
    sending: zh ? '送出中…' : 'Sending…',
    successMessage: zh ? '感謝您的來信，我們會盡快回覆。' : 'Thank you for your message. We will get back to you soon.',
    errorGeneric: zh ? '無法送出，請稍後再試。' : 'Something went wrong. Please try again later.',
    toValue: zh ? '洪德忠 Leon Hong' : 'Leon Hong',
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
        body: JSON.stringify({ name, email, subject: subject.trim() || undefined, message }),
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error ?? labels.errorGeneric)
        return
      }
      setSuccess(true)
      setName('')
      setEmail('')
      setSubject('')
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
        <h1 className={styles.title}>{zh ? '與我聯繫' : 'Get in Touch'}</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.composePanel}>
            <div className={styles.composeRow}>
              <span className={styles.composeLabel}>{labels.to}</span>
              <input
                type="text"
                className={styles.composeInput}
                value={labels.toValue}
                readOnly
                aria-readonly
                tabIndex={-1}
              />
            </div>
            <div className={styles.composeRow}>
              <span className={styles.composeLabel}>{labels.from}</span>
              <div className={styles.fromFields}>
                <input
                  id="contact-name"
                  type="text"
                  className={styles.inputInline}
                  placeholder={labels.name}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                  disabled={loading}
                  autoComplete="name"
                />
                <span className={styles.fromSeparator}>&lt;</span>
                <input
                  id="contact-email"
                  type="email"
                  className={styles.inputInline}
                  placeholder={labels.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  autoComplete="email"
                />
                <span className={styles.fromSeparator}>&gt;</span>
              </div>
            </div>
            <div className={styles.composeRow}>
              <span className={styles.composeLabel}>{labels.subject}</span>
              <input
                id="contact-subject"
                type="text"
                className={styles.composeInput}
                placeholder={zh ? '請輸入主旨' : 'Enter subject'}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={200}
                disabled={loading}
              />
            </div>
            <div className={styles.bodyRow}>
              <textarea
                id="contact-message"
                className={styles.bodyTextarea}
                placeholder={zh ? '輸入您的訊息…' : 'Type your message…'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                maxLength={5000}
                rows={12}
                disabled={loading}
              />
            </div>
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
      </main>
    </div>
  )
}
