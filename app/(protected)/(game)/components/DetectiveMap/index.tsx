'use client'

import 'maplibre-gl/dist/maplibre-gl.css'
import './index.scss'
import type { GeoJSONSource, Map as MapLibreMap, Marker, PaddingOptions } from 'maplibre-gl'
import { useEffect, useRef } from 'react'
import { createMapPinElement } from '@/app/(protected)/(game)/components/MapPin'
import { useMapLibre } from '@/app/(protected)/(game)/hooks/useMapLibre'
import { LatLng } from '@/app/(protected)/(game)/models/LatLng'
import { greatCircleArc, referenceLongitude, unwrapLongitude } from '@/app/(protected)/(game)/utils/geoArc'

/** A pin of the map. */
export interface DetectiveMapMarker {
  id: string
  position: LatLng
  label?: string
  /** "target": gold, "guess": magenta; `color` overrides it. */
  variant?: 'target' | 'guess'
  color?: string
  /** Highlighted (bigger, on top). */
  selected?: boolean
  onClick?: () => void
}

/** Kinds of lines: the suspect's route, a wasted trip, a trip of the detective. */
export type DetectiveLegKind = 'route' | 'wrong' | 'travel'

export interface DetectiveMapLeg {
  from: LatLng
  to: LatLng
  kind: DetectiveLegKind
}

/** A trip drawn little by little with a plane flying over it. */
export interface DetectiveMapFlight {
  /** Changes when a new flight must start (e.g. "stage-2-redirect"). */
  key: string
  from: LatLng
  to: LatLng
  kind: DetectiveLegKind
  durationMs: number
  onDone?: () => void
}

interface DetectiveMapProps {
  markers: DetectiveMapMarker[]
  legs?: DetectiveMapLeg[]
  flight?: DetectiveMapFlight | null
  className?: string
  padding?: PaddingOptions
  /** Frame only these points (default: every marker). */
  fitTo?: LatLng[]
}

const LEGS_SOURCE = 'detective-legs'
const FLIGHT_SOURCE = 'detective-flight'
const KINDS: { kind: DetectiveLegKind; color: string; dash?: number[]; width: number }[] = [
  { kind: 'route', color: '#ffc233', width: 4 },
  { kind: 'wrong', color: '#ff4d8d', dash: [1.5, 1.5], width: 3 },
  { kind: 'travel', color: '#ffffff', dash: [2, 1.5], width: 3 }
]
const DEFAULT_PADDING: PaddingOptions = { top: 60, bottom: 50, left: 50, right: 50 }

/** Every place of the map in the same copy of the world (around `reference`), so pins and lines never split between copies. */
function unwrap(point: LatLng, reference: number): LatLng {
  return { latitude: point.latitude, longitude: unwrapLongitude(point.longitude, reference) }
}

/** Material "flight" icon, pointing north: rotated to the heading of the flight. */
const PLANE_SVG =
  '<svg viewBox="0 0 24 24" width="34" height="34"><path fill="#fff" stroke="#1a1530" stroke-width="1.2" d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>'

function lineFeatures(lines: { coordinates: [number, number][]; kind: DetectiveLegKind }[]) {
  return {
    type: 'FeatureCollection' as const,
    features: lines.map(({ coordinates, kind }) => ({
      type: 'Feature' as const,
      properties: { kind },
      geometry: { type: 'LineString' as const, coordinates }
    }))
  }
}

/** Adds (once) a line source with one layer per kind of leg. */
function ensureLineLayers(map: MapLibreMap, sourceId: string) {
  if (map.getSource(sourceId)) {
    return map.getSource(sourceId) as GeoJSONSource
  }

  map.addSource(sourceId, { type: 'geojson', data: lineFeatures([]) })

  for (const { kind, color, dash, width } of KINDS) {
    map.addLayer({
      id: `${sourceId}-${kind}-casing`,
      type: 'line',
      source: sourceId,
      filter: ['==', ['get', 'kind'], kind],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': '#0b1026', 'line-width': width + 3, 'line-opacity': 0.45 }
    })
    map.addLayer({
      id: `${sourceId}-${kind}`,
      type: 'line',
      source: sourceId,
      filter: ['==', ['get', 'kind'], kind],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': color, 'line-width': width, ...(dash ? { 'line-dasharray': dash } : {}) }
    })
  }

  return map.getSource(sourceId) as GeoJSONSource
}

/**
 * Map of the detective mode: pins (the places of a stage, the route of the
 * suspect), the legs between them as flight arcs and, optionally, a flight
 * being animated — the line grows behind a plane until it arrives.
 */
export default function DetectiveMap({
  markers,
  legs = [],
  flight = null,
  className,
  padding = DEFAULT_PADDING,
  fitTo
}: DetectiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const map = useMapLibre(containerRef)
  const flightRef = useRef(flight)
  const allPoints = [
    ...markers.map((marker) => marker.position),
    ...legs.flatMap((leg) => [leg.from, leg.to]),
    ...(fitTo ?? [])
  ]
  const reference = referenceLongitude(allPoints)
  const referenceRef = useRef(reference)

  flightRef.current = flight
  referenceRef.current = reference

  // Pins, legs and framing.
  useEffect(() => {
    if (!map) {
      return
    }

    let created: Marker[] = []
    let cancelled = false

    import('maplibre-gl').then(({ default: maplibregl }) => {
      if (cancelled) {
        return
      }

      const ref = referenceRef.current

      ensureLineLayers(map, LEGS_SOURCE).setData(
        lineFeatures(
          legs.map((leg) => ({
            coordinates: greatCircleArc(unwrap(leg.from, ref), unwrap(leg.to, ref), 64, false),
            kind: leg.kind
          }))
        )
      )

      created = markers.map((marker) => {
        const element = createMapPinElement(marker.variant ?? 'target', marker.label, marker.color)

        element.classList.toggle('selected', !!marker.selected)

        if (marker.onClick) {
          element.classList.add('clickable')
          element.addEventListener('click', (event) => {
            event.stopPropagation()
            marker.onClick?.()
          })
        }

        const position = unwrap(marker.position, ref)

        return new maplibregl.Marker({ element, anchor: 'bottom' })
          .setLngLat([position.longitude, position.latitude])
          .addTo(map)
      })
    })

    return () => {
      cancelled = true
      created.forEach((marker) => marker.remove())
      created = []
    }
  }, [map, markers, legs])

  // Framing: only when the set of points changes (not when a pin is selected).
  const framingKey = [
    ...(fitTo ?? markers.map((marker) => marker.position)),
    ...legs.flatMap((leg) => [leg.from, leg.to])
  ]
    .map((point) => `${point.latitude.toFixed(3)},${point.longitude.toFixed(3)}`)
    .join('|')

  useEffect(() => {
    if (!map) {
      return
    }

    const pins = fitTo ?? markers.map((marker) => marker.position)

    if (pins.length === 0) {
      return
    }

    // The pins and the arcs between them (an arc bends out of the straight line).
    const ref = referenceRef.current
    const points: LatLng[] = [
      ...pins.map((pin) => unwrap(pin, ref)),
      ...legs.flatMap((leg) =>
        greatCircleArc(unwrap(leg.from, ref), unwrap(leg.to, ref), 16, false).map(([longitude, latitude]) => ({
          latitude,
          longitude
        }))
      )
    ]

    import('maplibre-gl').then(({ default: maplibregl }) => {
      const bounds = new maplibregl.LngLatBounds()

      for (const point of points) {
        bounds.extend([point.longitude, point.latitude])
      }

      map.fitBounds(bounds, { padding, maxZoom: 5, duration: 1000 })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, framingKey])

  // Animated flight.
  const flightKey = flight?.key ?? null

  useEffect(() => {
    const current = flightRef.current

    if (!map || !current) {
      return
    }

    let frame = 0
    let plane: Marker | null = null
    let cancelled = false
    const source = ensureLineLayers(map, FLIGHT_SOURCE)
    const arc = greatCircleArc(
      unwrap(current.from, referenceRef.current),
      unwrap(current.to, referenceRef.current),
      120,
      false
    )

    import('maplibre-gl').then(({ default: maplibregl }) => {
      if (cancelled) {
        return
      }

      const element = document.createElement('div')

      element.className = 'detective-plane'
      element.innerHTML = PLANE_SVG
      plane = new maplibregl.Marker({ element, rotationAlignment: 'map' }).setLngLat(arc[0]).addTo(map)

      const start = performance.now()

      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / current.durationMs)
        // Ease in and out: take off and land slowly.
        const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2
        const index = Math.max(1, Math.round(eased * (arc.length - 1)))
        const head = arc[index]
        const previous = arc[index - 1]
        const a = map.project(previous)
        const b = map.project(head)

        source.setData(lineFeatures([{ coordinates: arc.slice(0, index + 1), kind: current.kind }]))
        plane?.setLngLat(head)
        element.style.setProperty('--heading', `${(Math.atan2(b.x - a.x, a.y - b.y) * 180) / Math.PI}deg`)

        if (t < 1) {
          frame = requestAnimationFrame(tick)
        } else {
          current.onDone?.()
        }
      }

      frame = requestAnimationFrame(tick)
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(frame)
      plane?.remove()
      source.setData(lineFeatures([]))
    }
  }, [map, flightKey])

  return <div ref={containerRef} className={`detective-map map-canvas ${className ?? ''}`} />
}
