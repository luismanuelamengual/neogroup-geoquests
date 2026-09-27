import { LatLng } from '@/app/(protected)/(game)/models/LatLng'
import { StreetImage, StreetImageryProvider } from '@/app/(protected)/(game)/services/imagery/StreetImageryProvider'

export type FakeBehaviour = 'found' | 'empty' | 'error'

/**
 * Imagery provider for tests: "finds" one panorama exactly at the searched
 * point, finds nothing, or fails — always, or decided per searched point —
 * and records the calls.
 */
export class FakeImageryProvider implements StreetImageryProvider {
  readonly name = 'fake'
  calls: { point: LatLng; radius: number }[] = []
  private counter = 0

  constructor(private readonly behaviour: FakeBehaviour | ((point: LatLng) => FakeBehaviour) = 'found') {}

  async findImagesNear(point: LatLng, radius: number): Promise<StreetImage[]> {
    this.calls.push({ point, radius })

    const behaviour = typeof this.behaviour === 'function' ? this.behaviour(point) : this.behaviour

    if (behaviour === 'error') {
      throw new Error('provider down')
    }

    if (behaviour === 'empty') {
      return []
    }

    this.counter++

    return [{ id: `img-${this.counter}`, latitude: point.latitude, longitude: point.longitude, isPano: true }]
  }
}
