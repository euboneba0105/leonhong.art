import styles from '@/styles/artworks.module.css'

export default function Loading() {
  return (
    <div className={`${styles.pageContainer} ${styles.seriesDetailLoadingRoot}`}>
      <main className={styles.mainContent}>
        <div className={styles.seriesHeaderRow}>
          <div
            style={{
              width: '4rem',
              height: '1.25rem',
              backgroundColor: '#e5e5e5',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              borderRadius: 2,
            }}
            aria-hidden
          />
        </div>

        <div className={styles.seriesPageContentRow}>
          <div className={styles.seriesPageContentLeft}>
            <div className={styles.seriesIntro}>
              <div
                className={styles.skeletonText}
                style={{ width: '50%', height: '2rem', marginBottom: '0.75rem' }}
              />
              <div
                className={styles.skeletonText}
                style={{ width: '90%', marginBottom: '0.5rem' }}
              />
              <div
                className={styles.skeletonText}
                style={{ width: '70%', marginBottom: '2rem' }}
              />
            </div>
            <div
              style={{
                width: '100%',
                paddingBottom: '60%',
                backgroundColor: '#e5e5e5',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                borderRadius: 4,
              }}
              aria-hidden
            />
            <div style={{ marginTop: '2rem' }}>
              <div className={styles.skeletonText} style={{ width: '40%', marginBottom: '0.5rem' }} />
              <div className={styles.skeletonText} style={{ width: '85%', marginBottom: '0.5rem' }} />
              <div className={styles.skeletonText} style={{ width: '60%' }} />
            </div>
          </div>

          <div className={styles.seriesGalleryThumbs}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className={styles.seriesDetailLoadingThumb}
                style={{
                  backgroundColor: '#e5e5e5',
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
                aria-hidden
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
