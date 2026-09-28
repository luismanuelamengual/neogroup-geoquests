import { LatLng } from '@/app/(protected)/(game)/models/LatLng'
import { Panorama, PanoramaFinder } from '@/app/(protected)/(game)/services/streetView'

export type FakeBehaviour = 'found' | 'empty' | 'error'

/**
 * Street View finder for tests: "finds" a panorama exactly at the searched
 * point, finds nothing, or fails — always, or decided per searched point —
 * and records the calls.
 */
export class FakePanoramaFinder implements PanoramaFinder {
  calls: { point: LatLng; radius: number }[] = []
  private counter = 0

  constructor(private readonly behaviour: FakeBehaviour | ((point: LatLng) => FakeBehaviour) = 'found') {}

  async findNear(point: LatLng, radius: number): Promise<Panorama | null> {
    this.calls.push({ point, radius })

    const behaviour = typeof this.behaviour === 'function' ? this.behaviour(point) : this.behaviour

    if (behaviour === 'error') {
      throw new Error('street view down')
    }

    if (behaviour === 'empty') {
      return null
    }

    this.counter++

    return { id: `pano-${this.counter}`, latitude: point.latitude, longitude: point.longitude }
  }
}
