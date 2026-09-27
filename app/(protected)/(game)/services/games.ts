import { DB } from '@neogroup/neorm'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameMode, getGameModeConfig, isValidGameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameState, GameStateRound } from '@/app/(protected)/(game)/models/GameState'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { GameListItem, GameSession, GameView, RoundView } from '@/app/(protected)/(game)/models/GameView'
import { GuessInput } from '@/app/(protected)/(game)/models/GuessInput'
import { Place } from '@/app/(protected)/(game)/models/Place'
import { PlayerStats } from '@/app/(protected)/(game)/models/PlayerStats'
import { decryptGameState, encryptGameState } from '@/app/(protected)/(game)/services/gameTokens'
import { getStreetImageryProvider } from '@/app/(protected)/(game)/services/imagery'
import { StreetImage, StreetImageryProvider } from '@/app/(protected)/(game)/services/imagery/StreetImageryProvider'
import { findRandomLocation } from '@/app/(protected)/(game)/services/locations'
import { getPlaces } from '@/app/(protected)/(game)/services/places'
import { haversineDistance, normalizeLongitude, RandomFn } from '@/app/(protected)/(game)/utils/geo'
import { shuffle } from '@/app/(protected)/(game)/utils/random'
import { calculateRoundScore } from '@/app/(protected)/(game)/utils/score'
import { ApiException } from '@/app/models/ApiException'

/** Games left unfinished for longer than this are deleted (their token is useless by then anyway). */
const ABANDONED_GAME_MAX_AGE_MS = 24 * 60 * 60 * 1000

interface PlannedRound {
  place: Place
  image: StreetImage
}

export interface StartGameOptions {
  provider?: StreetImageryProvider
  random?: RandomFn
}

/**
 * Chooses the places and locations of a new game. Places are shuffled and
 * consumed in order, so every round is in a different place while the mode has
 * enough of them (with fewer places than rounds, places repeat). A place with
 * no coverage is skipped and the next one is tried. Searches run in parallel,
 * one per round, to keep the "loading game" wait short.
 */
async function planRounds(
  places: Place[],
  roundsCount: number,
  provider: StreetImageryProvider,
  random?: RandomFn
): Promise<PlannedRound[]> {
  const queue: Place[] = []

  while (queue.length < roundsCount * 2) {
    queue.push(...shuffle(places, random))
  }

  const usedImageIds = new Set<string>()

  const findForSlot = async (): Promise<PlannedRound | null> => {
    while (queue.length > 0) {
      const place = queue.shift()!
      const image = await findRandomLocation(place, provider, { random, excludeImageIds: usedImageIds })

      if (image && !usedImageIds.has(image.id)) {
        usedImageIds.add(image.id)

        return { place, image }
      }
    }

    return null
  }

  const planned = await Promise.all(Array.from({ length: roundsCount }, findForSlot))

  return planned.filter((round): round is PlannedRound => round !== null)
}

/** Deletes the unfinished games older than ABANDONED_GAME_MAX_AGE_MS (keeps the table small). */
export async function deleteAbandonedGames(now = new Date()): Promise<number> {
  const cutoff = new Date(now.getTime() - ABANDONED_GAME_MAX_AGE_MS)

  return DB.table('games').where('status', GameStatus.IN_PROGRESS).where('createdAt', '<', cutoff).delete()
}

function isGuessed(round: GameStateRound): boolean {
  return round.score != null
}

/** Client view of a round: the answer (position, place) only once it was guessed. */
function toRoundView(round: GameStateRound, index: number): RoundView {
  const guessed = isGuessed(round)

  return {
    roundNumber: index + 1,
    imageId: round.imageId,
    guessed,
    placeName: guessed ? round.placeName : null,
    countryCode: guessed ? round.countryCode : null,
    location: guessed ? { latitude: round.latitude, longitude: round.longitude } : null,
    guess:
      guessed && round.guessLatitude != null && round.guessLongitude != null
        ? { latitude: round.guessLatitude, longitude: round.guessLongitude }
        : null,
    distanceMeters: guessed ? (round.distanceMeters ?? null) : null,
    score: guessed ? (round.score ?? null) : null
  }
}

function toGameView(game: Game, state: GameState): GameView {
  const config = getGameModeConfig(game.mode)

  return {
    id: game.id,
    mode: game.mode,
    status: game.status,
    roundsCount: game.roundsCount,
    totalScore: game.totalScore,
    maxScore: config.score.maxScore * game.roundsCount,
    currentRoundNumber: game.status === GameStatus.IN_PROGRESS ? game.playedRounds + 1 : null,
    createdAt: game.createdAt.toISOString(),
    finishedAt: game.finishedAt ? game.finishedAt.toISOString() : null,
    rounds: state.rounds.map(toRoundView)
  }
}

function toSession(game: Game, state: GameState): GameSession {
  return { game: toGameView(game, state), token: encryptGameState(state) }
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
  const guessedRounds = state.rounds.filter(isGuessed).length

  if (guessedRounds !== game.playedRounds) {
    throw new ApiException('Esta partida está desactualizada: se siguió jugando desde otra pestaña o dispositivo', 409)
  }

  return { game, state }
}

/** Creates a new game of `mode` for the user, with all its rounds already chosen. */
export async function startGame(userId: number, mode: GameMode, options: StartGameOptions = {}): Promise<GameSession> {
  if (!isValidGameMode(mode)) {
    throw new ApiException('Modo de juego inválido')
  }

  const config = getGameModeConfig(mode)
  const places = await getPlaces(mode)

  if (places.length === 0) {
    throw new ApiException('Este modo de juego todavía no tiene lugares cargados')
  }

  const provider = options.provider ?? getStreetImageryProvider()
  const rounds = await planRounds(places, config.roundsCount, provider, options.random)

  if (rounds.length < config.roundsCount) {
    throw new ApiException('No pudimos encontrar imágenes para armar la partida. Intentá de nuevo en un momento.', 503)
  }

  await deleteAbandonedGames()

  const game = new Game()

  game.userId = userId
  game.mode = mode
  game.status = GameStatus.IN_PROGRESS
  game.roundsCount = config.roundsCount
  game.playedRounds = 0
  game.totalScore = 0
  game.createdAt = new Date()
  game.finishedAt = null
  await game.save()

  const state: GameState = {
    v: 1,
    gameId: game.id,
    userId,
    mode,
    rounds: rounds.map(({ place, image }) => ({
      placeName: place.name,
      countryCode: place.countryCode,
      imageId: image.id,
      latitude: image.latitude,
      longitude: image.longitude
    }))
  }

  return toSession(game, state)
}

/** Current view of a game from its token (validated against the database). */
export async function getGame(userId: number, token: unknown): Promise<GameSession> {
  const { game, state } = await openToken(userId, token)

  return toSession(game, state)
}

/**
 * Registers the player's guess for the current round: computes the distance
 * to the real location and the score, and finishes the game after the last
 * round. Returns the updated game (with the round's answer revealed) and the
 * new token, which replaces the previous one.
 */
export async function submitGuess(userId: number, input: GuessInput): Promise<GameSession> {
  const latitude = Number(input.latitude)
  const longitude = Number(input.longitude)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90) {
    throw new ApiException('Posición inválida')
  }

  const { game, state } = await openToken(userId, input.token)

  if (game.status !== GameStatus.IN_PROGRESS) {
    throw new ApiException('La partida ya terminó')
  }

  const roundNumber = game.playedRounds + 1

  if (Number(input.roundNumber) !== roundNumber) {
    throw new ApiException('Esa ronda ya fue jugada')
  }

  const round = state.rounds[roundNumber - 1]
  const config = getGameModeConfig(game.mode)
  const guess = { latitude, longitude: normalizeLongitude(longitude) }
  const distance = haversineDistance(round, guess)

  round.guessLatitude = guess.latitude
  round.guessLongitude = guess.longitude
  round.distanceMeters = Math.round(distance * 10) / 10
  round.score = calculateRoundScore(distance, config.score)

  const finished = roundNumber === game.roundsCount
  const totalScore = state.rounds.reduce((total, stateRound) => total + (stateRound.score ?? 0), 0)
  const finishedAt = finished ? new Date() : null
  // Conditional update: only succeeds if nobody played this round meanwhile
  // (two tabs, a double click...), so each round is scored exactly once.
  const updated = await DB.table('games')
    .where('id', game.id)
    .where('playedRounds', game.playedRounds)
    .update({
      playedRounds: roundNumber,
      totalScore,
      status: finished ? GameStatus.FINISHED : GameStatus.IN_PROGRESS,
      finishedAt
    })

  if (updated !== 1) {
    throw new ApiException('Esa ronda ya fue jugada')
  }

  game.playedRounds = roundNumber
  game.totalScore = totalScore
  game.status = finished ? GameStatus.FINISHED : GameStatus.IN_PROGRESS
  game.finishedAt = finishedAt

  return toSession(game, state)
}

function toListItem(game: Game): GameListItem {
  return {
    id: game.id,
    mode: game.mode,
    status: game.status,
    roundsCount: game.roundsCount,
    playedRounds: game.playedRounds,
    totalScore: game.totalScore,
    maxScore: getGameModeConfig(game.mode).score.maxScore * game.roundsCount,
    createdAt: game.createdAt.toISOString()
  }
}

/** Final result of a game of the user (what is kept once its rounds are gone). */
export async function getGameResult(userId: number, gameId: number): Promise<GameListItem> {
  return toListItem(await findUserGame(userId, gameId))
}

/** Latest games of the user, newest first. */
export async function getRecentGames(userId: number, limit = 10): Promise<GameListItem[]> {
  const games = await Game.where('userId', userId).orderByDesc('id').limit(limit).get()

  return games.map(toListItem)
}

/** Aggregated stats over the finished games of the user (account screen). */
export async function getPlayerStats(userId: number, mode: GameMode = GameMode.WORLD_CITIES): Promise<PlayerStats> {
  const games = await Game.where('userId', userId).where('mode', mode).where('status', GameStatus.FINISHED).get()
  const scores = games.map((game) => game.totalScore)
  const config = getGameModeConfig(mode)

  return {
    gamesPlayed: games.length,
    bestScore: scores.length > 0 ? Math.max(...scores) : 0,
    averageScore: scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
    maxScore: config.score.maxScore * config.roundsCount
  }
}
