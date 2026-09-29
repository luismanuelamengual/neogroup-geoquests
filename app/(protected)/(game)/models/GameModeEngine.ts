import { GameAction } from '@/app/(protected)/(game)/models/GameAction'
import { GameContext } from '@/app/(protected)/(game)/models/GameContext'
import { GameMembers } from '@/app/(protected)/(game)/models/GameMembers'
import { GameModeDefinition } from '@/app/(protected)/(game)/models/GameModeDefinition'
import { GamePlayerResult } from '@/app/(protected)/(game)/models/GamePlayerResult'
import { GameSummary } from '@/app/(protected)/(game)/models/GameSummary'

/**
 * The rules of a game mode. The generic game services (services/games.ts)
 * handle the database, the players and the concurrency; the engine only works
 * on the mode's own state (`games.data`).
 *
 * The methods that receive `data` may modify it: they always get a working
 * copy, which is only saved when the whole operation succeeds (see
 * services/gamePersistence.ts). They report whether they changed something so
 * that nothing is written — and the version does not move — when nothing did.
 * Invalid actions are rejected by throwing an ApiException.
 */
export interface GameModeEngine<Data = unknown, Settings = unknown, View = unknown> {
  readonly definition: GameModeDefinition<Settings>

  /** Settings of a new game: the quest's settings over the defaults of the mode, validated. */
  resolveSettings(questSettings: Record<string, unknown>): Settings

  /** Initial state of a new game (single player games: ready to play; multiplayer: waiting for players). */
  create(questId: number | null, settings: Settings, ctx: GameContext): Promise<Data>

  /** Most players the game accepts (its settings may allow fewer than the mode). */
  getMaxPlayers(data: Data): number

  /** The game starts (single player games: right after being created; multiplayer: when the host starts it). */
  start(data: Data, members: GameMembers, ctx: GameContext): Promise<void>

  /** Changes driven by time (e.g. a round whose time ran out gets closed). Applied before every request. */
  advance(data: Data, members: GameMembers, ctx: GameContext): boolean

  /** Applies an action of a player. Throws an ApiException when it is not valid. */
  handleAction(data: Data, userId: number, action: GameAction, members: GameMembers, ctx: GameContext): boolean

  isFinished(data: Data): boolean

  /** Final score, position and outcome of every player (called once, when the game ends). */
  finalize(data: Data, members: GameMembers): GamePlayerResult[]

  /** What `userId` is allowed to see: never an answer before it can be revealed. */
  toView(data: Data, userId: number, members: GameMembers, ctx: GameContext): View

  /** Score and progress of `userId` (history list). */
  summarize(data: Data, userId: number): GameSummary
}
