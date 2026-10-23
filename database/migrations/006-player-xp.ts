import { DB, Schema } from '@neogroup/neorm'
import { PlayerProgress } from '@/app/(protected)/(game)/models/PlayerProgress'
import { SCORE_PER_XP, XP_CASE_SOLVED, XP_FOR_FINISHING } from '@/app/(protected)/(game)/utils/xp'

/**
 * Experience (XP) and levels of the players (see utils/xp.ts):
 *
 *   - player_progress.xp       → total XP of the player (its level is computed from it)
 *   - game_players.xpEarned    → XP the game gave the player (null: finished before XP existed)
 *   - game_players.xpTotal     → total XP of the player right after that game (the summary animates
 *                                the bar from xpTotal − xpEarned)
 *
 * The players that already played get the XP of their counters, so nobody
 * starts again from level 1.
 */
export default {
  name: '006-player-xp',

  async up(): Promise<void> {
    await DB.transaction(async () => {
      if (!(await Schema.hasColumn('player_progress', 'xp'))) {
        await Schema.table('player_progress', (table) => {
          table.bigInteger('xp').default(0)
        })
        await backfillXp()
      }

      if (!(await Schema.hasColumn('game_players', 'xpEarned'))) {
        await Schema.table('game_players', (table) => {
          table.integer('xpEarned').nullable()
          table.bigInteger('xpTotal').nullable()
        })
      }
    })
  }
}

/**
 * XP of the games finished before this migration, from the counters of
 * player_progress (the games themselves are only kept 7 days). Solved cases
 * count as medium ones. Read through the entities: on PostgreSQL raw rows have
 * lower case keys (see services/maps.ts).
 */
export async function backfillXp(): Promise<void> {
  for (const progress of await PlayerProgress.get()) {
    const xp =
      XP_FOR_FINISHING * progress.gamesPlayed +
      Math.floor(progress.totalScore / SCORE_PER_XP) +
      XP_CASE_SOLVED.medium * progress.casesSolved

    await DB.table('player_progress').where('userId', progress.userId).update({ xp })
  }
}
