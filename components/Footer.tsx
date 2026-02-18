'use client'

import { useLanguage } from './LanguageProvider'
import styles from '@/styles/footer.module.css'

export default function Footer() {
  const { lang, toggle } = useLanguage()

  return (
    <footer className={styles.footer}>
      <p>&copy; {new Date().getFullYear()} {lang === 'zh' ? '洪德忠' : 'Leon Hong'}</p>
      <button onClick={toggle} className={styles.langToggle}>
        {lang === 'zh' ? 'EN' : '中文'}
      </button>
    </footer>
  )
}
