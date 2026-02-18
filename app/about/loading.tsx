import styles from '@/styles/about.module.css'

export default function Loading() {
  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        <section className={styles.bioSection}>
          <div className={styles.skeletonPortrait} />
          <div className={styles.bioContent}>
            <div className={styles.skeletonText} style={{ width: '40%', height: '2rem' }} />
            <div className={styles.skeletonText} style={{ width: '100%' }} />
            <div className={styles.skeletonText} style={{ width: '90%' }} />
            <div className={styles.skeletonText} style={{ width: '75%' }} />
          </div>
        </section>

        <section className={styles.timelineSection}>
          <div className={styles.skeletonText} style={{ width: '30%', height: '2rem', marginBottom: '2rem' }} />
          {[...Array(3)].map((_, i) => (
            <div key={i} className={styles.skeletonEntry}>
              <div className={styles.skeletonText} style={{ width: '80px', height: '1.5rem' }} />
              <div className={styles.skeletonText} style={{ width: '60%' }} />
              <div className={styles.skeletonText} style={{ width: '40%' }} />
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}
