'use client'

import './index.scss'
import { useMemo } from 'react'

const EMBED_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY

/**
 * Immersive street-level view of a round: Google Street View through the Maps
 * Embed API (free, unlimited; needs a browser API key restricted to this
 * site). The panorama opens looking to a random direction; from there the
 * player moves and looks around freely.
 *
 * The embed shows a card with the address (and a "view on Google Maps" link)
 * in its top-left corner, which would give the answer away. It can't be
 * hidden — the iframe belongs to Google — so a panel of ours is laid over it
 * (`.address-cover`, sized with the --cover-* CSS variables). Google's logo
 * and terms at the bottom stay visible, as the terms of service require.
 */
export default function StreetView({ panoId }: { panoId: string }) {
  // A new random heading per panorama (not per render).
  const src = useMemo(() => {
    const params = new URLSearchParams({
      key: EMBED_KEY ?? '',
      pano: panoId,
      heading: String(Math.floor(Math.random() * 360)),
      pitch: '0',
      fov: '90',
      language: 'es'
    })

    return `https://www.google.com/maps/embed/v1/streetview?${params}`
  }, [panoId])

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
          <div className="address-cover" aria-hidden="true" />
        </>
      ) : (
        <div className="street-view-error">
          Falta configurar <code>NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY</code> para ver las imágenes.
        </div>
      )}
    </div>
  )
}
