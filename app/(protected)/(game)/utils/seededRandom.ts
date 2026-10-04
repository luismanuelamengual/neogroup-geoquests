import { RandomFn } from '@/app/(protected)/(game)/utils/geo'

/**
 * Deterministic random source (mulberry32): the same seed always gives the
 * same sequence, on the server and in every browser. Used for what must look
 * the same everywhere without being stored (e.g. the look of a witness).
 */
export function seededRandom(seed: number): RandomFn {
  let state = seed >>> 0

  return () => {
    state = (state + 0x6d2b79f5) >>> 0

    let t = state

    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Random element of `items` chosen with their weights (`[item, weight]`). */
export function pickWeighted<T>(items: [T, number][], random: RandomFn): T {
  const total = items.reduce((sum, [, weight]) => sum + weight, 0)
  let target = random() * total

  for (const [item, weight] of items) {
    target -= weight

    if (target < 0) {
      return item
    }
  }

  return items[items.length - 1][0]
}

/** True with probability `p`. */
export function chance(p: number, random: RandomFn): boolean {
  return random() < p
}
