import { LatLng } from '@/app/(protected)/(game)/models/LatLng'
import { StreetImage, StreetImageryProvider } from '@/app/(protected)/(game)/services/imagery/StreetImageryProvider'

/**
 * Imagery provider for tests: "finds" one panorama exactly at the searched
 * point (or nothing / an error when configured so), and records the calls.
 */
export class FakeImageryProvider implements StreetImageryProvider {
  readonly name = 'fake'
  calls: LatLng[] = []
  private counter = 0

  constructor(private readonly behaviour: 'found' | 'empty' | 'error' = 'found') {}

  async findImagesNear(point: LatLng): Promise<StreetImage[]> {
    this.calls.push(point)

    if (this.behaviour === 'error') {
      throw new Error('provider down')
    }

    if (this.behaviour === 'empty') {
      return []
    }

    this.counter++

    return [{ id: `img-${this.counter}`, latitude: point.latitude, longitude: point.longitude, isPano: true }]
  }
}
