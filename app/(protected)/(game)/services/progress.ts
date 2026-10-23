import { DB } from '@neogroup/neorm'
import { ClassicGameData } from '@/app/(protected)/(game)/models/ClassicGameData'
import { DetectiveGameData } from '@/app/(protected)/(game)/models/DetectiveGameData'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameOutcome } from '@/app/(protected)/(game)/models/GameOutcome'
import { GamePlayer } from '@/app/(protected)/(game)/models/GamePlayer'
import { GamePlayerResult } from '@/app/(protected)/(game)/models/GamePlayerResult'
import { Map as GameMap } from '@/app/(protected)/(game)/models/Map'
import { MultiplayerRoundsData } from '@/app/(protected)/(game)/models/MultiplayerRoundsData'
import { PlayerProgress } from '@/app/(protected)/(game)/models/PlayerProgress'
import { PlayerStats } from '@/app/(protected)/(game)/models/PlayerStats'
import { UserAchievement } from '@/app/(protected)/(game)/models/UserAchievement'
import { AchievementGame, getEarnedMedals, XP_PER_ACHIEVEMENT } from '@/app/(protected)/(game)/utils/achievements'
import { getDayKey } from '@/app/(protected)/(game)/utils/days'
import { countMistakes } from '@/app/(protected)/(game)/utils/detective'
import { MAX_ROUND_SCORE } from '@/app/(protected)/(game)/utils/score'
import { EMPTY_STREAK, extendStreak, getCurrentStreak, StreakState } from '@/app/(protected)/(game)/utils/streak'
import { getGameXp, getLevelProgress } from '@/app/(protected)/(game)/utils/xp'
import { User } from '@/app/models/User'

/**
 * The progress of the players (`player_progress` and `user_achievements`):
 * stats, streak, XP and achievements, updated when each game ends and never
 * deleted (the games are, after 7 days).
 */

/** What a finished game gave a player. */
export interface GameXpResult {
  userId: number
  /** XP of the game, its medals included. */
  xpEarned: number
  /** Total XP of the player after this game. */
  xpTotal: number
  /** Medals won in the game (keys, see utils/achievements.ts). */
  achievements: string[]
}

/** What the game says about the player of `result`, to check the achievements. */
function toAchievementGame(game: Game, data: unknown, result: GamePlayerResult, playersCount: number): AchievementGame {
  const base: AchievementGame = {
    mode: game.mode,
    isDailyChallenge: game.dailyChallengeId != null,
    outcome: result.outcome,
    playersCount,
    score: result.score,
    guesses: [],
    maxScore: null,
    detective: null
  }

  switch (game.mode) {
    case GameMode.CLASSIC: {
      const classic = data as ClassicGameData

      return { ...base, guesses: classic.guesses, maxScore: MAX_ROUND_SCORE * classic.rounds.length }
    }

    case GameMode.CLASSIC_MULTIPLAYER:
    case GameMode.BATTLE_ROYALE:
      return { ...base, guesses: (data as MultiplayerRoundsData).guesses[String(result.userId)] ?? [] }

    case GameMode.DETECTIVE: {
      const detective = data as DetectiveGameData

      return {
        ...base,
        detective: {
          difficulty: detective.settings.difficulty,
          mistakes: countMistakes(detective),
          elapsedMinutes: detective.elapsedMinutes,
          timeLimitMinutes: detective.timeLimitMinutes
        }
      }
    }

    default:
      return base
  }
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
 * Adds a finished game to the progress of each of its players (stats, streak,
 * XP and the medals it won, the last two also kept in its `game_players` row
 * for the summary) and stores the score of a daily challenge attempt. `data`
 * is the final state of the game. Called once per game, in the same
 * transaction that marks it as finished (see services/gamePersistence.ts), so
 * a game is never counted twice. Returns what each player got.
 */
export async function recordFinishedGame(
  game: Game,
  data: unknown,
  players: GamePlayer[],
  results: GamePlayerResult[],
  now: Date
): Promise<GameXpResult[]> {
  const scored = game.mode !== GameMode.DETECTIVE
  const xpResults: GameXpResult[] = []
  const mapSlug = game.map?.slug ?? (game.mapId != null ? (await GameMap.find(game.mapId))?.slug : null) ?? null
  const mapsCount = await GameMap.where('enabled', true).count()

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
      difficulty: game.mode === GameMode.DETECTIVE ? (data as DetectiveGameData).settings?.difficulty : null
    })
    const mapsPlayed = [...new Set([...(progress?.mapsPlayed ?? []), ...(mapSlug ? [mapSlug] : [])])]
    const owned = new Set(
      (await UserAchievement.where('userId', result.userId).select('key').get()).map((medal) => medal.key)
    )
    const gamesPlayed = (progress?.gamesPlayed ?? 0) + 1
    const casesSolved =
      (progress?.casesSolved ?? 0) + (game.mode === GameMode.DETECTIVE && result.outcome === GameOutcome.WON ? 1 : 0)
    const achievements = getEarnedMedals(toAchievementGame(game, data, result, results.length), {
      gamesPlayed,
      bestStreak: streak.bestStreak,
      casesSolved,
      mapsPlayed: mapsPlayed.length,
      mapsCount
    }).filter((key) => !owned.has(key))
    const totalXpEarned = xpEarned + achievements.length * XP_PER_ACHIEVEMENT
    const xpTotal = (progress?.xp ?? 0) + totalXpEarned
    const values = {
      gamesPlayed,
      scoredGames: (progress?.scoredGames ?? 0) + (scored ? 1 : 0),
      totalScore: (progress?.totalScore ?? 0) + (scored ? result.score : 0),
      bestScore: Math.max(progress?.bestScore ?? 0, scored ? result.score : 0),
      casesSolved,
      ...streak,
      xp: xpTotal,
      mapsPlayed: JSON.stringify(mapsPlayed),
      updatedAt: now
    }

    if (progress) {
      await DB.table('player_progress').where('userId', result.userId).update(values)
    } else {
      await DB.table('player_progress').insert({ userId: result.userId, ...values })
    }

    await DB.table('game_players')
      .where('gameId', game.id)
      .where('userId', result.userId)
      .update({ xpEarned: totalXpEarned, xpTotal, achievements: JSON.stringify(achievements) })

    for (const key of achievements) {
      await DB.table('user_achievements').insert({ userId: result.userId, key, unlockedAt: now, gameId: game.id })
    }

    xpResults.push({ userId: result.userId, xpEarned: totalXpEarned, xpTotal, achievements })

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
