'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from './LanguageProvider'
import { pathToZh, pathToEn, isEnPath } from '@/lib/locale'
import styles from '@/styles/footer.module.css'

export default function Footer() {
  const { lang } = useLanguage()
  const zh = lang === 'zh'
  const pathname = usePathname() ?? '/'
  const onEn = isEnPath(pathname)

  return (
    <footer className={styles.footer}>
      {/* Language toggle – links to alternate locale URL for SEO */}
      <div className={styles.langToggle}>
        <Link
          href={pathToZh(pathname)}
          className={`${styles.langOption} ${!onEn ? styles.langActive : ''}`}
          aria-current={!onEn ? 'true' : undefined}
        >
          中文
        </Link>
        <Link
          href={pathToEn(pathname)}
          className={`${styles.langOption} ${onEn ? styles.langActive : ''}`}
          aria-current={onEn ? 'true' : undefined}
        >
          EN
        </Link>
      </div>

      {/* Social icons */}
      <div className={styles.socialLinks}>
        <a
          href="https://www.instagram.com/superleon0122"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram"
          className={styles.socialIcon}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="5" />
            <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
          </svg>
        </a>
        <a
          href="https://www.facebook.com/leon.hong.35"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
          className={styles.socialIcon}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
          </svg>
        </a>
      </div>

      {/* Copyright */}
      <p className={styles.copyright}>
        &copy; {new Date().getFullYear()} {zh ? '洪德忠 Leon Hong' : 'Leon Hong'}
      </p>
    </footer>
  )
}
