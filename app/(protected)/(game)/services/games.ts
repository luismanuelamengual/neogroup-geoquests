import { DB } from '@neogroup/neorm'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameState, GameStateRound } from '@/app/(protected)/(game)/models/GameState'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { GameListItem, GameSession, GamesPage, GameView, RoundView } from '@/app/(protected)/(game)/models/GameView'
import { GuessInput } from '@/app/(protected)/(game)/models/GuessInput'
import { Place } from '@/app/(protected)/(game)/models/Place'
import { PlayerStats } from '@/app/(protected)/(game)/models/PlayerStats'
import { decryptGameState, encryptGameState } from '@/app/(protected)/(game)/services/gameTokens'
import { findCachedLocation, findLiveLocation } from '@/app/(protected)/(game)/services/locations'
import { findQuest, getQuestPlaces } from '@/app/(protected)/(game)/services/quests'
import { getPanoramaFinder, Panorama, PanoramaFinder } from '@/app/(protected)/(game)/services/streetView'
import { haversineDistance, normalizeLongitude, RandomFn } from '@/app/(protected)/(game)/utils/geo'
import { shuffle } from '@/app/(protected)/(game)/utils/random'
import { calculateRoundScore, MAX_ROUND_SCORE } from '@/app/(protected)/(game)/utils/score'
import { ApiException } from '@/app/models/ApiException'

/** Games left unfinished for longer than this are deleted (their token is useless by then anyway). */
const ABANDONED_GAME_MAX_AGE_MS = 24 * 60 * 60 * 1000
/**
 * Extra time accepted after a round's time limit, to absorb network latency:
 * a guess sent by the client right when its countdown hits 0 still counts.
 */
export const ROUND_TIME_GRACE_MS = 5000

interface PlannedRound {
  place: Place
  panorama: Panorama
}

export interface GameServiceOptions {
  /** Street View search (tests inject a fake one). */
  finder?: PanoramaFinder
  random?: RandomFn
  /** Current time (tests). */
  now?: () => Date
}

/**
 * Chooses the places and locations of a new game.
 *
 *   1. Live panoramas only: places are shuffled and consumed in order (so
 *      every round is in a different place while the quest has enough of
 *      them); a place where no live panorama is found is skipped for another.
 *      Searches run in parallel, one per round, to keep the wait short.
 *   2. Only if that could not fill the game (in practice: Street View is
 *      failing), the missing rounds come from the fallback cache — preferably
 *      from places not used yet.
 */
async function planRounds(
  places: Place[],
  roundsCount: number,
  finder: PanoramaFinder,
  random?: RandomFn
): Promise<PlannedRound[]> {
  const queue: Place[] = []

  while (queue.length < roundsCount * 2) {
    queue.push(...shuffle(places, random))
  }

  const usedPanoIds = new Set<string>()

  const findLiveForSlot = async (): Promise<PlannedRound | null> => {
    while (queue.length > 0) {
      const place = queue.shift()!
      const { panorama } = await findLiveLocation(place, finder, { random, excludePanoIds: usedPanoIds })

      if (panorama && !usedPanoIds.has(panorama.id)) {
        usedPanoIds.add(panorama.id)

        return { place, panorama }
      }
    }

    return null
  }

  const planned = (await Promise.all(Array.from({ length: roundsCount }, findLiveForSlot))).filter(
    (round): round is PlannedRound => round !== null
  )

  if (planned.length < roundsCount) {
    const usedPlaceIds = new Set(planned.map((round) => round.place.id))
    const fallbackPlaces = [
      ...shuffle(
        places.filter((place) => !usedPlaceIds.has(place.id)),
        random
      ),
      ...shuffle(places, random)
    ]

    for (const place of fallbackPlaces) {
      if (planned.length >= roundsCount) {
        break
      }

      const panorama = await findCachedLocation(place, { random, excludePanoIds: usedPanoIds })

      if (panorama) {
        usedPanoIds.add(panorama.id)
        planned.push({ place, panorama })
      }
    }
  }

  return planned
}

/** Deletes the unfinished games older than ABANDONED_GAME_MAX_AGE_MS (keeps the table small). */
export async function deleteAbandonedGames(now = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - ABANDONED_GAME_MAX_AGE_MS)

  return DB.table('games').where('status', GameStatus.IN_PROGRESS).where('createdAt', '<', cutoff).delete()
}

function isPlayed(round: GameStateRound): boolean {
  return round.score != null
}

/** Client view of a round: the answer (position, place) only once it was played. */
function toRoundView(round: GameStateRound, index: number): RoundView {
  const played = isPlayed(round)

  return {
    roundNumber: index + 1,
    panoId: round.panoId,
    guessed: played,
    placeName: played ? round.placeName : null,
    countryCode: played ? round.countryCode : null,
    location: played ? { latitude: round.latitude, longitude: round.longitude } : null,
    guess:
      played && round.guessLatitude != null && round.guessLongitude != null
        ? { latitude: round.guessLatitude, longitude: round.guessLongitude }
        : null,
    distanceMeters: played ? (round.distanceMeters ?? null) : null,
    score: played ? (round.score ?? null) : null,
    timedOut: played && !!round.timedOut
  }
}

/** Milliseconds left to play the current round (null: no limit, or the round was not started). */
function getRoundTimeLeftMs(game: Game, state: GameState, now: Date): number | null {
  if (state.timeLimitSeconds == null || game.status !== GameStatus.IN_PROGRESS || !game.roundStartedAt) {
    return null
  }

  return Math.max(0, game.roundStartedAt.getTime() + state.timeLimitSeconds * 1000 - now.getTime())
}

function toGameView(game: Game, state: GameState, now: Date): GameView {
  return {
    id: game.id,
    questId: state.questId,
    questName: state.questName,
    status: game.status,
    roundsCount: game.roundsCount,
    totalScore: game.totalScore,
    maxScore: MAX_ROUND_SCORE * game.roundsCount,
    currentRoundNumber: game.status === GameStatus.IN_PROGRESS ? game.playedRounds + 1 : null,
    timeLimitSeconds: state.timeLimitSeconds,
    roundTimeLeftMs: getRoundTimeLeftMs(game, state, now),
    createdAt: game.createdAt.toISOString(),
    finishedAt: game.finishedAt ? game.finishedAt.toISOString() : null,
    rounds: state.rounds.map(toRoundView)
  }
}

function toSession(game: Game, state: GameState, now: Date): GameSession {
  return { game: toGameView(game, state, now), token: encryptGameState(state) }
}

async function findUserGame(userId: number, gameId: number): Promise<Game> {
  const game = Number.isInteger(gameId) ? await Game.where('id', gameId).where('userId', userId).first() : null

  if (!game) {
    throw new ApiException('Partida no encontrada', 404)
  }

  return game
}

/**
 * Decrypts a token of the user and checks it against the stored game: the
 * token must carry exactly the rounds the database says were played. An older
 * token (a replay, or a copy left in another browser) is rejected.
 */
async function openToken(userId: number, token: unknown): Promise<{ game: Game; state: GameState }> {
  const state = decryptGameState(token)

  if (state.userId !== userId) {
    throw new ApiException('Partida no encontrada', 404)
  }

  const game = await findUserGame(userId, state.gameId)
  const playedRounds = state.rounds.filter(isPlayed).length

  if (playedRounds !== game.playedRounds) {
    throw new ApiException('Esta partida está desactualizada: se siguió jugando desde otra pestaña o dispositivo', 409)
  }

  return { game, state }
}

/** Creates a new game of a quest for the user, with all its rounds already chosen. */
export async function startGame(
  userId: number,
  questId: number,
  options: GameServiceOptions = {}
): Promise<GameSession> {
  const quest = await findQuest(questId)

  if (!quest) {
    throw new ApiException('Modo de juego no encontrado', 404)
  }

  const places = await getQuestPlaces(quest.id)

  if (places.length === 0) {
    throw new ApiException('Este modo de juego todavía no tiene lugares cargados')
  }

  const finder = options.finder ?? getPanoramaFinder()
  const rounds = await planRounds(places, quest.rounds, finder, options.random)

  if (rounds.length < quest.rounds) {
    throw new ApiException('No pudimos encontrar imágenes para armar la partida. Intentá de nuevo en un momento.', 503)
  }

  const now = options.now?.() ?? new Date()

  await deleteAbandonedGames(now)

  const game = new Game()

  game.userId = userId
  game.questId = quest.id
  game.status = GameStatus.IN_PROGRESS
  game.roundsCount = quest.rounds
  game.playedRounds = 0
  game.totalScore = 0
  game.roundStartedAt = null
  game.createdAt = now
  game.finishedAt = null
  await game.save()

  const state: GameState = {
    v: 3,
    gameId: game.id,
    userId,
    questId: quest.id,
    questName: quest.name,
    timeLimitSeconds: quest.time != null && quest.time > 0 ? Math.round(quest.time) : null,
    rounds: rounds.map(({ place, panorama }) => ({
      placeName: place.name,
      countryCode: place.countryCode,
      panoId: panorama.id,
      latitude: panorama.latitude,
      longitude: panorama.longitude
    }))
  }

  return toSession(game, state, now)
}

/** Current view of a game from its token (validated against the database). */
export async function getGame(userId: number, token: unknown, options: GameServiceOptions = {}): Promise<GameSession> {
  const { game, state } = await openToken(userId, token)

  return toSession(game, state, options.now?.() ?? new Date())
}

/**
 * Starts the clock of the current round (timed quests): called by the client
 * when it shows the round. Idempotent — once started, the round keeps its
 * original start time, so reloading the page never gives extra time. For
 * quests without time limit it just returns the game.
 */
export async function startRound(
  userId: number,
  token: unknown,
  options: GameServiceOptions = {}
): Promise<GameSession> {
  const { game, state } = await openToken(userId, token)
  const now = options.now?.() ?? new Date()

  if (state.timeLimitSeconds != null && game.status === GameStatus.IN_PROGRESS && !game.roundStartedAt) {
    // Conditional: only the first call for this round sets the start time.
    const updated = await DB.table('games')
      .where('id', game.id)
      .where('playedRounds', game.playedRounds)
      .whereNull('roundStartedAt')
      .update({ roundStartedAt: now })

    game.roundStartedAt = updated === 1 ? now : ((await Game.where('id', game.id).first())?.roundStartedAt ?? now)
  }

  return toSession(game, state, now)
}

/**
 * Registers the player's guess for the current round: computes the distance
 * to the real location and the score, and finishes the game after the last
 * round. Returns the updated game (with the round's answer revealed) and the
 * new token, which replaces the previous one.
 *
 * Timed quests: the round must have been started (startRound), and a guess
 * arriving after the time limit (plus ROUND_TIME_GRACE_MS) — or no guess at
 * all, when the countdown ended before a pin was placed — scores 0.
 */
export async function submitGuess(
  userId: number,
  input: GuessInput,
  options: GameServiceOptions = {}
): Promise<GameSession> {
  const hasGuess = input.latitude != null && input.longitude != null
  const latitude = Number(input.latitude)
  const longitude = Number(input.longitude)

  if (hasGuess && (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90)) {
    throw new ApiException('Posición inválida')
  }

  const { game, state } = await openToken(userId, input.token)
  const now = options.now?.() ?? new Date()

  if (game.status !== GameStatus.IN_PROGRESS) {
    throw new ApiException('La partida ya terminó')
  }

  const roundNumber = game.playedRounds + 1

  if (Number(input.roundNumber) !== roundNumber) {
    throw new ApiException('Esa ronda ya fue jugada')
  }

  const timed = state.timeLimitSeconds != null

  if (timed && !game.roundStartedAt) {
    throw new ApiException('La ronda todavía no empezó')
  }

  if (!timed && !hasGuess) {
    throw new ApiException('Marcá un lugar en el mapa')
  }

  const late =
    timed && now.getTime() > game.roundStartedAt!.getTime() + state.timeLimitSeconds! * 1000 + ROUND_TIME_GRACE_MS
  const round = state.rounds[roundNumber - 1]

  if (hasGuess && !late) {
    const guess = { latitude, longitude: normalizeLongitude(longitude) }
    const distance = haversineDistance(round, guess)

    round.guessLatitude = guess.latitude
    round.guessLongitude = guess.longitude
    round.distanceMeters = Math.round(distance * 10) / 10
    round.score = calculateRoundScore(distance)
  } else {
    round.timedOut = true
    round.score = 0
  }

  const finished = roundNumber === game.roundsCount
  const totalScore = state.rounds.reduce((total, stateRound) => total + (stateRound.score ?? 0), 0)
  const finishedAt = finished ? now : null
  // Conditional update: only succeeds if nobody played this round meanwhile
  // (two tabs, a double click...), so each round is scored exactly once.
  const updated = await DB.table('games')
    .where('id', game.id)
    .where('playedRounds', game.playedRounds)
    .update({
      playedRounds: roundNumber,
      totalScore,
      status: finished ? GameStatus.FINISHED : GameStatus.IN_PROGRESS,
      roundStartedAt: null,
      finishedAt
    })

  if (updated !== 1) {
    throw new ApiException('Esa ronda ya fue jugada')
  }

  game.playedRounds = roundNumber
  game.totalScore = totalScore
  game.status = finished ? GameStatus.FINISHED : GameStatus.IN_PROGRESS
  game.roundStartedAt = null
  game.finishedAt = finishedAt

  return toSession(game, state, now)
}

function toListItem(game: Game): GameListItem {
  return {
    id: game.id,
    questId: game.questId,
    questName: game.quest?.name ?? '',
    status: game.status,
    roundsCount: game.roundsCount,
    playedRounds: game.playedRounds,
    totalScore: game.totalScore,
    maxScore: MAX_ROUND_SCORE * game.roundsCount,
    createdAt: game.createdAt.toISOString()
  }
}

/** Final result of a game of the user (what is kept once its rounds are gone). */
export async function getGameResult(userId: number, gameId: number): Promise<GameListItem> {
  const game = Number.isInteger(gameId)
    ? await Game.where('id', gameId).where('userId', userId).with('quest').first()
    : null

  if (!game) {
    throw new ApiException('Partida no encontrada', 404)
  }

  return toListItem(game)
}

/** Games of the user, newest first, `limit` at a time. */
export async function getGames(userId: number, offset = 0, limit = 20): Promise<GamesPage> {
  const safeLimit = Math.min(Math.max(1, Math.floor(limit) || 20), 50)
  const safeOffset = Math.max(0, Math.floor(offset) || 0)
  // One extra row tells whether there is another page.
  const games = await Game.where('userId', userId)
    .orderByDesc('id')
    .offset(safeOffset)
    .limit(safeLimit + 1)
    .with('quest')
    .get()

  return { items: games.slice(0, safeLimit).map(toListItem), hasMore: games.length > safeLimit }
}

/** Aggregated stats over the finished games of the user (games screen). */
export async function getPlayerStats(userId: number): Promise<PlayerStats> {
  const games = await Game.where('userId', userId).where('status', GameStatus.FINISHED).get()
  const scores = games.map((game) => game.totalScore)

  return {
    gamesPlayed: games.length,
    bestScore: scores.length > 0 ? Math.max(...scores) : 0,
    averageScore: scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0
  }
}
