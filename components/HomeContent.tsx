'use client'

import Link from 'next/link'
import { useLanguage } from './LanguageProvider'
import Footer from './Footer'
import styles from '@/styles/home.module.css'

export default function HomeContent() {
  const { lang } = useLanguage()
  const zh = lang === 'zh'

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>{zh ? '洪德忠' : 'Leon Hong'}</h1>
        </div>
      </header>

      <nav className={styles.navbar}>
        <ul>
          <li><Link href="/" className={styles.navLink}>{zh ? '首頁' : 'Home'}</Link></li>
          <li><Link href="/artworks" className={styles.navLink}>{zh ? '作品集' : 'Gallery'}</Link></li>
          <li><Link href="/about" className={styles.navLink}>{zh ? '關於' : 'About'}</Link></li>
        </ul>
      </nav>

      <main className={styles.mainContent}>
        <section className={styles.hero}>
          <h2>{zh ? '歡迎' : 'Welcome'}</h2>
          <p>{zh ? '探索原創藝術作品' : 'Explore the collection of original artworks'}</p>
          <div className={styles.cta}>
            <Link href="/artworks" className={styles.ctaButton}>
              {zh ? '瀏覽作品' : 'View Gallery'}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
