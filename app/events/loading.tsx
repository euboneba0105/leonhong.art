import styles from '@/styles/events.module.css'

export default function Loading() {
  return (
    <div className={styles.pageContainer}>
      <main className={styles.mainContent}>
        <div className={styles.eventList}>
          {[...Array(2)].map((_, i) => (
            <div key={i} className={styles.eventCard}>
              <div style={{ width: '100%', paddingBottom: '56.25%', backgroundColor: '#e5e5e5', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
              <div style={{ padding: '1.5rem' }}>
                <div style={{ width: '60%', height: '1.5rem', backgroundColor: '#e5e5e5', marginBottom: '0.75rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                <div style={{ width: '40%', height: '1rem', backgroundColor: '#e5e5e5', marginBottom: '0.5rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                <div style={{ width: '30%', height: '1rem', backgroundColor: '#e5e5e5', marginBottom: '1rem', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
                <div style={{ width: '100%', height: '1rem', backgroundColor: '#e5e5e5', animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
