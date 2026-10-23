import { DB } from '@neogroup/neorm'
import { GameOptions } from '@/app/(protected)/(game)/models/GameOptions'
import { GamePlayer } from '@/app/(protected)/(game)/models/GamePlayer'
import { GamePlayerStatus } from '@/app/(protected)/(game)/models/GamePlayerStatus'
import { leaveGame } from '@/app/(protected)/(game)/services/games'
import { ApiException } from '@/app/models/ApiException'
import { User } from '@/app/models/User'

/**
 * Deletes a player's account and everything tied to it (required by Google
 * Play for apps that let people create an account). The player first leaves
 * the games it is still playing, the same way as with the "leave" button, so
 * the other players are not left waiting; then its user, tokens, game
 * history, progress and daily challenge attempts are removed. The rows are deleted explicitly instead of relying on
 * the foreign keys' ON DELETE, which SQLite (tests) does not enforce.
 */
export async function deleteAccount(userId: number, options: GameOptions = {}): Promise<void> {
  const user = await User.find(userId)

  if (!user) {
    throw new ApiException('errors.notAuthenticated', 401)
  }

  const playing = await GamePlayer.where('userId', userId)
    .where('status', GamePlayerStatus.ACTIVE)
    .select('gameId')
    .get()

  for (const { gameId } of playing) {
    try {
      await leaveGame(userId, { gameId }, options)
    } catch {
      // Already finished (or deleted meanwhile): nothing to leave.
    }
  }

  await DB.transaction(async () => {
    await DB.table('game_players').where('userId', userId).delete()
    await DB.table('player_progress').where('userId', userId).delete()
    await DB.table('user_achievements').where('userId', userId).delete()
    await DB.table('daily_results').where('userId', userId).delete()
    await DB.table('games').where('hostUserId', userId).update({ hostUserId: null })
    await DB.table('email_verification_tokens').where('userId', userId).delete()
    await DB.table('password_reset_tokens').where('userId', userId).delete()
    await DB.table('users').where('id', userId).delete()
  })
}
