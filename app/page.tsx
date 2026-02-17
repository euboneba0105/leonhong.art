import Link from 'next/link'
import styles from '@/styles/home.module.css'

export const metadata = {
  title: 'Art Portfolio',
  description: 'Artist portfolio powered by Next.js and Supabase.',
}

export default function Home() {
  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Art Portfolio</h1>
        </div>
      </header>

      <nav className={styles.navbar}>
        <ul>
          <li><Link href="/" className={styles.navLink}>Home</Link></li>
          <li><Link href="/artworks" className={styles.navLink}>Gallery</Link></li>
        </ul>
      </nav>

      <main className={styles.mainContent}>
        <section className={styles.hero}>
          <h2>Welcome</h2>
          <p>Explore the collection of original artworks</p>
          <div className={styles.cta}>
            <Link href="/artworks" className={styles.ctaButton}>
              View Gallery
            </Link>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>&copy; {new Date().getFullYear()} Art Portfolio</p>
      </footer>
    </div>
  )
}
