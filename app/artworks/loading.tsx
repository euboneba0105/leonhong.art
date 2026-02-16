import styles from '@/styles/artworks.module.css'

export default function Loading() {
  return (
    <div className={styles.pageContainer}>
      <header className={styles.pageHeader}>
        <h1>Artworks Gallery</h1>
        <p>Explore my collection of original artworks</p>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.gridContainer}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonImage} />
              <div className={styles.skeletonText} />
              <div className={styles.skeletonText} style={{ width: '60%' }} />
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
