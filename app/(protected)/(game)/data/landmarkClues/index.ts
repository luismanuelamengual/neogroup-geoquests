import { AFRICA_MIDDLE_EAST_CLUES } from '@/app/(protected)/(game)/data/landmarkClues/africaMiddleEast'
import { AMERICAS_CLUES } from '@/app/(protected)/(game)/data/landmarkClues/americas'
import { ASIA_PACIFIC_CLUES } from '@/app/(protected)/(game)/data/landmarkClues/asiaPacific'
import { EUROPE_CLUES } from '@/app/(protected)/(game)/data/landmarkClues/europe'
import { LandmarkClues } from '@/app/(protected)/(game)/models/LandmarkClues'

/**
 * Clues of the landmarks of "Lugares icónicos" (detective mode), by place name
 * as seeded (database/migrations/002-seed-maps.ts), one file per region. Five
 * per language, in this order (see models/LandmarkClues.ts):
 *   0, 1 → geography · 2, 3 → culture · 4 → specific
 * Written as what the suspect said or did, without naming the place, its city
 * or its country. Only the landmarks listed here can be destinations of a case.
 */
export const LANDMARK_CLUES: Record<string, LandmarkClues> = {
  ...EUROPE_CLUES,
  ...AMERICAS_CLUES,
  ...ASIA_PACIFIC_CLUES,
  ...AFRICA_MIDDLE_EAST_CLUES
}
