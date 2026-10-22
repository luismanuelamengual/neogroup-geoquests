import { DB, Schema } from '@neogroup/neorm'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'
import { GamePlayer } from '@/app/(protected)/(game)/models/GamePlayer'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { PlayerProgress } from '@/app/(protected)/(game)/models/PlayerProgress'
import { getDayKey } from '@/app/(protected)/(game)/utils/days'
import { replayStreak } from '@/app/(protected)/(game)/utils/streak'

/**
 * Retention: what the player builds up over time and the daily challenge.
 *
 *   - users.timeZone   → IANA time zone of the player (sent by the browser): the "day" of its streak
 *   - player_progress  → one row per player with counters that are never deleted (stats and streak):
 *                        games and game_players only keep the last 7 days (see gameCleanup.ts)
 *   - daily_challenges → one row per day (UTC): the same rounds for everybody
 *   - daily_results    → one attempt per player and challenge, with its score once finished (the
 *                        ranking of the day); kept 7 days, like the games (see gameCleanup.ts)
 *   - games.dailyChallengeId → the challenge a classic game belongs to (null: a normal game)
 *
 * The progress of the games already finished is filled in from game_players.
 */
export default {
  name: '003-player-progress-and-daily-challenges',

  async up(): Promise<void> {
    await DB.transaction(async () => {
      if (!(await Schema.hasColumn('users', 'timeZone'))) {
        await Schema.table('users', (table) => {
          // IANA time zone (e.g. 'America/Argentina/Buenos_Aires'); null: UTC.
          table.string('timeZone', 64).nullable()
        })
      }

      if (!(await Schema.hasColumn('games', 'dailyChallengeId'))) {
        await Schema.table('games', (table) => {
          table.integer('dailyChallengeId').nullable()
        })
      }

      await Schema.createIfNotExists('player_progress', (table) => {
        table.integer('userId')
        // Finished games, of any mode.
        table.integer('gamesPlayed').default(0)
        // Finished games whose score counts for the best and the average (every mode but detective).
        table.integer('scoredGames').default(0)
        table.bigInteger('totalScore').default(0)
        table.integer('bestScore').default(0)
        table.integer('casesSolved').default(0)
        // Days in a row with a finished game (day of the player's time zone).
        table.integer('currentStreak').default(0)
        table.integer('bestStreak').default(0)
        // Streak freezes: one is earned every 7 days of streak, each one saves one missed day.
        table.smallInteger('streakFreezes').default(0)
        // Last day with a finished game (YYYY-MM-DD, player's time zone).
        table.string('lastPlayedDay', 10).nullable()
        table.timestamp('updatedAt').useCurrent()

        table.primary(['userId'])
        table.foreign('userId').references('id').on('users').cascadeOnDelete()
      })

      await Schema.createIfNotExists('daily_challenges', (table) => {
        table.increments('id')
        // Day of the challenge (YYYY-MM-DD, UTC).
        table.string('day', 10).unique()
        table.integer('mapId')
        // The planned rounds (GameRound[]): the same for every player.
        table.jsonb('rounds')
        table.timestamp('createdAt').useCurrent()
      })

      await Schema.createIfNotExists('daily_results', (table) => {
        table.integer('challengeId')
        table.integer('userId')
        // The game of the attempt (it may have been deleted since, see gameCleanup.ts).
        table.integer('gameId').nullable()
        // Null until the game is finished.
        table.integer('score').nullable()
        table.timestamp('startedAt').useCurrent()
        table.timestamp('finishedAt').nullable()

        table.primary(['challengeId', 'userId'])
        table.index(['challengeId', 'score'], 'idx_daily_results_ranking')
        table.foreign('challengeId').references('id').on('daily_challenges').cascadeOnDelete()
        table.foreign('userId').references('id').on('users').cascadeOnDelete()
      })

      await backfillProgress()
    })
  }
}

/**
 * Progress of the games finished before this migration (their days in UTC: the
 * time zones are not known yet). Read through the entities: on PostgreSQL raw
 * rows have lower case keys (see services/maps.ts).
 */
async function backfillProgress(): Promise<void> {
  const games = await Game.where('status', GameStatus.FINISHED).select('id', 'mode', 'finishedAt').get()

  if (games.length === 0) {
    return
  }

  const byId = new Map(games.map((game) => [game.id, game]))
  const players = await GamePlayer.whereIn(
    'gameId',
    games.map((game) => game.id)
  ).get()
  const byUser = new Map<number, GamePlayer[]>()

  for (const player of players) {
    byUser.set(player.userId, [...(byUser.get(player.userId) ?? []), player])
  }

  for (const [userId, rows] of byUser) {
    if (await PlayerProgress.where('userId', userId).first()) {
      continue
    }

    const modeOf = (row: GamePlayer) => byId.get(row.gameId)!.mode
    const scored = rows.filter((row) => modeOf(row) !== GameMode.DETECTIVE)
    const days = rows.flatMap((row) => {
      const { finishedAt } = byId.get(row.gameId)!

      return finishedAt ? [getDayKey(finishedAt)] : []
    })
    const streak = replayStreak(days)

    await DB.table('player_progress').insert({
      userId,
      gamesPlayed: rows.length,
      scoredGames: scored.length,
      totalScore: scored.reduce((total, row) => total + row.score, 0),
      bestScore: scored.reduce((best, row) => Math.max(best, row.score), 0),
      casesSolved: rows.filter((row) => modeOf(row) === GameMode.DETECTIVE && row.outcome === GameOutcome.WON).length,
      ...streak,
      updatedAt: new Date()
    })
  }
}
