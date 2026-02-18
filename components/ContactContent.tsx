'use client'

import { useLanguage } from './LanguageProvider'
import styles from '@/styles/contact.module.css'

export default function ContactContent() {
  const { lang } = useLanguage()
  const zh = lang === 'zh'

  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        <h1 className={styles.title}>{zh ? '聯繫' : 'Contact'}</h1>

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
