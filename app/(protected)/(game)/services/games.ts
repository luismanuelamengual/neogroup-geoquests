import { DB } from '@neogroup/neorm'
import { CreateGameInput } from '@/app/(protected)/(game)/models/CreateGameInput'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameActionInput } from '@/app/(protected)/(game)/models/GameActionInput'
import { GameContext } from '@/app/(protected)/(game)/models/GameContext'
import { GameIdInput } from '@/app/(protected)/(game)/models/GameIdInput'
import { GameListItem } from '@/app/(protected)/(game)/models/GameListItem'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameOptions } from '@/app/(protected)/(game)/models/GameOptions'
import { GamePlayer } from '@/app/(protected)/(game)/models/GamePlayer'
import { GamePlayerStatus } from '@/app/(protected)/(game)/models/GamePlayerStatus'
import { GamePlayerView } from '@/app/(protected)/(game)/models/GamePlayerView'
import { GamesPage } from '@/app/(protected)/(game)/models/GamesPage'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { GameSyncResponse } from '@/app/(protected)/(game)/models/GameSyncResponse'
import { GameView } from '@/app/(protected)/(game)/models/GameView'
import { GetGameInput } from '@/app/(protected)/(game)/models/GetGameInput'
import { JoinGameInput } from '@/app/(protected)/(game)/models/JoinGameInput'
import { KickPlayerInput } from '@/app/(protected)/(game)/models/KickPlayerInput'
import { LoadedGame } from '@/app/(protected)/(game)/models/LoadedGame'
import { PlayerStats } from '@/app/(protected)/(game)/models/PlayerStats'
import { cleanupGames, deleteGames } from '@/app/(protected)/(game)/services/gameCleanup'
import { findGameModeEngine, getGameModeEngine, getGameSettings } from '@/app/(protected)/(game)/services/gameModes'
import { loadGame, updateGame } from '@/app/(protected)/(game)/services/gamePersistence'
import { findMap, findMapByName } from '@/app/(protected)/(game)/services/maps'
import { getPanoramaFinder } from '@/app/(protected)/(game)/services/streetView'
import { generateGameCode, normalizeGameCode } from '@/app/(protected)/(game)/utils/gameCodes'
import { ApiException } from '@/app/models/ApiException'
import { getUserDisplayName } from '@/app/utils/users'

/**
 * Game services, common to every game mode: they handle the database, the
 * players, the concurrency and the permissions, and delegate the rules to the
 * engine of the game's mode (see services/gameModes.ts).
 */

/** Tries to find an invitation code that is not in use before giving up. */
const MAX_CODE_ATTEMPTS = 10
/** The presence of a player (`game_players.lastSeenAt`) is written at most this often. */
const PRESENCE_WRITE_INTERVAL_MS = 10_000

/** The context of a request: one fixed "now", and the Street View finder only created if a mode needs it. */
function resolveContext(options: GameOptions = {}): GameContext {
  return {
    now: options.now?.() ?? new Date(),
    random: options.random ?? Math.random,
    get finder() {
      return options.finder ?? getPanoramaFinder()
    }
  }
}

function toPlayerView(player: GamePlayer): GamePlayerView {
  return {
    userId: player.userId,
    name: player.user ? getUserDisplayName(player.user) : 'Jugador',
    status: player.status,
    score: player.score,
    position: player.position,
    outcome: player.outcome
  }
}

/** What `userId` sees of a game: the common part plus the view built by the mode engine. */
function toGameView({ game, players }: LoadedGame, userId: number, ctx: GameContext): GameView {
  const engine = getGameModeEngine(game.mode)

  return {
    id: game.id,
    mode: game.mode,
    status: game.status,
    mapId: game.mapId,
    mapName: game.map?.name ?? null,
    code: game.code,
    hostUserId: game.hostUserId,
    version: game.version,
    players: players.map(toPlayerView),
    createdAt: game.createdAt.toISOString(),
    startedAt: game.startedAt ? game.startedAt.toISOString() : null,
    finishedAt: game.finishedAt ? game.finishedAt.toISOString() : null,
    modeView: engine.toView(game.data, userId, { players, hostUserId: game.hostUserId }, ctx)
  }
}

/** Throws 404 unless the user is (or was) a player of the game: nobody else can see it. */
async function assertPlayer(gameId: number, userId: number): Promise<void> {
  const player = Number.isInteger(gameId)
    ? await GamePlayer.where('gameId', gameId).where('userId', userId).first()
    : null

  if (!player) {
    throw new ApiException('errors.gameNotFound', 404)
  }
}

/**
 * Records that the player is looking at the game (presence, used by the real
 * time modes to not wait for players who left). At most one write every
 * PRESENCE_WRITE_INTERVAL_MS; it does not change the game's version.
 */
async function touchPlayer(gameId: number, userId: number, now: Date): Promise<void> {
  await DB.table('game_players')
    .where('gameId', gameId)
    .where('userId', userId)
    .where('lastSeenAt', '<', new Date(now.getTime() - PRESENCE_WRITE_INTERVAL_MS))
    .update({ lastSeenAt: now })
}

/** Writes the game without changing its state, so that the players polling it see a change (e.g. someone joined). */
function bumpGame(gameId: number, ctx: GameContext, change?: (loaded: LoadedGame) => void): Promise<LoadedGame> {
  return updateGame(gameId, ctx, (_data, loaded) => {
    change?.(loaded)

    return true
  })
}

/** Id of the multiplayer game the user is waiting for or playing, if any (one at a time). */
export async function findActiveMultiplayerGameId(userId: number): Promise<number | null> {
  const rows = await GamePlayer.where('userId', userId).where('status', GamePlayerStatus.ACTIVE).select('gameId').get()
  const gameIds = rows.map((row) => row.gameId)

  if (gameIds.length === 0) {
    return null
  }

  const games = await Game.whereIn('id', gameIds)
    .whereIn('status', [GameStatus.LOBBY, GameStatus.IN_PROGRESS])
    .orderByDesc('id')
    .get()
  const active = games.find((game) => (findGameModeEngine(game.mode)?.definition.maxPlayers ?? 1) > 1)

  return active?.id ?? null
}

/** An invitation code no other game is using. */
async function generateUniqueCode(ctx: GameContext): Promise<string> {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
    const code = generateGameCode(ctx.random)

    if (!(await Game.where('code', code).first())) {
      return code
    }
  }

  throw new ApiException('errors.gameCreationFailed', 503)
}

/**
 * Creates a game in a map with one of the game modes. Single player games start
 * right away; multiplayer games wait for players (status LOBBY) with an
 * invitation code, and their creator is the host.
 */
export async function createGame(userId: number, input: CreateGameInput, options: GameOptions = {}): Promise<GameView> {
  const ctx = resolveContext(options)
  const engine = getGameModeEngine(input?.mode)
  const map = engine.definition.mapName
    ? await findMapByName(engine.definition.mapName)
    : await findMap(Number(input?.mapId))

  if (!map) {
    throw new ApiException('errors.mapNotFound', 404)
  }

  const multiplayer = engine.definition.maxPlayers > 1

  if (multiplayer && (await findActiveMultiplayerGameId(userId)) !== null) {
    throw new ApiException('errors.alreadyInMultiplayerGame', 409)
  }

  const mapId = map.id
  const settings = getGameSettings(engine, map, input?.settings)
  const data = await engine.create(mapId, settings, ctx)

  await cleanupGames(ctx)

  const game = new Game()

  game.mode = engine.definition.mode
  game.mapId = mapId
  game.status = multiplayer ? GameStatus.LOBBY : GameStatus.IN_PROGRESS
  game.code = multiplayer ? await generateUniqueCode(ctx) : null
  game.hostUserId = multiplayer ? userId : null
  game.version = 1
  game.createdAt = ctx.now
  game.startedAt = multiplayer ? null : ctx.now
  game.finishedAt = null
  game.updatedAt = ctx.now

  const player = new GamePlayer()

  player.userId = userId
  player.status = GamePlayerStatus.ACTIVE
  player.score = 0
  player.position = null
  player.outcome = null
  player.joinedAt = ctx.now
  player.lastSeenAt = ctx.now

  if (!multiplayer) {
    await engine.start(data, { players: [player], hostUserId: null }, ctx)
  }

  game.data = data

  await DB.transaction(async () => {
    await game.save()
    player.gameId = game.id
    await GamePlayer.insert([
      {
        gameId: game.id,
        userId,
        status: player.status,
        score: player.score,
        position: player.position,
        outcome: player.outcome,
        joinedAt: player.joinedAt,
        lastSeenAt: player.lastSeenAt
      }
    ])
  })

  return toGameView(await loadGame(game.id), userId, ctx)
}

/**
 * Current view of a game for one of its players. Applies first the changes
 * driven by time (e.g. a round whose time ran out). With `sinceVersion` (the
 * version the client already has) it answers `{ unchanged: true }` when
 * nothing changed — what makes polling cheap.
 */
export async function getGame(
  userId: number,
  input: GetGameInput,
  options: GameOptions = {}
): Promise<GameSyncResponse> {
  const ctx = resolveContext(options)
  const gameId = Number(input?.gameId)

  await assertPlayer(gameId, userId)
  await touchPlayer(gameId, userId, ctx.now)

  const loaded = await updateGame(gameId, ctx)

  if (input.sinceVersion != null && Number(input.sinceVersion) === loaded.game.version) {
    return { unchanged: true }
  }

  return { unchanged: false, game: toGameView(loaded, userId, ctx) }
}

/** Applies an action of a player (e.g. a guess) through the engine of the game's mode. */
export async function sendGameAction(
  userId: number,
  input: GameActionInput,
  options: GameOptions = {}
): Promise<GameView> {
  const ctx = resolveContext(options)
  const gameId = Number(input?.gameId)
  const action = input?.action

  if (!action || typeof action !== 'object' || typeof action.type !== 'string') {
    throw new ApiException('errors.invalidAction')
  }

  await assertPlayer(gameId, userId)
  await touchPlayer(gameId, userId, ctx.now)

  const loaded = await updateGame(gameId, ctx, (data, { game, players }, engine) => {
    if (game.status === GameStatus.FINISHED) {
      throw new ApiException('errors.gameAlreadyOver')
    }

    if (game.status !== GameStatus.IN_PROGRESS) {
      throw new ApiException('errors.gameNotStarted')
    }

    return engine.handleAction(data, userId, action, { players, hostUserId: game.hostUserId }, ctx)
  })

  return toGameView(loaded, userId, ctx)
}

/**
 * Joins a multiplayer game waiting for players, by its invitation code. A
 * player of the game just gets it back. Rejected when the game already
 * started, is full, or the player is in another multiplayer game.
 */
export async function joinGame(userId: number, input: JoinGameInput, options: GameOptions = {}): Promise<GameView> {
  const ctx = resolveContext(options)
  const code = normalizeGameCode(input?.code)
  const game = code ? await Game.where('code', code).first() : null

  if (!game) {
    throw new ApiException('errors.gameCodeNotFound', 404)
  }

  const current = await GamePlayer.where('gameId', game.id).where('userId', userId).first()

  if (current?.status === GamePlayerStatus.ACTIVE) {
    return toGameView(await loadGame(game.id), userId, ctx)
  }

  if (game.status !== GameStatus.LOBBY) {
    throw new ApiException('errors.gameAlreadyStartedJoin', 409)
  }

  const engine = getGameModeEngine(game.mode)
  const maxPlayers = engine.getMaxPlayers(game.data)
  const countPlayers = () => GamePlayer.where('gameId', game.id).where('status', GamePlayerStatus.ACTIVE).count()

  if ((await findActiveMultiplayerGameId(userId)) !== null) {
    throw new ApiException('errors.alreadyInMultiplayerGame', 409)
  }

  if ((await countPlayers()) >= maxPlayers) {
    throw new ApiException('errors.gameFull', 409)
  }

  await GamePlayer.insert([
    {
      gameId: game.id,
      userId,
      status: GamePlayerStatus.ACTIVE,
      score: 0,
      position: null,
      outcome: null,
      joinedAt: ctx.now,
      lastSeenAt: ctx.now
    }
  ])

  // Two players may have joined the last free place at the same time: the one who counted too many leaves.
  if ((await countPlayers()) > maxPlayers) {
    await DB.table('game_players').where('gameId', game.id).where('userId', userId).delete()

    throw new ApiException('errors.gameFull', 409)
  }

  return toGameView(await bumpGame(game.id, ctx), userId, ctx)
}

/**
 * Leaves a multiplayer game. Before it starts the player is removed; once
 * started it stays in the results (with the points it made) but is not
 * waited for anymore. The host role passes to the player who joined first;
 * a game left without players is deleted (not started) or finished.
 */
export async function leaveGame(userId: number, input: GameIdInput, options: GameOptions = {}): Promise<void> {
  const ctx = resolveContext(options)
  const gameId = Number(input?.gameId)

  await assertPlayer(gameId, userId)

  const { game, players } = await loadGame(gameId)

  if (getGameModeEngine(game.mode).definition.maxPlayers === 1) {
    throw new ApiException('errors.gameCannotBeAbandoned')
  }

  if (game.status === GameStatus.FINISHED) {
    throw new ApiException('errors.gameAlreadyOver')
  }

  if (game.status === GameStatus.LOBBY) {
    await DB.table('game_players').where('gameId', gameId).where('userId', userId).delete()
  } else {
    await DB.table('game_players')
      .where('gameId', gameId)
      .where('userId', userId)
      .update({ status: GamePlayerStatus.LEFT })
  }

  const remaining = players.filter((player) => player.userId !== userId && player.status === GamePlayerStatus.ACTIVE)

  if (remaining.length === 0) {
    if (game.status === GameStatus.LOBBY) {
      await deleteGames([gameId])
    } else {
      await updateGame(gameId, ctx, undefined, { finish: true })
    }

    return
  }

  await bumpGame(gameId, ctx, (loaded) => {
    if (loaded.game.hostUserId === userId) {
      loaded.game.hostUserId = remaining[0].userId
    }
  })
}

/** The host removes a player from a game that did not start yet. */
export async function kickPlayer(userId: number, input: KickPlayerInput, options: GameOptions = {}): Promise<GameView> {
  const ctx = resolveContext(options)
  const gameId = Number(input?.gameId)
  const targetUserId = Number(input?.userId)

  await assertPlayer(gameId, userId)

  const { game } = await loadGame(gameId)

  if (game.hostUserId !== userId) {
    throw new ApiException('errors.onlyHostCanKick', 403)
  }

  if (game.status !== GameStatus.LOBBY) {
    throw new ApiException('errors.kickOnlyBeforeStart')
  }

  if (targetUserId === userId) {
    throw new ApiException('errors.cannotKickYourself')
  }

  const removed = await DB.table('game_players').where('gameId', gameId).where('userId', targetUserId).delete()

  if (removed === 0) {
    throw new ApiException('errors.playerNotInGame', 404)
  }

  return toGameView(await bumpGame(gameId, ctx), userId, ctx)
}

/** The host starts a multiplayer game: its rounds are chosen and the first one begins for everybody. */
export async function startGame(userId: number, input: GameIdInput, options: GameOptions = {}): Promise<GameView> {
  const ctx = resolveContext(options)
  const gameId = Number(input?.gameId)

  await assertPlayer(gameId, userId)

  const loaded = await updateGame(gameId, ctx, async (data, { game, players }, engine) => {
    if (game.status !== GameStatus.LOBBY) {
      throw new ApiException('errors.gameAlreadyStarted')
    }

    if (game.hostUserId !== userId) {
      throw new ApiException('errors.onlyHostCanStart', 403)
    }

    const { minPlayers } = engine.definition

    if (players.filter((player) => player.status === GamePlayerStatus.ACTIVE).length < minPlayers) {
      throw new ApiException('errors.notEnoughPlayers', 400, { minPlayers })
    }

    await engine.start(data, { players, hostUserId: game.hostUserId }, ctx)
    game.status = GameStatus.IN_PROGRESS
    game.startedAt = ctx.now

    return true
  })

  return toGameView(loaded, userId, ctx)
}

/** The multiplayer game the user is waiting for or playing, if any (to get back to it from the menu). */
export async function getActiveGame(userId: number, options: GameOptions = {}): Promise<GameView | null> {
  const ctx = resolveContext(options)
  const gameId = await findActiveMultiplayerGameId(userId)

  return gameId !== null ? toGameView(await updateGame(gameId, ctx), userId, ctx) : null
}

/**
 * Cleans up the games that are not needed anymore: lobbies nobody started,
 * abandoned games and games older than the retention period (scheduled job; it
 * also runs every time a game is created). Returns how many games were cleaned up.
 */
export async function cleanupExpiredGames(options: GameOptions = {}): Promise<number> {
  return cleanupGames(resolveContext(options))
}

/** Games of the user (any mode), newest first, `limit` at a time. */
export async function getGames(userId: number, offset = 0, limit = 20): Promise<GamesPage> {
  const safeLimit = Math.min(Math.max(1, Math.floor(limit) || 20), 50)
  const safeOffset = Math.max(0, Math.floor(offset) || 0)
  // One extra row tells whether there is another page.
  const rows = await GamePlayer.where('userId', userId)
    .orderByDesc('gameId')
    .offset(safeOffset)
    .limit(safeLimit + 1)
    .get()
  const page = rows.slice(0, safeLimit)
  const gameIds = page.map((row) => row.gameId)
  const games = gameIds.length > 0 ? await Game.whereIn('id', gameIds).with('map').get() : []
  const participants = gameIds.length > 0 ? await GamePlayer.whereIn('gameId', gameIds).select('gameId').get() : []
  const items = page.flatMap((row): GameListItem[] => {
    const game = games.find((candidate) => candidate.id === row.gameId)
    const engine = game ? findGameModeEngine(game.mode) : null

    if (!game || !engine) {
      return []
    }

    const summary = engine.summarize(game.data, userId)

    return [
      {
        id: game.id,
        mode: game.mode,
        mapId: game.mapId,
        mapName: game.map?.name ?? null,
        status: game.status,
        playersCount: participants.filter((participant) => participant.gameId === game.id).length,
        score: game.status === GameStatus.FINISHED ? row.score : summary.score,
        maxScore: summary.maxScore,
        position: row.position,
        outcome: row.outcome,
        completedSteps: summary.completedSteps,
        totalSteps: summary.totalSteps,
        createdAt: game.createdAt.toISOString()
      }
    ]
  })

  return { items, hasMore: rows.length > safeLimit }
}

/** Aggregated stats over the finished games of the user in a mode (games screen). */
export async function getPlayerStats(userId: number, mode: GameMode = GameMode.CLASSIC): Promise<PlayerStats> {
  const rows = await GamePlayer.where('userId', userId).get()
  const gameIds = rows.map((row) => row.gameId)
  const finished =
    gameIds.length > 0
      ? await Game.whereIn('id', gameIds).where('status', GameStatus.FINISHED).where('mode', mode).select('id').get()
      : []
  const finishedIds = new Set(finished.map((game) => game.id))
  const scores = rows.filter((row) => finishedIds.has(row.gameId)).map((row) => row.score)

  return {
    gamesPlayed: scores.length,
    bestScore: scores.length > 0 ? Math.max(...scores) : 0,
    averageScore: scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0
  }
}
