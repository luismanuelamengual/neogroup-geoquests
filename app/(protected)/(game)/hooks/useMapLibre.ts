'use client'

import type { Map as MapLibreMap, MapOptions } from 'maplibre-gl'
import { RefObject, useEffect, useState } from 'react'
import { MAP_STYLE_URL, WORLD_VIEW } from '@/app/(protected)/(game)/utils/maps'

type MapLibreOptions = Omit<MapOptions, 'container' | 'style'>

/**
 * Creates a MapLibre map inside `containerRef` once it is mounted and returns
 * it after its style has loaded (null until then). The library is imported
 * dynamically: it touches `window` and is only needed on the play screens.
 * The map follows the size of its container (it is resized when the guess
 * panel expands, the phone rotates, etc.) and is disposed on unmount.
 */
export function useMapLibre(containerRef: RefObject<HTMLDivElement | null>, options: MapLibreOptions = {}) {
  const [map, setMap] = useState<MapLibreMap | null>(null)

  useEffect(() => {
    const container = containerRef.current

    if (!container) {
      return
    }

    let disposed = false
    let instance: MapLibreMap | null = null
    let resizeObserver: ResizeObserver | null = null

    import('maplibre-gl').then(({ default: maplibregl }) => {
      if (disposed) {
        return
      }

      instance = new maplibregl.Map({
        container,
        style: MAP_STYLE_URL,
        center: WORLD_VIEW.center,
        zoom: WORLD_VIEW.zoom,
        attributionControl: { compact: true },
        dragRotate: false,
        pitchWithRotate: false,
        renderWorldCopies: true,
        ...options
      })
      instance.touchZoomRotate.disableRotation()
      instance.on('load', () => {
        if (!disposed) {
          setMap(instance)
        }
      })
      resizeObserver = new ResizeObserver(() => instance?.resize())
      resizeObserver.observe(container)
    })

    return () => {
      disposed = true
      resizeObserver?.disconnect()
      instance?.remove()
      setMap(null)
    }
    // The map is created once per mount; options are initial values only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef])

  return map
}
