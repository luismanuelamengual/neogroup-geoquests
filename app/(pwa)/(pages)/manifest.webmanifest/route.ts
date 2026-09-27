import { NextResponse } from 'next/server'
import { PWA_CONFIG } from '@/app/(pwa)/services/pwa'

/**
 * Web App Manifest. Its path contains a dot, so the auth proxy never runs for
 * it: the browser can always fetch it without a session.
 */
export function GET(): NextResponse {
  const manifest = {
    name: PWA_CONFIG.name,
    short_name: PWA_CONFIG.shortName,
    description: PWA_CONFIG.description,
    lang: 'es',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    // Street views are nicer in landscape but the menus are designed for
    // portrait: let the player rotate freely.
    orientation: 'any',
    theme_color: PWA_CONFIG.themeColor,
    background_color: PWA_CONFIG.backgroundColor,
    categories: ['games', 'education', 'travel'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  }

  return NextResponse.json(manifest, { headers: { 'Content-Type': 'application/manifest+json' } })
}
