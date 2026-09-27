import { RandomFn } from '@/app/(protected)/(game)/utils/geo'

/** Returns a shuffled copy of `items` (Fisher–Yates). */
export function shuffle<T>(items: T[], random: RandomFn = Math.random): T[] {
  const result = [...items]

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))

    ;[result[i], result[j]] = [result[j], result[i]]
  }

  return result
}

/** Random element of `items`, or undefined when empty. */
export function pickRandom<T>(items: T[], random: RandomFn = Math.random): T | undefined {
  return items.length > 0 ? items[Math.floor(random() * items.length)] : undefined
}
