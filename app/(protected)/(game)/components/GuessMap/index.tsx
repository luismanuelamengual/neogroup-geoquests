'use client'

import 'maplibre-gl/dist/maplibre-gl.css'
import './index.scss'
import type { Marker, NavigationControl } from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { createMapPinElement } from '@/app/(protected)/(game)/components/MapPin'
import { useMapLibre } from '@/app/(protected)/(game)/hooks/useMapLibre'
import { LatLng } from '@/app/(protected)/(game)/models/LatLng'

interface GuessMapProps {
  guess: LatLng | null
  onGuessChange: (guess: LatLng) => void
  disabled?: boolean
}

/** World map where the player drops its pin (click / tap anywhere). */
export default function GuessMap({ guess, onGuessChange, disabled }: GuessMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const markerRef = useRef<Marker | null>(null)
  const onGuessChangeRef = useRef(onGuessChange)
  const disabledRef = useRef(disabled)
  const map = useMapLibre(containerRef)

  useEffect(() => {
    onGuessChangeRef.current = onGuessChange
    disabledRef.current = disabled
  }, [onGuessChange, disabled])

  useEffect(() => {
    if (!map) {
      return
    }

    const handleClick = (event: { lngLat: { lat: number; lng: number } }) => {
      if (!disabledRef.current) {
        onGuessChangeRef.current({ latitude: event.lngLat.lat, longitude: event.lngLat.lng })
      }
    }

    let zoomControl: NavigationControl | null = null
    let disposed = false

    map.getCanvas().style.cursor = 'crosshair'
    map.on('click', handleClick)

    import('maplibre-gl').then(({ default: maplibregl }) => {
      if (disposed) {
        return
      }

      zoomControl = new maplibregl.NavigationControl({ showCompass: false, showZoom: true })
      map.addControl(zoomControl, 'top-right')
    })

    return () => {
      disposed = true
      map.off('click', handleClick)

      // On unmount the map is usually already removed (useMapLibre disposes it
      // first), and map.remove() already detaches its controls.
      if (zoomControl && map.hasControl(zoomControl)) {
        map.removeControl(zoomControl)
      }
    }
  }, [map])

  useEffect(() => {
    if (!map) {
      return
    }

    if (!guess) {
      markerRef.current?.remove()
      markerRef.current = null

      return
    }

    if (markerRef.current) {
      markerRef.current.setLngLat([guess.longitude, guess.latitude])

      return
    }

    import('maplibre-gl').then(({ default: maplibregl }) => {
      markerRef.current = new maplibregl.Marker({ element: createMapPinElement('guess'), anchor: 'bottom' })
        .setLngLat([guess.longitude, guess.latitude])
        .addTo(map)
    })
  }, [map, guess])

  return <div ref={containerRef} className="guess-map map-canvas" />
}
