import { TierName } from '@/app/(protected)/(game)/utils/achievements'

/** A medal of the catalog as the player sees it (see utils/achievements.ts): won or still to win. */
export interface MedalView {
  /** Key of the medal (e.g. `steady.2`). */
  key: string
  /** Achievement it belongs to (its texts: `achievements.items.<id>`). */
  id: string
  icon: string
  /** Tier (1-based) of an achievement with tiers, and its name; null otherwise. */
  tier: number | null
  tierName: TierName | null
  /** What the medal needs (its description's `{count}`, e.g. 100 games or 6 hours to spare). */
  target: number | null
  /** Achievements gathered over time: how far the player is (up to `target`). */
  value: number | null
  /** When it was won (ISO date); null: not yet. */
  unlockedAt: string | null
}
