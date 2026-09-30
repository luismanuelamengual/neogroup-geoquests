import { DB } from '@neogroup/neorm'
import { beforeEach, describe, expect, it } from 'vitest'
import { ClassicGameData } from '@/app/(protected)/(game)/models/ClassicGameData'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { MAX_UPDATE_ATTEMPTS, updateGame } from '@/app/(protected)/(game)/services/gamePersistence'
import { createGame } from '@/app/(protected)/(game)/services/games'
import { getMaps } from '@/app/(protected)/(game)/services/maps'
import { createUser, resetDatabase } from '@/tests/setup/database'
import { FakePanoramaFinder } from '@/tests/setup/fakeFinder'

describe('game persistence (optimistic locking)', () => {
  const context = { now: new Date(), random: Math.random, finder: new FakePanoramaFinder() }
  let gameId: number

  beforeEach(async () => {
    await resetDatabase()

    const userId = await createUser()
    const mapId = (await getMaps())[0].id

    gameId = (await createGame(userId, { mapId, mode: GameMode.CLASSIC }, { finder: new FakePanoramaFinder() })).id
  })

  /** Simulates another request writing the game in the middle of ours. */
  async function concurrentWrite(): Promise<void> {
    const row = (await DB.table('games').where('id', gameId).first())!

    await DB.table('games')
      .where('id', gameId)
      .update({ version: Number(row.version) + 1 })
  }

  it('does not write (nor move the version) when nothing changed', async () => {
    const { game } = await updateGame(gameId, context, () => false)

    expect(game.version).toBe(1)
  })

  it('applies the change again on the fresh state when another request wrote first', async () => {
    let attempts = 0
    const { game } = await updateGame(gameId, context, async (data) => {
      attempts++

      if (attempts === 1) {
        await concurrentWrite()
      }

      ;(data as ClassicGameData).roundStartedAt = context.now.toISOString()

      return true
    })

    expect(attempts).toBe(2)
    // Version 1 → 2 by the concurrent write → 3 by ours.
    expect(game.version).toBe(3)
    expect((game.data as ClassicGameData).roundStartedAt).toBe(context.now.toISOString())
  })

  it('gives up after too many concurrent writes', async () => {
    let attempts = 0

    await expect(
      updateGame(gameId, context, async () => {
        attempts++
        await concurrentWrite()

        return true
      })
    ).rejects.toThrow('Hay mucha actividad')
    expect(attempts).toBe(MAX_UPDATE_ATTEMPTS)
  })

  it('does not write anything when the change is rejected', async () => {
    await expect(
      updateGame(gameId, context, (data) => {
        ;(data as ClassicGameData).currentRound = 99

        throw new Error('invalid')
      })
    ).rejects.toThrow('invalid')

    const { game } = await updateGame(gameId, context)

    expect(game.version).toBe(1)
    expect((game.data as ClassicGameData).currentRound).toBe(1)
  })

  it('finishes a game on demand, storing the results of its players', async () => {
    const { game, players } = await updateGame(gameId, context, undefined, { finish: true })

    expect(game).toMatchObject({ status: GameStatus.FINISHED, code: null, version: 2 })
    expect(game.finishedAt).not.toBeNull()
    expect(players[0]).toMatchObject({ score: 0, position: 1 })
  })
})
