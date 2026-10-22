import { DB } from '@neogroup/neorm'
import { DailyChallenge } from '@/app/(protected)/(game)/models/DailyChallenge'
import { DailyChallengeStatus } from '@/app/(protected)/(game)/models/DailyChallengeStatus'
import { DailyChallengeView } from '@/app/(protected)/(game)/models/DailyChallengeView'
import { DailyLeaderboardInput } from '@/app/(protected)/(game)/models/DailyLeaderboardInput'
import { DailyLeaderboardEntry, DailyLeaderboardView } from '@/app/(protected)/(game)/models/DailyLeaderboardView'
import { DailyRankView } from '@/app/(protected)/(game)/models/DailyRankView'
import { DailyResult } from '@/app/(protected)/(game)/models/DailyResult'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameContext } from '@/app/(protected)/(game)/models/GameContext'
import { GameOptions } from '@/app/(protected)/(game)/models/GameOptions'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { GameView } from '@/app/(protected)/(game)/models/GameView'
import { Map } from '@/app/(protected)/(game)/models/Map'
import { classicMode, createClassicGameData } from '@/app/(protected)/(game)/services/classicMode'
import { getGameSettings } from '@/app/(protected)/(game)/services/gameModes'
import { loadGame } from '@/app/(protected)/(game)/services/gamePersistence'
import { insertGame, resolveContext, toGameView } from '@/app/(protected)/(game)/services/games'
import { findMap, findMapBySlug } from '@/app/(protected)/(game)/services/maps'
import { planGameRounds } from '@/app/(protected)/(game)/services/rounds'
import { daysBetween, getDayKey, getNextDayStart } from '@/app/(protected)/(game)/utils/days'
import { MAX_ROUND_SCORE } from '@/app/(protected)/(game)/utils/score'
import { ApiException } from '@/app/models/ApiException'
import { User } from '@/app/models/User'
import { getUserDisplayName } from '@/app/utils/users'

/**
 * The daily challenge: every day a classic game with the same rounds for
 * everybody, one attempt per player, and the ranking of the day. The day is
 * the player's (its time zone, like the streak): the challenge changes at
 * its midnight, so the challenge of a day is played from UTC+14 to UTC-12.
 *
 * The challenge of a day is created the first time somebody plays it (its
 * rounds are searched then, like any game) and kept in `daily_challenges`;
 * every attempt is a row of `daily_results` — created when the player starts
 * (so a player can not have two attempts) and with its score once the game
 * ends (services/progress.ts). Both are kept while the games of that day are
 * (7 days, see gameCleanup.ts): the ranking does not need the games.
 */

/** Day of challenge #1 (YYYY-MM-DD): the number of a challenge counts the days since. */
export const DAILY_FIRST_DAY = '2026-10-21'

/** Maps of the challenge, one per day in turn. */
export const DAILY_MAP_SLUGS = ['famous-cities', 'world-cities', 'landmarks']

/** Rules of the challenge: the ones of the quick classic game. */
export const DAILY_SETTINGS = { rounds: 5, timeLimitSeconds: 180 }

/** A day as the API takes it. */
const DAY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/** How many players the ranking of a challenge lists. */
export const DAILY_LEADERBOARD_SIZE = 10

/** Number of the challenge of `day` (#1 is DAILY_FIRST_DAY). */
export function getDailyNumber(day: string): number {
  return daysBetween(DAILY_FIRST_DAY, day) + 1
}

/** Slug of the map of the challenge of `day` (they take turns). */
export function getDailyMapSlug(day: string): string {
  const count = DAILY_MAP_SLUGS.length

  return DAILY_MAP_SLUGS[(((getDailyNumber(day) - 1) % count) + count) % count]
}

/** The map of the challenge of `day`: its turn's map, or the next one available (a map may be disabled). */
async function findDailyMap(day: string): Promise<Map> {
  const first = DAILY_MAP_SLUGS.indexOf(getDailyMapSlug(day))

  for (let offset = 0; offset < DAILY_MAP_SLUGS.length; offset++) {
    const map = await findMapBySlug(DAILY_MAP_SLUGS[(first + offset) % DAILY_MAP_SLUGS.length])

    if (map) {
      return map
    }
  }

  throw new ApiException('errors.dailyChallengeUnavailable', 503)
}

function findChallenge(day: string): Promise<DailyChallenge | null> {
  return DailyChallenge.where('day', day).with('map').first()
}

/** Time zone of the player: the one of its day (null: UTC). */
async function getTimeZone(userId: number): Promise<string | null> {
  return (await User.where('id', userId).first())?.timeZone ?? null
}

/** The challenge of `day`, created (its rounds searched) by the first player who plays it. */
async function getOrCreateChallenge(day: string, ctx: GameContext): Promise<DailyChallenge> {
  const existing = await findChallenge(day)

  if (existing) {
    return existing
  }

  const map = await findDailyMap(day)
  const rounds = await planGameRounds(map.id, DAILY_SETTINGS.rounds, ctx)

  try {
    await DB.table('daily_challenges').insert({
      day,
      mapId: map.id,
      rounds: JSON.stringify(rounds),
      createdAt: ctx.now
    })
  } catch {
    // Another player created it at the same time (the day is unique): theirs is the one.
  }

  const challenge = await findChallenge(day)

  if (!challenge) {
    throw new ApiException('errors.dailyChallengeUnavailable', 503)
  }

  return challenge
}

/** Place of `score` among the finished attempts of a challenge (equal scores share the place). */
async function getRank(challengeId: number, score: number): Promise<DailyRankView> {
  const [total, better] = await Promise.all([
    DailyResult.where('challengeId', challengeId).whereNotNull('score').count(),
    DailyResult.where('challengeId', challengeId).where('score', '>', score).count()
  ])
  const position = better + 1

  return { position, total, topPercent: Math.min(100, Math.max(1, Math.ceil((position / total) * 100))) }
}

/** The player's attempt and the game it is played in (null once deleted). */
async function findAttempt(
  challengeId: number,
  userId: number
): Promise<{ result: DailyResult; game: Game | null } | null> {
  const result = await DailyResult.where('challengeId', challengeId).where('userId', userId).first()

  if (!result) {
    return null
  }

  return { result, game: result.gameId != null ? await Game.where('id', result.gameId).first() : null }
}

function getStatus(attempt: { result: DailyResult; game: Game | null } | null): DailyChallengeStatus {
  if (!attempt) {
    return 'available'
  }

  if (attempt.result.finishedAt) {
    return 'finished'
  }

  return attempt.game?.status === GameStatus.IN_PROGRESS ? 'inProgress' : 'forfeited'
}

/** Today's challenge for the menu: whether the player already played it, and how it went. */
export async function getDailyChallenge(userId: number, options: GameOptions = {}): Promise<DailyChallengeView> {
  const { now } = resolveContext(options)
  const timeZone = await getTimeZone(userId)
  const day = getDayKey(now, timeZone)
  const challenge = await findChallenge(day)
  const attempt = challenge ? await findAttempt(challenge.id, userId) : null
  const status = getStatus(attempt)
  const score = status === 'finished' ? (attempt!.result.score ?? 0) : null

  return {
    number: getDailyNumber(day),
    day,
    mapSlug: challenge?.map?.slug ?? getDailyMapSlug(day),
    roundsCount: DAILY_SETTINGS.rounds,
    timeLimitSeconds: DAILY_SETTINGS.timeLimitSeconds,
    status,
    gameId: attempt?.game ? attempt.game.id : null,
    score,
    maxScore: MAX_ROUND_SCORE * DAILY_SETTINGS.rounds,
    rank: challenge && score !== null ? await getRank(challenge.id, score) : null,
    nextChallengeAt: getNextDayStart(now, timeZone).toISOString()
  }
}

/**
 * Plays today's challenge: creates the player's game with the rounds of the
 * day, or gives back the one in progress. Rejected once the attempt was used
 * (finished, or left before the end).
 */
export async function playDailyChallenge(userId: number, options: GameOptions = {}): Promise<GameView> {
  const ctx = resolveContext(options)
  const challenge = await getOrCreateChallenge(getDayKey(ctx.now, await getTimeZone(userId)), ctx)

  const resume = async (): Promise<GameView> => {
    const attempt = await findAttempt(challenge.id, userId)

    if (getStatus(attempt) !== 'inProgress') {
      throw new ApiException('errors.dailyChallengeAlreadyPlayed', 409)
    }

    return toGameView(await loadGame(attempt!.game!.id), userId, ctx)
  }

  if (await DailyResult.where('challengeId', challenge.id).where('userId', userId).first()) {
    return resume()
  }

  try {
    await DB.table('daily_results').insert({
      challengeId: challenge.id,
      userId,
      gameId: null,
      score: null,
      startedAt: ctx.now,
      finishedAt: null
    })
  } catch {
    // Started at the same time from another tab: one attempt per player (primary key).
    return resume()
  }

  try {
    const map = await findMap(challenge.mapId)

    if (!map) {
      throw new ApiException('errors.dailyChallengeUnavailable', 503)
    }

    const settings = getGameSettings(classicMode, map, DAILY_SETTINGS)
    const data = createClassicGameData(settings, challenge.rounds)
    const game = await insertGame(userId, classicMode, map.id, data, ctx, { dailyChallengeId: challenge.id })

    await DB.table('daily_results')
      .where('challengeId', challenge.id)
      .where('userId', userId)
      .update({ gameId: game.id })

    return game
  } catch (error) {
    // The attempt is not used if its game could not be created.
    await DB.table('daily_results').where('challengeId', challenge.id).where('userId', userId).delete()

    throw error
  }
}

/** The challenge asked for: by its id, by its day (up to the player's today) or today's. Null: that day has none. */
async function findRequestedChallenge(
  input: DailyLeaderboardInput,
  today: string
): Promise<{ day: string; challenge: DailyChallenge | null }> {
  if (input.challengeId != null) {
    const challenge = Number.isInteger(Number(input.challengeId))
      ? await DailyChallenge.where('id', Number(input.challengeId)).with('map').first()
      : null

    if (!challenge) {
      throw new ApiException('errors.dailyChallengeNotFound', 404)
    }

    return { day: challenge.day, challenge }
  }

  const day = typeof input.day === 'string' && DAY_PATTERN.test(input.day) && input.day <= today ? input.day : today

  return { day, challenge: await findChallenge(day) }
}

/**
 * Ranking of a daily challenge (by its id or its day; none: today's): the best
 * scores, the player's place, and the days before and after it to browse them.
 */
export async function getDailyLeaderboard(
  userId: number,
  input: DailyLeaderboardInput = {},
  options: GameOptions = {}
): Promise<DailyLeaderboardView> {
  const { now } = resolveContext(options)
  const today = getDayKey(now, await getTimeZone(userId))
  const { day, challenge } = await findRequestedChallenge(input ?? {}, today)
  const best = challenge
    ? await DailyResult.where('challengeId', challenge.id)
        .whereNotNull('score')
        .orderByDesc('score')
        .orderBy('finishedAt')
        .limit(DAILY_LEADERBOARD_SIZE)
        .with('user')
        .get()
    : []
  const top = best.reduce<DailyLeaderboardEntry[]>((entries, result, index) => {
    const previous = entries[index - 1]
    const score = result.score ?? 0

    entries.push({
      position: previous && previous.score === score ? previous.position : index + 1,
      name: result.user ? getUserDisplayName(result.user) : '?',
      score,
      isMe: result.userId === userId
    })

    return entries
  }, [])
  const mine = challenge ? await DailyResult.where('challengeId', challenge.id).where('userId', userId).first() : null
  const [previous, next] = await Promise.all([
    DailyChallenge.where('day', '<', day).orderByDesc('day').select('day').first(),
    DailyChallenge.where('day', '>', day).where('day', '<=', today).orderBy('day').select('day').first()
  ])

  return {
    challengeId: challenge?.id ?? null,
    number: getDailyNumber(day),
    day,
    mapSlug: challenge?.map?.slug ?? getDailyMapSlug(day),
    isToday: day === today,
    me: challenge && mine?.score != null ? { ...(await getRank(challenge.id, mine.score)), score: mine.score } : null,
    top,
    previousDay: previous?.day ?? null,
    nextDay: day === today ? null : (next?.day ?? today)
  }
}
