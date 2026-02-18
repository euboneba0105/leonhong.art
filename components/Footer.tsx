'use client'

import { useLanguage } from './LanguageProvider'
import styles from '@/styles/footer.module.css'

export default function Footer() {
  const { lang } = useLanguage()

  return (
    <footer className={styles.footer}>
      <p>&copy; {new Date().getFullYear()} {lang === 'zh' ? '洪德忠' : 'Leon Hong'}</p>
    </footer>
  )
}
