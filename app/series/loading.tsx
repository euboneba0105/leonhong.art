import styles from '@/styles/artworks.module.css'

export default function Loading() {
  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        <div className={styles.seriesCardsCenterWrap}>
          <div className={styles.seriesCardsGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.seriesCardWrap}>
                <div className={styles.skeletonCard} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div className={styles.skeletonImage} style={{ borderRadius: 4 }} />
                  <div className={styles.skeletonText} style={{ width: '60%', marginTop: '0.75rem' }} />
                  <div className={styles.skeletonText} style={{ width: '40%', marginTop: '0.35rem' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
