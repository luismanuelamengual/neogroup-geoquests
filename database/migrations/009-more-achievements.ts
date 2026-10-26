import { DB, Schema } from '@neogroup/neorm'
import { Map as GameMap } from '@/app/(protected)/(game)/models/Map'
import { PlayerProgress } from '@/app/(protected)/(game)/models/PlayerProgress'
import { UserAchievement } from '@/app/(protected)/(game)/models/UserAchievement'
import { getEarnedMedals, XP_PER_ACHIEVEMENT } from '@/app/(protected)/(game)/utils/achievements'
import { getLevel } from '@/app/(protected)/(game)/utils/xp'

/**
 * More achievements (see utils/achievements.ts): levels 10 / 20 / 30, the gold
 * of "career detective" (100 cases), a gold "against the clock" (its silver
 * and gold became bronze and silver: same keys, only their names changed),
 * and others whose counters are kept in:
 *
 *   - player_progress.achievementStats → see models/AchievementStats.ts (they start from zero)
 *
 * The players that already played get the medals their counters earn (levels,
 * 100 cases) and their XP. The XP of those medals may reach another level,
 * and so its medal too.
 */
export default {
  name: '009-more-achievements',

  async up(): Promise<void> {
    await DB.transaction(async () => {
      if (!(await Schema.hasColumn('player_progress', 'achievementStats'))) {
        await Schema.table('player_progress', (table) => {
          table.jsonb('achievementStats').nullable()
        })
        await backfillMoreAchievements()
      }
    })
  }
}

/** Medals of the new achievements the counters of the players already earn. Read through the entities (see 007-achievements). */
export async function backfillMoreAchievements(): Promise<void> {
  const mapsCount = await GameMap.where('enabled', true).count()
  const now = new Date()

  for (const progress of await PlayerProgress.get()) {
    const owned = new Set(
      (await UserAchievement.where('userId', progress.userId).select('key').get()).map((medal) => medal.key)
    )
    const medalsAt = (xp: number) =>
      getEarnedMedals(null, {
        gamesPlayed: progress.gamesPlayed,
        bestStreak: progress.bestStreak,
        casesSolved: progress.casesSolved,
        mapsPlayed: progress.mapsPlayed?.length ?? 0,
        mapsCount,
        level: getLevel(xp),
        stats: progress.achievementStats ?? {}
      }).filter((key) => !owned.has(key))
    let medals = medalsAt(progress.xp)

    for (
      let next = medalsAt(progress.xp + medals.length * XP_PER_ACHIEVEMENT);
      next.length > medals.length;
      next = medalsAt(progress.xp + medals.length * XP_PER_ACHIEVEMENT)
    ) {
      medals = next
    }

    if (medals.length === 0) {
      continue
    }

    for (const key of medals) {
      await DB.table('user_achievements').insert({ userId: progress.userId, key, unlockedAt: now, gameId: null })
    }

    await DB.table('player_progress')
      .where('userId', progress.userId)
      .update({ xp: progress.xp + medals.length * XP_PER_ACHIEVEMENT })
  }
}
