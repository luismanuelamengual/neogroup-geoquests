import { DB, Schema } from '@neogroup/neorm'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GamePlayer } from '@/app/(protected)/(game)/models/GamePlayer'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { Map as GameMap } from '@/app/(protected)/(game)/models/Map'
import { PlayerProgress } from '@/app/(protected)/(game)/models/PlayerProgress'
import { getEarnedMedals, XP_PER_ACHIEVEMENT } from '@/app/(protected)/(game)/utils/achievements'

/**
 * Achievements of the players (see utils/achievements.ts):
 *
 *   - user_achievements           → one row per medal won (kept forever, like player_progress)
 *   - player_progress.mapsPlayed  → slugs of the maps the player finished a game in ("globetrotter")
 *   - game_players.achievements   → medals won in that game, for its summary
 *
 * The players that already played get the medals their counters earn (games,
 * best streak, solved cases, maps of the games still kept) and their XP. The
 * medals of a single play can not be given: those games are gone.
 */
export default {
  name: '007-achievements',

  async up(): Promise<void> {
    await DB.transaction(async () => {
      await Schema.createIfNotExists('user_achievements', (table) => {
        table.integer('userId')
        table.string('key', 40)
        table.timestamp('unlockedAt').useCurrent()
        // The game it was won in (it may have been deleted since); null: won from older games.
        table.integer('gameId').nullable()

        table.primary(['userId', 'key'])
        table.foreign('userId').references('id').on('users').cascadeOnDelete()
      })

      if (!(await Schema.hasColumn('game_players', 'achievements'))) {
        await Schema.table('game_players', (table) => {
          table.jsonb('achievements').nullable()
        })
      }

      if (!(await Schema.hasColumn('player_progress', 'mapsPlayed'))) {
        await Schema.table('player_progress', (table) => {
          table.jsonb('mapsPlayed').nullable()
        })
        await backfillAchievements()
      }
    })
  }
}

/**
 * Maps and medals of the games finished before this migration. Read through
 * the entities: on PostgreSQL raw rows have lower case keys (see services/maps.ts).
 */
export async function backfillAchievements(): Promise<void> {
  const games = await Game.where('status', GameStatus.FINISHED).whereNotNull('mapId').select('id', 'mapId').get()
  const slugs = new Map((await GameMap.get()).map((map) => [map.id, map.slug]))
  const mapOfGame = new Map(games.map((game) => [game.id, slugs.get(game.mapId!)]))
  const players = games.length > 0 ? await GamePlayer.whereIn('gameId', [...mapOfGame.keys()]).get() : []
  const mapsCount = await GameMap.where('enabled', true).count()
  const now = new Date()

  for (const progress of await PlayerProgress.get()) {
    const mapsPlayed = [
      ...new Set(
        players
          .filter((player) => player.userId === progress.userId)
          .flatMap((player) => mapOfGame.get(player.gameId) ?? [])
      )
    ]
    const medals = getEarnedMedals(null, {
      gamesPlayed: progress.gamesPlayed,
      bestStreak: progress.bestStreak,
      casesSolved: progress.casesSolved,
      mapsPlayed: mapsPlayed.length,
      mapsCount
    })

    for (const key of medals) {
      await DB.table('user_achievements').insert({ userId: progress.userId, key, unlockedAt: now, gameId: null })
    }

    await DB.table('player_progress')
      .where('userId', progress.userId)
      .update({ mapsPlayed: JSON.stringify(mapsPlayed), xp: progress.xp + medals.length * XP_PER_ACHIEVEMENT })
  }
}
