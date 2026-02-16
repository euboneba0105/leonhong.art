import Link from 'next/link'
import styles from '@/styles/home.module.css'

export const metadata = {
  title: 'Leon\'s Art Studio | Artist Portfolio',
  description: 'Professional artist specializing in oil paintings, watercolors, and drawings.',
}

export default function Home() {
  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Leon's Art Studio</h1>
          <p className={styles.tagline}>繪畫藝術家 | Professional Artist</p>
        </div>
      </header>

      <nav className={styles.navbar}>
        <ul>
          <li><a href="/index.html" className={styles.navLink}>首頁</a></li>
          <li><a href="/portfolio.html" className={styles.navLink}>靜態作品集</a></li>
          <li><Link href="/artworks" className={styles.navLink}>Dynamic Gallery</Link></li>
          <li><a href="/about.html" className={styles.navLink}>關於我</a></li>
        </ul>
      </nav>

      <main className={styles.mainContent}>
        <section className={styles.hero}>
          <h2>Welcome to My Art World</h2>
          <p>Explore my collection of original artworks across multiple mediums</p>
          <div className={styles.cta}>
            <Link href="/artworks" className={styles.ctaButton}>
              View Dynamic Gallery
            </Link>
            <a href="/portfolio.html" className={styles.ctaButtonSecondary}>
              View Static Portfolio
            </a>
          </div>
        </section>

        <section className={styles.description}>
          <h3>About This Portfolio</h3>
          <p>
            This is a Next.js 16 portfolio powered by Supabase for dynamic artwork management.
            The artworks are stored in a Supabase database and displayed with optimized image loading.
          </p>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; 2026 Leon's Art Studio. All rights reserved.</p>
      </footer>
    </div>
  )
}
