export default function Loading() {
  return (
    <main
      style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: '3rem 2rem',
        minHeight: '60vh',
      }}
      aria-busy="true"
      aria-label="載入中"
    >
      <div
        style={{
          width: '100%',
          paddingBottom: '40%',
          backgroundColor: '#e5e5e5',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
          marginBottom: '2rem',
        }}
      />
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: '30%',
              minWidth: 200,
              paddingBottom: '30%',
              backgroundColor: '#e5e5e5',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />
        ))}
      </div>
    </main>
  )
}
