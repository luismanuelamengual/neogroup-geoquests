import type { Metadata } from 'next'

/**
 * Offline fallback page. Precached by the service worker and shown when a
 * navigation fails without network. It must stay fully static (no session,
 * no data). Excluded from the auth proxy so it renders for everyone.
 */
export const metadata: Metadata = {
  title: 'Sin conexión'
}

export default function OfflinePage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.75rem',
        padding: '2rem',
        textAlign: 'center',
        color: '#f8fafc',
        background: '#0b1026'
      }}
    >
      <div style={{ fontSize: '3rem' }}>🛰️</div>
      <h1
        style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 400, margin: 0, color: '#ffc233' }}
      >
        Sin señal
      </h1>
      <p style={{ maxWidth: '28rem', margin: 0, color: '#aab4e8', lineHeight: 1.5 }}>
        GeoQuests necesita internet para traer las calles del mundo. Revisá tu conexión y volvé a intentarlo.
      </p>
    </main>
  )
}
