'use client'

import 'mapillary-js/dist/mapillary.css'
import './index.scss'
import type { Viewer } from 'mapillary-js'
import { useEffect, useRef, useState } from 'react'

const ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN

/**
 * Immersive street-level viewer (MapillaryJS). Shows `imageId` and lets the
 * player look around (360° panoramas) and walk along the capture sequence.
 * The viewer is created once and moved to each new round's image.
 */
export default function StreetView({ imageId }: { imageId: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const imageIdRef = useRef(imageId)
  const [error, setError] = useState<string | null>(ACCESS_TOKEN ? null : 'missingToken')

  imageIdRef.current = imageId

  useEffect(() => {
    const container = containerRef.current

    if (!container || !ACCESS_TOKEN) {
      return
    }

    let disposed = false
    let resizeObserver: ResizeObserver | null = null

    import('mapillary-js').then(({ Viewer: MapillaryViewer }) => {
      if (disposed) {
        return
      }

      const viewer = new MapillaryViewer({
        accessToken: ACCESS_TOKEN,
        container,
        imageId: imageIdRef.current,
        component: { cover: false, bearing: true, zoom: true, sequence: true, direction: true }
      })

      viewer.on('dataloading', () => setError(null))
      viewerRef.current = viewer
      resizeObserver = new ResizeObserver(() => viewer.resize())
      resizeObserver.observe(container)
    })

    return () => {
      disposed = true
      resizeObserver?.disconnect()
      viewerRef.current?.remove()
      viewerRef.current = null
    }
  }, [])

  useEffect(() => {
    viewerRef.current?.moveTo(imageId).catch(() => setError('imageNotLoaded'))
  }, [imageId])

  return (
    <div className="street-view">
      <div ref={containerRef} className="viewer" />
      {error === 'missingToken' && (
        <div className="street-view-error">
          Falta configurar <code>NEXT_PUBLIC_MAPILLARY_ACCESS_TOKEN</code> para ver las imágenes.
        </div>
      )}
      {error === 'imageNotLoaded' && (
        <div className="street-view-error">No pudimos cargar esta imagen. Probá marcar tu respuesta igual.</div>
      )}
    </div>
  )
}
