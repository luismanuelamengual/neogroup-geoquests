import { DB } from '@neogroup/neorm'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameContext } from '@/app/(protected)/(game)/models/GameContext'
import { GameModeEngine } from '@/app/(protected)/(game)/models/GameModeEngine'
import { GamePlayer } from '@/app/(protected)/(game)/models/GamePlayer'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { LoadedGame } from '@/app/(protected)/(game)/models/LoadedGame'
import { getGameModeEngine } from '@/app/(protected)/(game)/services/gameModes'
import { ApiException } from '@/app/models/ApiException'

/**
 * Reading and writing games safely while several players act at once.
 *
 * `games.data` is read, changed in memory and written back as a whole, so two
 * requests working on the same game at the same time could overwrite each
 * other. Every write is therefore conditional on the version that was read
 * (optimistic locking): if another request wrote first, nothing is written
 * and the change is applied again on the fresh state, up to
 * MAX_UPDATE_ATTEMPTS times.
 */
export const MAX_UPDATE_ATTEMPTS = 4

/**
 * A change to apply on a game: it modifies `data` (a working copy) and may
 * also change the common columns of `loaded.game` (status, startedAt,
 * hostUserId, code). Returns whether something changed. Throwing (e.g. an
 * ApiException for an invalid action) cancels the whole update.
 */
export type GameChange = (data: unknown, loaded: LoadedGame, engine: GameModeEngine) => boolean | Promise<boolean>

export interface UpdateGameOptions {
  /** Finish the game even if its engine says it is not over (abandoned games). */
  finish?: boolean
}

/** A game with its players (and their users); throws 404 when it does not exist. */
export async function loadGame(gameId: number): Promise<LoadedGame> {
  const game = Number.isInteger(gameId) ? await Game.where('id', gameId).with('map').first() : null

  if (!game) {
    throw new ApiException('Partida no encontrada', 404)
  }

  const players = await GamePlayer.where('gameId', game.id).orderBy('joinedAt').orderBy('userId').with('user').get()

  return { game, players }
}

/**
 * Writes the game if nobody else did since it was read (same version). When
 * the game ends, the final results of the players are stored in the same
 * transaction. Returns false when another request wrote first.
 */
async function saveGame(
  loaded: LoadedGame,
  data: unknown,
  engine: GameModeEngine,
  finish: boolean,
  now: Date
): Promise<boolean> {
  const { game, players } = loaded
  const results = finish ? engine.finalize(data, { players, hostUserId: game.hostUserId }) : []
  const status = finish ? GameStatus.FINISHED : game.status
  const finishedAt = finish ? now : game.finishedAt
  const code = finish ? null : game.code

  const write = async (): Promise<boolean> => {
    const updated = await DB.table('games')
      .where('id', game.id)
      .where('version', game.version)
      .update({
        data: JSON.stringify(data),
        version: game.version + 1,
        status,
        code,
        hostUserId: game.hostUserId,
        startedAt: game.startedAt,
        finishedAt,
        updatedAt: now
      })

    if (updated !== 1) {
      return false
    }

    for (const result of results) {
      await DB.table('game_players')
        .where('gameId', game.id)
        .where('userId', result.userId)
        .update({ score: result.score, position: result.position, outcome: result.outcome })
    }

    return true
  }

  // A single conditional UPDATE is atomic by itself: a transaction is only needed to store the results too.
  const saved = finish ? await DB.transaction(write) : await write()

  if (saved) {
    game.data = data
    game.version++
    game.status = status
    game.code = code
    game.finishedAt = finishedAt
    game.updatedAt = now

    for (const result of results) {
      const player = players.find((candidate) => candidate.userId === result.userId)

      if (player) {
        player.score = result.score
        player.position = result.position
        player.outcome = result.outcome
      }
    }
  }

  return saved
}

/**
 * Reads a game, applies the changes driven by time (engine.advance) and then
 * `change` (if any), and writes the result — only when something changed.
 * Retries on concurrent writes (see MAX_UPDATE_ATTEMPTS). The game is finished
 * (final results stored in `game_players`) as soon as its engine says it is
 * over. Returns the game as it is after the update.
 */
export async function updateGame(
  gameId: number,
  ctx: GameContext,
  change?: GameChange,
  options: UpdateGameOptions = {}
): Promise<LoadedGame> {
  for (let attempt = 0; attempt < MAX_UPDATE_ATTEMPTS; attempt++) {
    const loaded = await loadGame(gameId)
    const { game, players } = loaded
    const engine = getGameModeEngine(game.mode)
    const data = structuredClone(game.data)
    let changed =
      game.status === GameStatus.IN_PROGRESS && engine.advance(data, { players, hostUserId: game.hostUserId }, ctx)

    if (change) {
      changed = (await change(data, loaded, engine)) || changed
    }

    const finish =
      game.status !== GameStatus.FINISHED &&
      (!!options.finish || (game.status === GameStatus.IN_PROGRESS && engine.isFinished(data)))

    if (!changed && !finish) {
      return loaded
    }

    if (await saveGame(loaded, data, engine, finish, ctx.now)) {
      return loaded
    }
  }

  throw new ApiException('Hay mucha actividad en esta partida: intentá de nuevo', 409)
}
