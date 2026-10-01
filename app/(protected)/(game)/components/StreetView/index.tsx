'use client'

import './index.scss'
import { useMemo } from 'react'
import { useI18n } from '@/app/i18n/I18nProvider'

const EMBED_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY

/**
 * Immersive street-level view of a round: Google Street View through the Maps
 * Embed API (free, unlimited; needs a browser API key restricted to this
 * site). The panorama opens looking to a random direction; from there the
 * player moves and looks around freely.
 *
 * The embed shows a card with the address (top-left) and its controls
 * (compass, zoom, extra button) in the bottom-right corner. They can't be
 * hidden — the iframe belongs to Google — so the iframe is rendered larger
 * than the visible area and the container clips the excess (see the
 * --crop-* variables in index.scss, where the pixels are adjusted). Google's
 * logo and terms at the bottom stay visible, as the terms of service
 * require. Zooming still works with the wheel / pinch.
 */
export default function StreetView({ panoId }: { panoId: string }) {
  const { t, locale } = useI18n()
  // A new random heading per panorama (not per render).
  const src = useMemo(() => {
    const params = new URLSearchParams({
      key: EMBED_KEY ?? '',
      pano: panoId,
      heading: String(Math.floor(Math.random() * 360)),
      pitch: '0',
      fov: '90',
      language: locale
    })

    return `https://www.google.com/maps/embed/v1/streetview?${params}`
  }, [panoId, locale])

  return (
    <div className="street-view">
      {EMBED_KEY ? (
        <>
          <iframe
            key={panoId}
            className="viewer"
            src={src}
            title="Street View"
            loading="eager"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </>
      ) : (
        <div className="street-view-error">{t('game.streetViewKey', { key: 'NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY' })}</div>
      )}
    </div>
  )
}
