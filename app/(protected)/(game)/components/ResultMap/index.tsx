'use client'

import 'maplibre-gl/dist/maplibre-gl.css'
import '@/app/(protected)/(game)/components/GuessMap/index.scss'
import type { GeoJSONSource, Marker, PaddingOptions } from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { createMapPinElement } from '@/app/(protected)/(game)/components/MapPin'
import { useMapLibre } from '@/app/(protected)/(game)/hooks/useMapLibre'
import { LatLng } from '@/app/(protected)/(game)/models/LatLng'

/** A guess pin of a result: where it is, and optionally its own label and color (e.g. a player's). */
export interface ResultGuess {
  position: LatLng
  label?: string
  color?: string
}

/** A real location and the guesses made for it (one in single player games, one per player in multiplayer). */
export interface ResultPair {
  location: LatLng
  guesses: ResultGuess[]
  /** Text inside the pins (e.g. the round number); a guess may have its own. */
  label?: string
}

const SOURCE_ID = 'result-lines'
const DEFAULT_PADDING: PaddingOptions = { top: 70, bottom: 50, left: 50, right: 50 }

/**
 * Map revealing the answers: the real location (gold pin), the guesses
 * (magenta pins, or each player's color) and a dashed line from each guess to
 * its location, framed to show every pin.
 */
interface ResultMapProps {
  pairs: ResultPair[]
  className?: string
  /** Space (px) kept free around the pins when framing them, e.g. under an overlay panel. */
  padding?: PaddingOptions
}

export default function ResultMap({ pairs, className, padding = DEFAULT_PADDING }: ResultMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const map = useMapLibre(containerRef, { attributionControl: { compact: true } })

  useEffect(() => {
    if (!map) {
      return
    }

    let markers: Marker[] = []
    let cancelled = false

    import('maplibre-gl').then(({ default: maplibregl }) => {
      if (cancelled) {
        return
      }

      const lines = {
        type: 'FeatureCollection' as const,
        features: pairs.flatMap((pair) =>
          pair.guesses.map((guess) => ({
            type: 'Feature' as const,
            properties: {},
            geometry: {
              type: 'LineString' as const,
              coordinates: [
                [guess.position.longitude, guess.position.latitude],
                [pair.location.longitude, pair.location.latitude]
              ]
            }
          }))
        )
      }
      const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined

      if (source) {
        source.setData(lines)
      } else {
        map.addSource(SOURCE_ID, { type: 'geojson', data: lines })
        map.addLayer({
          id: `${SOURCE_ID}-casing`,
          type: 'line',
          source: SOURCE_ID,
          paint: { 'line-color': '#0b1026', 'line-width': 6, 'line-opacity': 0.5 }
        })
        map.addLayer({
          id: SOURCE_ID,
          type: 'line',
          source: SOURCE_ID,
          paint: { 'line-color': '#ffffff', 'line-width': 3, 'line-dasharray': [2, 1.5] }
        })
      }

      const bounds = new maplibregl.LngLatBounds()

      for (const pair of pairs) {
        markers.push(
          new maplibregl.Marker({ element: createMapPinElement('target', pair.label), anchor: 'bottom' })
            .setLngLat([pair.location.longitude, pair.location.latitude])
            .addTo(map)
        )
        bounds.extend([pair.location.longitude, pair.location.latitude])

        for (const guess of pair.guesses) {
          const element = createMapPinElement('guess', guess.label ?? pair.label, guess.color)

          markers.push(
            new maplibregl.Marker({ element, anchor: 'bottom' })
              .setLngLat([guess.position.longitude, guess.position.latitude])
              .addTo(map)
          )
          bounds.extend([guess.position.longitude, guess.position.latitude])
        }
      }

      if (!bounds.isEmpty()) {
        map.fitBounds(bounds, { padding, maxZoom: 15, duration: 1200 })
      }
    })

    return () => {
      cancelled = true
      markers.forEach((marker) => marker.remove())
      markers = []
    }
  }, [map, pairs, padding])

  return <div ref={containerRef} className={`result-map map-canvas ${className ?? ''}`} />
}
