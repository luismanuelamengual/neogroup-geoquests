import { DB } from '@neogroup/neorm'
import { DetectiveGameData } from '@/app/(protected)/(game)/models/DetectiveGameData'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'
import { GamePlayer } from '@/app/(protected)/(game)/models/GamePlayer'
import { GamePlayerResult } from '@/app/(protected)/(game)/models/GamePlayerResult'
import { PlayerProgress } from '@/app/(protected)/(game)/models/PlayerProgress'
import { PlayerStats } from '@/app/(protected)/(game)/models/PlayerStats'
import { getDayKey } from '@/app/(protected)/(game)/utils/days'
import { EMPTY_STREAK, extendStreak, getCurrentStreak, StreakState } from '@/app/(protected)/(game)/utils/streak'
import { getGameXp, getLevelProgress } from '@/app/(protected)/(game)/utils/xp'
import { User } from '@/app/models/User'

/**
 * The progress of the players (`player_progress`): stats, streak and XP,
 * updated when each game ends and never deleted (the games are, after 7 days).
 */

/** XP a finished game gave a player. */
export interface GameXpResult {
  userId: number
  xpEarned: number
  /** Total XP of the player after this game. */
  xpTotal: number
}

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
 * Adds a finished game to the progress of each of its players (stats, streak
 * and XP, also kept in its `game_players` row for the summary) and stores the
 * score of a daily challenge attempt. Called once per game, in the same
 * transaction that marks it as finished (see services/gamePersistence.ts), so
 * a game is never counted twice. Returns the XP each player got.
 */
export async function recordFinishedGame(
  game: Game,
  players: GamePlayer[],
  results: GamePlayerResult[],
  now: Date
): Promise<GameXpResult[]> {
  const scored = game.mode !== GameMode.DETECTIVE
  const xpResults: GameXpResult[] = []

  for (const result of results) {
    const timeZone = players.find((player) => player.userId === result.userId)?.user?.timeZone ?? null
    const progress = await PlayerProgress.where('userId', result.userId).first()
    const today = getDayKey(now, timeZone)
    const streak = extendStreak(toStreakState(progress), today)
    const xpEarned = getGameXp({
      mode: game.mode,
      score: result.score,
      position: result.position,
      outcome: result.outcome,
      playersCount: results.length,
      isDailyChallenge: game.dailyChallengeId != null,
      isFirstGameOfDay: progress?.lastPlayedDay !== today,
      difficulty: game.mode === GameMode.DETECTIVE ? (game.data as DetectiveGameData).settings?.difficulty : null
    })
    const xpTotal = (progress?.xp ?? 0) + xpEarned
    const values = {
      gamesPlayed: (progress?.gamesPlayed ?? 0) + 1,
      scoredGames: (progress?.scoredGames ?? 0) + (scored ? 1 : 0),
      totalScore: (progress?.totalScore ?? 0) + (scored ? result.score : 0),
      bestScore: Math.max(progress?.bestScore ?? 0, scored ? result.score : 0),
      casesSolved:
        (progress?.casesSolved ?? 0) + (game.mode === GameMode.DETECTIVE && result.outcome === GameOutcome.WON ? 1 : 0),
      ...streak,
      xp: xpTotal,
      updatedAt: now
    }

    if (progress) {
      await DB.table('player_progress').where('userId', result.userId).update(values)
    } else {
      await DB.table('player_progress').insert({ userId: result.userId, ...values })
    }

    await DB.table('game_players').where('gameId', game.id).where('userId', result.userId).update({ xpEarned, xpTotal })
    xpResults.push({ userId: result.userId, xpEarned, xpTotal })

    if (game.dailyChallengeId != null) {
      await DB.table('daily_results')
        .where('challengeId', game.dailyChallengeId)
        .where('userId', result.userId)
        .update({ score: result.score, finishedAt: now })
    }
  }

  return xpResults
}

/** Stats of the player over all its finished games, its streak as of `now` (in its time zone) and its level. */
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
    playedToday: streak.lastPlayedDay === today,
    xp: progress?.xp ?? 0,
    ...getLevelProgress(progress?.xp ?? 0)
  }
}
