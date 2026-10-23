import { Map as GameMap } from '@/app/(protected)/(game)/models/Map'
import { MedalView } from '@/app/(protected)/(game)/models/MedalView'
import { PlayerProgress } from '@/app/(protected)/(game)/models/PlayerProgress'
import { UserAchievement } from '@/app/(protected)/(game)/models/UserAchievement'
import {
  AchievementProgress,
  ACHIEVEMENTS,
  getMedalKey,
  getTierName,
  getTiersCount,
  getTierTarget
} from '@/app/(protected)/(game)/utils/achievements'

/** Every medal of the catalog for the player ("Mi progreso"): the ones it won, and how far it is from the others. */
export async function getAchievements(userId: number): Promise<MedalView[]> {
  const [progress, owned, mapsCount] = await Promise.all([
    PlayerProgress.where('userId', userId).first(),
    UserAchievement.where('userId', userId).get(),
    GameMap.where('enabled', true).count()
  ])
  const unlockedAt = new Map(owned.map((medal) => [medal.key, medal.unlockedAt.toISOString()]))
  const state: AchievementProgress = {
    gamesPlayed: progress?.gamesPlayed ?? 0,
    bestStreak: progress?.bestStreak ?? 0,
    casesSolved: progress?.casesSolved ?? 0,
    mapsPlayed: progress?.mapsPlayed?.length ?? 0,
    mapsCount
  }

  return ACHIEVEMENTS.flatMap((achievement): MedalView[] =>
    Array.from({ length: getTiersCount(achievement) }, (_, index) => {
      const key = getMedalKey(achievement, index + 1)
      const tiered = getTiersCount(achievement) > 1
      const base = {
        key,
        id: achievement.id,
        icon: achievement.icon,
        tier: tiered ? index + 1 : null,
        tierName: tiered ? getTierName(achievement, index + 1) : null,
        unlockedAt: unlockedAt.get(key) ?? null
      }

      if (achievement.kind === 'game') {
        return { ...base, target: achievement.tiers?.[index]?.target ?? null, value: null }
      }

      const target = getTierTarget(achievement, index + 1, state)

      return { ...base, target, value: Math.min(achievement.value(state), target) }
    })
  )
}
