import { DB } from '@neogroup/neorm'
import { beforeEach, describe, expect, it } from 'vitest'
import { ClassicGameData } from '@/app/(protected)/(game)/models/ClassicGameData'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameView } from '@/app/(protected)/(game)/models/GameView'
import { PlayerProgress } from '@/app/(protected)/(game)/models/PlayerProgress'
import { UserAchievement } from '@/app/(protected)/(game)/models/UserAchievement'
import { getAchievements } from '@/app/(protected)/(game)/services/achievements'
import { createGame, sendGameAction } from '@/app/(protected)/(game)/services/games'
import { getMaps } from '@/app/(protected)/(game)/services/maps'
import { backfillAchievements } from '@/database/migrations/007-achievements'
import { createUser, resetDatabase } from '@/tests/setup/database'
import { FakePanoramaFinder } from '@/tests/setup/fakeFinder'

const ATLANTIC = { latitude: 0, longitude: -30 }

describe('achievements', () => {
  let userId: number
  let mapId: number

  beforeEach(async () => {
    await resetDatabase()
    userId = await createUser()
    mapId = (await getMaps()).find((map) => map.slug === 'famous-cities')!.id
  })

  /** Plays a whole classic game at `at`: right on every location, or in the middle of the ocean. */
  async function playGame(at: string, exact = true): Promise<GameView> {
    const now = () => new Date(at)
    let game = await createGame(userId, { mapId, mode: GameMode.CLASSIC }, { finder: new FakePanoramaFinder(), now })
    const rounds = ((await Game.find(game.id))!.data as ClassicGameData).rounds

    for (const [index, round] of rounds.entries()) {
      await sendGameAction(userId, { gameId: game.id, action: { type: 'startRound' } }, { now })
      game = await sendGameAction(
        userId,
        {
          gameId: game.id,
          action: {
            type: 'guess',
            roundNumber: index + 1,
            ...(exact ? { latitude: round.latitude, longitude: round.longitude } : ATLANTIC)
          }
        },
        { now }
      )
    }

    return game
  }

  it('wins each medal once, in the game it was earned', async () => {
    const first = await playGame('2026-03-01T12:00:00Z')
    const second = await playGame('2026-03-01T13:00:00Z')

    expect(first.achievements).toEqual(['firstTrip', 'eagleEye', 'bullseye', 'starGame.1', 'starGame.2'])
    expect(second.achievements).toEqual([])
    expect(await UserAchievement.where('userId', userId).count()).toBe(5)
    expect((await UserAchievement.where('userId', userId).where('key', 'eagleEye').first())!.gameId).toBe(first.id)
    // Asking for the game again does not give them again.
    await sendGameAction(userId, { gameId: first.id, action: { type: 'startRound' } }).catch(() => null)
    expect(await UserAchievement.where('userId', userId).count()).toBe(5)
  })

  it('shows every medal, won or not, with how far the player is from the ones gathered over time', async () => {
    await playGame('2026-03-01T12:00:00Z', false)

    const medals = await getAchievements(userId)
    const medal = (key: string) => medals.find((candidate) => candidate.key === key)!

    expect(medals).toHaveLength(23)
    expect(medal('firstTrip').unlockedAt).toBe('2026-03-01T12:00:00.000Z')
    expect(medal('eagleEye')).toMatchObject({ icon: '🦅', tier: null, target: null, value: null, unlockedAt: null })
    expect(medal('againstTheClock.2')).toMatchObject({ tier: 2, tierName: 'gold', target: 6, value: null })
    expect(medal('frequentTraveler.2')).toMatchObject({ tierName: 'silver' })
    expect(medal('frequentTraveler.1')).toMatchObject({ tier: 1, target: 10, value: 1, unlockedAt: null })
    expect(medal('frequentTraveler.3')).toMatchObject({ tier: 3, target: 500, value: 1 })
    expect(medal('globetrotter')).toMatchObject({ tier: null, target: (await getMaps()).length, value: 1 })
  })

  it('gives the players that already played the medals of their counters, and their XP', async () => {
    await playGame('2026-03-01T12:00:00Z', false)
    await DB.table('user_achievements').delete()
    await DB.table('player_progress')
      .where('userId', userId)
      .update({ gamesPlayed: 10, bestStreak: 7, mapsPlayed: null, xp: 1000 })

    await backfillAchievements()

    const keys = (await UserAchievement.where('userId', userId).get()).map((medal) => medal.key).sort()
    const progress = await PlayerProgress.where('userId', userId).first()

    expect(keys).toEqual(['firstTrip', 'frequentTraveler.1', 'steady.1'])
    expect(progress!.mapsPlayed).toEqual(['famous-cities'])
    expect(progress!.xp).toBe(1000 + 3 * 50)
  })
})
