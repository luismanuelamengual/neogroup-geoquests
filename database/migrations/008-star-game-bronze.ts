import { DB } from '@neogroup/neorm'
import { GamePlayer } from '@/app/(protected)/(game)/models/GamePlayer'
import { PlayerProgress } from '@/app/(protected)/(game)/models/PlayerProgress'
import { UserAchievement } from '@/app/(protected)/(game)/models/UserAchievement'
import { XP_PER_ACHIEVEMENT } from '@/app/(protected)/(game)/utils/achievements'

/** Old medal key → new one: the silver and gold tiers move up one place. */
const RENAMED_KEYS: Record<string, string> = { 'starGame.1': 'starGame.2', 'starGame.2': 'starGame.3' }

/**
 * "Star game" gets a bronze tier (1 star), before silver and gold. Medals are
 * stored by tier (`starGame.1` was silver), so:
 *
 *   - user_achievements           → starGame.2 becomes starGame.3, and starGame.1 becomes starGame.2
 *   - game_players.achievements   → the same keys, renamed in the summary of each game
 *   - the players with silver also get bronze (earned in the same game) and its XP
 */
export default {
  name: '008-star-game-bronze',

  async up(): Promise<void> {
    await DB.transaction(async () => {
      // Gold first, so that the old silver does not collide with it.
      await DB.table('user_achievements').where('key', 'starGame.2').update({ key: 'starGame.3' })
      await DB.table('user_achievements').where('key', 'starGame.1').update({ key: 'starGame.2' })

      for (const silver of await UserAchievement.where('key', 'starGame.2').get()) {
        await DB.table('user_achievements').insert({
          userId: silver.userId,
          key: 'starGame.1',
          unlockedAt: silver.unlockedAt,
          gameId: silver.gameId
        })

        const progress = await PlayerProgress.where('userId', silver.userId).first()

        if (progress) {
          await DB.table('player_progress')
            .where('userId', silver.userId)
            .update({ xp: progress.xp + XP_PER_ACHIEVEMENT })
        }
      }

      for (const player of await GamePlayer.whereNotNull('achievements').get()) {
        const achievements = player.achievements ?? []

        if (achievements.some((key) => key in RENAMED_KEYS)) {
          await DB.table('game_players')
            .where('gameId', player.gameId)
            .where('userId', player.userId)
            .update({ achievements: JSON.stringify(achievements.map((key) => RENAMED_KEYS[key] ?? key)) })
        }
      }
    })
  }
}
