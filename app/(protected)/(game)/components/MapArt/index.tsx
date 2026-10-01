import './index.scss'
import { MapShape } from '@/app/(protected)/(game)/models/MapShape'
import { MAP_SHAPE_HEIGHT, MAP_SHAPE_WIDTH } from '@/app/(protected)/(game)/utils/mapShape'

/** Combinations of sky, adornment and horizon (see index.scss): consecutive maps never look alike. */
const SKIES = 6
const ADORNMENTS = 4
const HORIZONS = 3

interface MapArtProps {
  /** Id of the map: picks its look, so every map keeps the same one. */
  mapId: number
  /** Drawing of the area of the map; without it a horizon is drawn instead. */
  shape: MapShape | null
  /** Paths of the photos of the map: when it has any, a collage of them is drawn instead of the shape. */
  photos: string[]
}

/** Illustration of a map with no image: a sky with an adornment, and the silhouette (or the places) of the map over it. */
export default function MapArt({ mapId, shape, photos }: MapArtProps) {
  const variant = Math.abs(mapId)
  const dotRadius = shape?.kind === 'dots' ? (shape.dots.length > 150 ? 1.1 : shape.dots.length > 60 ? 1.6 : 2.4) : 0

  return (
    <div className={`map-art sky-${variant % SKIES} adornment-${variant % ADORNMENTS}`} aria-hidden="true">
      {photos.length > 0 ? (
        <div className={`collage photos-${photos.length}`}>
          {photos.map((photo) => (
            <div key={photo} className="photo">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo} alt="" loading="lazy" draggable={false} />
            </div>
          ))}
        </div>
      ) : (
        <div className="adornment" />
      )}
      {photos.length > 0 ? null : shape ? (
        <svg
          className="shape"
          viewBox={`0 0 ${MAP_SHAPE_WIDTH} ${MAP_SHAPE_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {shape.kind === 'outline' ? (
            <>
              <path className="outline shadow" d={shape.path} transform="translate(0 3)" />
              <path className="outline" d={shape.path} />
            </>
          ) : (
            <>
              <g className="graticule">
                {[25, 50, 75].map((y) => (
                  <line key={`y${y}`} x1="0" x2={MAP_SHAPE_WIDTH} y1={y} y2={y} />
                ))}
                {[40, 80, 120, 160].map((x) => (
                  <line key={`x${x}`} x1={x} x2={x} y1="0" y2={MAP_SHAPE_HEIGHT} />
                ))}
              </g>
              {shape.dots.map(([x, y], index) => (
                <circle key={index} className={index % 5 === 0 ? 'dot alt' : 'dot'} cx={x} cy={y} r={dotRadius} />
              ))}
            </>
          )}
        </svg>
      ) : (
        <div className={`horizon horizon-${variant % HORIZONS}`}>
          {Array.from({ length: 11 }, (_, index) => (
            <span key={index} className={`building b${index}`} />
          ))}
        </div>
      )}
    </div>
  )
}
