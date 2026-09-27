import { DB } from '@neogroup/neorm'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameMode, getGameModeConfig, isValidGameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameRound } from '@/app/(protected)/(game)/models/GameRound'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { GameListItem, GameView, RoundView } from '@/app/(protected)/(game)/models/GameView'
import { GuessInput } from '@/app/(protected)/(game)/models/GuessInput'
import { Place } from '@/app/(protected)/(game)/models/Place'
import { PlayerStats } from '@/app/(protected)/(game)/models/PlayerStats'
import { getStreetImageryProvider } from '@/app/(protected)/(game)/services/imagery'
import { StreetImage, StreetImageryProvider } from '@/app/(protected)/(game)/services/imagery/StreetImageryProvider'
import { findRandomLocation } from '@/app/(protected)/(game)/services/locations'
import { getPlaces } from '@/app/(protected)/(game)/services/places'
import { haversineDistance, RandomFn } from '@/app/(protected)/(game)/utils/geo'
import { shuffle } from '@/app/(protected)/(game)/utils/random'
import { calculateRoundScore } from '@/app/(protected)/(game)/utils/score'
import { ApiException } from '@/app/models/ApiException'

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

/** Creates a new game of `mode` for the user, with all its rounds already chosen. */
export async function startGame(userId: number, mode: GameMode, options: StartGameOptions = {}): Promise<GameView> {
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

  const game = new Game()

  await DB.transaction(async () => {
    game.userId = userId
    game.mode = mode
    game.status = GameStatus.IN_PROGRESS
    game.roundsCount = config.roundsCount
    game.totalScore = 0
    await game.save()

    for (const [index, { place, image }] of rounds.entries()) {
      const round = new GameRound()

      round.gameId = game.id
      round.roundNumber = index + 1
      round.placeId = place.id
      round.imageId = image.id
      round.latitude = image.latitude
      round.longitude = image.longitude
      await round.save()
    }
  })

  return getGame(userId, game.id)
}

async function findUserGame(userId: number, gameId: number): Promise<Game> {
  const game = Number.isInteger(gameId) ? await Game.where('id', gameId).where('userId', userId).first() : null

  if (!game) {
    throw new ApiException('Partida no encontrada', 404)
  }

  return game
}

async function getRounds(gameId: number): Promise<GameRound[]> {
  return GameRound.where('gameId', gameId).with('place').orderBy('roundNumber').get()
}

/** Client view of a round: the answer (position, place) only once it was guessed. */
export function toRoundView(round: GameRound): RoundView {
  const guessed = round.guessedAt != null

  return {
    roundNumber: round.roundNumber,
    imageId: round.imageId,
    guessed,
    placeName: guessed ? (round.place?.name ?? null) : null,
    countryCode: guessed ? (round.place?.countryCode ?? null) : null,
    location: guessed ? { latitude: round.latitude, longitude: round.longitude } : null,
    guess:
      guessed && round.guessLatitude != null && round.guessLongitude != null
        ? { latitude: round.guessLatitude, longitude: round.guessLongitude }
        : null,
    distanceMeters: guessed ? round.distanceMeters : null,
    score: guessed ? round.score : null
  }
}

export function toGameView(game: Game, rounds: GameRound[]): GameView {
  const config = getGameModeConfig(game.mode)
  const nextRound = rounds.find((round) => round.guessedAt == null)

  return {
    id: game.id,
    mode: game.mode,
    status: game.status,
    roundsCount: game.roundsCount,
    totalScore: game.totalScore,
    maxScore: config.score.maxScore * game.roundsCount,
    currentRoundNumber: game.status === GameStatus.IN_PROGRESS ? (nextRound?.roundNumber ?? null) : null,
    createdAt: game.createdAt.toISOString(),
    finishedAt: game.finishedAt ? game.finishedAt.toISOString() : null,
    rounds: rounds.map(toRoundView)
  }
}

/** A game of the user (404 when it does not exist or belongs to someone else). */
export async function getGame(userId: number, gameId: number): Promise<GameView> {
  const game = await findUserGame(userId, gameId)

  return toGameView(game, await getRounds(game.id))
}

/**
 * Registers the player's guess for the current round: computes the distance
 * to the real location and the score, and finishes the game after the last
 * round. Returns the updated game (with the round's answer revealed).
 */
export async function submitGuess(userId: number, input: GuessInput): Promise<GameView> {
  const latitude = Number(input.latitude)
  const longitude = Number(input.longitude)

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90) {
    throw new ApiException('Posición inválida')
  }

  const game = await findUserGame(userId, Number(input.gameId))

  if (game.status !== GameStatus.IN_PROGRESS) {
    throw new ApiException('La partida ya terminó')
  }

  const rounds = await getRounds(game.id)
  const currentRound = rounds.find((round) => round.guessedAt == null)

  if (!currentRound || currentRound.roundNumber !== Number(input.roundNumber)) {
    throw new ApiException('Esa ronda ya fue jugada')
  }

  const config = getGameModeConfig(game.mode)
  const guess = { latitude, longitude: ((((longitude + 180) % 360) + 360) % 360) - 180 }
  const distance = haversineDistance(currentRound, guess)

  currentRound.guessLatitude = guess.latitude
  currentRound.guessLongitude = guess.longitude
  currentRound.distanceMeters = Math.round(distance * 10) / 10
  currentRound.score = calculateRoundScore(distance, config.score)
  currentRound.guessedAt = new Date()

  game.totalScore = rounds.reduce((total, round) => total + (round.score ?? 0), 0)

  if (rounds.every((round) => round.guessedAt != null)) {
    game.status = GameStatus.FINISHED
    game.finishedAt = new Date()
  }

  await DB.transaction(async () => {
    await currentRound.save()
    await game.save()
  })

  return toGameView(game, rounds)
}

/** Latest games of the user, newest first. */
export async function getRecentGames(userId: number, limit = 10): Promise<GameListItem[]> {
  const games = await Game.where('userId', userId).orderByDesc('id').limit(limit).with('rounds').get()

  return games.map((game) => ({
    id: game.id,
    mode: game.mode,
    status: game.status,
    roundsCount: game.roundsCount,
    playedRounds: (game.rounds ?? []).filter((round) => round.guessedAt != null).length,
    totalScore: game.totalScore,
    maxScore: getGameModeConfig(game.mode).score.maxScore * game.roundsCount,
    createdAt: game.createdAt.toISOString()
  }))
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
