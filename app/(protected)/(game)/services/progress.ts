import { DB } from '@neogroup/neorm'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'
import { GamePlayer } from '@/app/(protected)/(game)/models/GamePlayer'
import { GamePlayerResult } from '@/app/(protected)/(game)/models/GamePlayerResult'
import { PlayerProgress } from '@/app/(protected)/(game)/models/PlayerProgress'
import { PlayerStats } from '@/app/(protected)/(game)/models/PlayerStats'
import { getDayKey } from '@/app/(protected)/(game)/utils/days'
import { EMPTY_STREAK, extendStreak, getCurrentStreak, StreakState } from '@/app/(protected)/(game)/utils/streak'
import { User } from '@/app/models/User'

/**
 * The progress of the players (`player_progress`): stats and streak, updated
 * when each game ends and never deleted (the games are, after 7 days).
 */

function toStreakState(progress: PlayerProgress | null): StreakState {
  return progress
    ? {
        currentStreak: progress.currentStreak,
        bestStreak: progress.bestStreak,
        streakFreezes: progress.streakFreezes,
        lastPlayedDay: progress.lastPlayedDay
      }
    : EMPTY_STREAK
}

/**
 * Adds a finished game to the progress of each of its players (and stores the
 * score of a daily challenge attempt). Called once per game, in the same
 * transaction that marks it as finished (see services/gamePersistence.ts), so
 * a game is never counted twice.
 */
export async function recordFinishedGame(
  game: Game,
  players: GamePlayer[],
  results: GamePlayerResult[],
  now: Date
): Promise<void> {
  const scored = game.mode !== GameMode.DETECTIVE

  for (const result of results) {
    const timeZone = players.find((player) => player.userId === result.userId)?.user?.timeZone ?? null
    const progress = await PlayerProgress.where('userId', result.userId).first()
    const streak = extendStreak(toStreakState(progress), getDayKey(now, timeZone))
    const values = {
      gamesPlayed: (progress?.gamesPlayed ?? 0) + 1,
      scoredGames: (progress?.scoredGames ?? 0) + (scored ? 1 : 0),
      totalScore: (progress?.totalScore ?? 0) + (scored ? result.score : 0),
      bestScore: Math.max(progress?.bestScore ?? 0, scored ? result.score : 0),
      casesSolved:
        (progress?.casesSolved ?? 0) + (game.mode === GameMode.DETECTIVE && result.outcome === GameOutcome.WON ? 1 : 0),
      ...streak,
      updatedAt: now
    }

    if (progress) {
      await DB.table('player_progress').where('userId', result.userId).update(values)
    } else {
      await DB.table('player_progress').insert({ userId: result.userId, ...values })
    }

    if (game.dailyChallengeId != null) {
      await DB.table('daily_results')
        .where('challengeId', game.dailyChallengeId)
        .where('userId', result.userId)
        .update({ score: result.score, finishedAt: now })
    }
  }
}

/** Stats of the player over all its finished games, and its streak as of `now` (in its time zone). */
export async function getPlayerStats(userId: number, now: Date = new Date()): Promise<PlayerStats> {
  const [progress, user] = await Promise.all([PlayerProgress.where('userId', userId).first(), User.find(userId)])
  const streak = toStreakState(progress)
  const today = getDayKey(now, user?.timeZone)
  const scoredGames = progress?.scoredGames ?? 0

  return {
    gamesPlayed: progress?.gamesPlayed ?? 0,
    casesSolved: progress?.casesSolved ?? 0,
    bestScore: progress?.bestScore ?? 0,
    averageScore: scoredGames > 0 ? Math.round((progress?.totalScore ?? 0) / scoredGames) : 0,
    currentStreak: getCurrentStreak(streak, today),
    bestStreak: streak.bestStreak,
    streakFreezes: streak.streakFreezes,
    playedToday: streak.lastPlayedDay === today
  }
}
