// Fonts are self-hosted (bundled from npm) so they also work offline inside the installed PWA.
import '@fontsource/bungee/400.css'
import '@fontsource-variable/nunito/index.css'
import './globals.scss'
import { SerwistProvider } from '@serwist/turbopack/react'
import type { Metadata, Viewport } from 'next'
import { ReactNode } from 'react'
import { Toaster } from 'react-hot-toast'
import { PWA_CONFIG } from '@/app/(pwa)/services/pwa'
import ThemeRegistry from '@/app/components/ThemeRegistry'

export const metadata: Metadata = {
  applicationName: PWA_CONFIG.name,
  title: {
    default: PWA_CONFIG.name,
    template: `%s · ${PWA_CONFIG.name}`
  },
  description: PWA_CONFIG.description,
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: PWA_CONFIG.shortName
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: PWA_CONFIG.themeColor
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <SerwistProvider swUrl="/serwist/sw.js">
          <ThemeRegistry>
            {children}
            <Toaster
              position="bottom-center"
              toastOptions={{
                style: {
                  background: 'var(--color-panel)',
                  color: 'var(--color-text)',
                  border: '3px solid var(--color-panel-border)',
                  borderRadius: 14,
                  fontWeight: 700
                }
              }}
            />
          </ThemeRegistry>
        </SerwistProvider>
      </body>
    </html>
  )
}
