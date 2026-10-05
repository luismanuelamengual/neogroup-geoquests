import { beforeEach, describe, expect, it } from 'vitest'
import { ClassicGameData } from '@/app/(protected)/(game)/models/ClassicGameData'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameSettingsInput } from '@/app/(protected)/(game)/models/GameSettingsInput'
import { getGameModes } from '@/app/(protected)/(game)/services/gameModes'
import { createGame } from '@/app/(protected)/(game)/services/games'
import { getMaps } from '@/app/(protected)/(game)/services/maps'
import { getQuickPlays, QUICK_PLAY_SETTINGS } from '@/app/(protected)/(game)/services/quickPlays'
import { getModeColor, isMultiplayerMode } from '@/app/(protected)/(game)/utils/modeColor'
import { getModeMenuPath, getModePath } from '@/app/(protected)/(game)/utils/modeRoutes'
import { createUser, resetDatabase } from '@/tests/setup/database'
import { FakePanoramaFinder } from '@/tests/setup/fakeFinder'

/** Settings stored with a game. */
async function storedSettings(gameId: number): Promise<Record<string, unknown>> {
  return ((await Game.find(gameId))!.data as { settings: Record<string, unknown> }).settings
}

describe('rules chosen by the player', () => {
  let userId: number
  let mapId: number

  beforeEach(async () => {
    await resetDatabase()
    userId = await createUser()
    mapId = (await getMaps())[0].id
  })

  function create(mode: GameMode, settings?: GameSettingsInput) {
    return createGame(userId, { mapId, mode, settings }, { finder: new FakePanoramaFinder() })
  }

  it('offers the configurable rules of every mode', () => {
    const modes = getGameModes()
    const configurable = Object.fromEntries(modes.map((mode) => [mode.mode, mode.configurable]))

    expect(configurable[GameMode.CLASSIC]).toEqual({
      rounds: [3, 5, 10],
      timeLimitSeconds: [30, 60, 120, 180, 300, null]
    })
    expect(configurable[GameMode.CLASSIC_MULTIPLAYER]).toEqual({
      rounds: [3, 5, 10],
      timeLimitSeconds: [30, 60, 120, 180, 300]
    })
    expect(configurable[GameMode.BATTLE_ROYALE]).toEqual({ timeLimitSeconds: [30, 60, 120, 180, 300] })
  })

  it('creates a classic game with the chosen rounds and time limit', async () => {
    const game = await create(GameMode.CLASSIC, { rounds: 3, timeLimitSeconds: 60 })
    const data = (await Game.find(game.id))!.data as ClassicGameData

    expect(data.settings).toMatchObject({ rounds: 3, timeLimitSeconds: 60 })
    expect(data.rounds).toHaveLength(3)
    expect(game.modeView).toMatchObject({ roundsCount: 3, timeLimitSeconds: 60 })
  })

  it('lets a classic game have no time limit', async () => {
    const game = await create(GameMode.CLASSIC, { rounds: 10, timeLimitSeconds: null })

    expect(await storedSettings(game.id)).toMatchObject({ rounds: 10, timeLimitSeconds: null })
  })

  it('keeps the defaults of the mode when nothing is chosen', async () => {
    const game = await create(GameMode.CLASSIC)

    expect(await storedSettings(game.id)).toMatchObject({ rounds: 5, timeLimitSeconds: 180 })
  })

  it('ignores values that are not allowed', async () => {
    const game = await create(GameMode.CLASSIC, { rounds: 999, timeLimitSeconds: 7 })

    expect(await storedSettings(game.id)).toMatchObject({ rounds: 5, timeLimitSeconds: 180 })
  })

  it('creates a multiplayer game with the chosen rules', async () => {
    const game = await create(GameMode.CLASSIC_MULTIPLAYER, { rounds: 10, timeLimitSeconds: 30 })

    expect(await storedSettings(game.id)).toMatchObject({ rounds: 10, timeLimitSeconds: 30 })
    expect(game.modeView).toMatchObject({ roundsCount: 10, timeLimitSeconds: 30 })
  })

  it('does not let a multiplayer game have no time limit', async () => {
    const game = await create(GameMode.CLASSIC_MULTIPLAYER, { timeLimitSeconds: null })

    expect(await storedSettings(game.id)).toMatchObject({ timeLimitSeconds: 180 })
  })

  it('only lets a battle royale choose the time limit', async () => {
    const game = await create(GameMode.BATTLE_ROYALE, { rounds: 3, timeLimitSeconds: 120 })
    const settings = await storedSettings(game.id)

    expect(settings).toMatchObject({ timeLimitSeconds: 120 })
    expect(settings).not.toHaveProperty('rounds')
  })
})

describe('quick games', () => {
  beforeEach(async () => {
    await resetDatabase()
  })

  it('are classic games of 5 rounds of 3 minutes in their maps', async () => {
    const quickPlays = getQuickPlays(await getMaps())

    expect(quickPlays.map((quickPlay) => [quickPlay.key, quickPlay.map.slug])).toEqual([
      ['famous-cities', 'famous-cities'],
      ['world-cities', 'world-cities'],
      ['landmarks', 'landmarks']
    ])
    expect(quickPlays.every((quickPlay) => quickPlay.mode === GameMode.CLASSIC)).toBe(true)
    expect(QUICK_PLAY_SETTINGS).toEqual({ rounds: 5, timeLimitSeconds: 180 })
  })

  it('are hidden when their map is not available', async () => {
    const maps = (await getMaps()).filter((map) => map.slug !== 'landmarks')

    expect(getQuickPlays(maps).map((quickPlay) => quickPlay.key)).toEqual(['famous-cities', 'world-cities'])
  })

  it('start a game with their rules', async () => {
    const userId = await createUser()
    const [quickPlay] = getQuickPlays(await getMaps())
    const game = await createGame(
      userId,
      { mapId: quickPlay.map.id, mode: quickPlay.mode, settings: quickPlay.settings },
      { finder: new FakePanoramaFinder() }
    )

    expect(game.mapId).toBe(quickPlay.map.id)
    expect(await storedSettings(game.id)).toMatchObject({ rounds: 5, timeLimitSeconds: 180 })
  })
})

describe('mode colors', () => {
  it('are gold for single player modes and cyan for multiplayer ones', () => {
    expect(getModeColor(GameMode.CLASSIC)).toBe('gold')
    expect(getModeColor(GameMode.CLASSIC_MULTIPLAYER)).toBe('cyan')
    expect(getModeColor(GameMode.BATTLE_ROYALE)).toBe('cyan')
    expect(getModeColor(null)).toBe('gold')
    expect(isMultiplayerMode(GameMode.CLASSIC)).toBe(false)
    expect(isMultiplayerMode(GameMode.BATTLE_ROYALE)).toBe(true)
  })
})

describe('mode menus', () => {
  it('put single player modes in "Jugar" and multiplayer ones in "Multijugador"', () => {
    const paths = Object.fromEntries(
      getGameModes().map((mode) => [mode.mode, [getModeMenuPath(mode), getModePath(mode)]])
    )

    expect(paths[GameMode.CLASSIC]).toEqual(['/play', '/play/classic'])
    expect(paths[GameMode.CLASSIC_MULTIPLAYER]).toEqual(['/multiplayer', '/multiplayer/friends'])
    expect(paths[GameMode.BATTLE_ROYALE]).toEqual(['/multiplayer', '/multiplayer/battle-royale'])
  })
})
