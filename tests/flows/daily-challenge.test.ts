import { DB } from '@neogroup/neorm'
import { beforeEach, describe, expect, it } from 'vitest'
import { ClassicGameData } from '@/app/(protected)/(game)/models/ClassicGameData'
import { ClassicGameView } from '@/app/(protected)/(game)/models/ClassicGameView'
import { DailyChallenge } from '@/app/(protected)/(game)/models/DailyChallenge'
import { DailyResult } from '@/app/(protected)/(game)/models/DailyResult'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameOptions } from '@/app/(protected)/(game)/models/GameOptions'
import {
  DAILY_FIRST_DAY,
  DAILY_MAP_SLUGS,
  getDailyChallenge,
  getDailyLeaderboard,
  getDailyMapSlug,
  getDailyNumber,
  playDailyChallenge
} from '@/app/(protected)/(game)/services/dailyChallenges'
import { cleanupGames, GAME_RETENTION_MS } from '@/app/(protected)/(game)/services/gameCleanup'
import { getPlayerStats, leaveGame, sendGameAction } from '@/app/(protected)/(game)/services/games'
import { createUser, resetDatabase } from '@/tests/setup/database'
import { FakePanoramaFinder } from '@/tests/setup/fakeFinder'

const DAY = '2026-03-10'
const NOON = `${DAY}T12:00:00Z`

describe('daily challenge', () => {
  let alice: number
  let bob: number

  beforeEach(async () => {
    await resetDatabase()
    alice = await createUser('alice@geoquests.test')
    bob = await createUser('bob@geoquests.test')
  })

  function at(date: string): GameOptions {
    return { finder: new FakePanoramaFinder(), now: () => new Date(date) }
  }

  /** Plays the player's attempt to the end: `offsetDegrees` away from every location (0: right on it). */
  async function playToTheEnd(userId: number, offsetDegrees: number, date = NOON) {
    const options = at(date)
    let game = await playDailyChallenge(userId, options)
    const rounds = ((await Game.find(game.id))!.data as ClassicGameData).rounds

    for (const [index, round] of rounds.entries()) {
      await sendGameAction(userId, { gameId: game.id, action: { type: 'startRound' } }, options)
      game = await sendGameAction(
        userId,
        {
          gameId: game.id,
          action: {
            type: 'guess',
            roundNumber: index + 1,
            latitude: round.latitude + offsetDegrees,
            longitude: round.longitude
          }
        },
        options
      )
    }

    return game
  }

  it('numbers the challenges and takes turns with the maps', () => {
    expect(getDailyNumber(DAILY_FIRST_DAY)).toBe(1)
    expect(getDailyNumber('2026-10-31')).toBe(11)
    expect(getDailyMapSlug(DAILY_FIRST_DAY)).toBe(DAILY_MAP_SLUGS[0])
    expect(getDailyMapSlug('2026-10-22')).toBe(DAILY_MAP_SLUGS[1])
    expect(getDailyMapSlug('2026-10-24')).toBe(DAILY_MAP_SLUGS[0])
    // Days before the first one also have a map.
    expect(DAILY_MAP_SLUGS).toContain(getDailyMapSlug('2026-01-01'))
  })

  it('is available until the player plays it', async () => {
    const view = await getDailyChallenge(alice, at(NOON))

    expect(view).toMatchObject({
      day: DAY,
      number: getDailyNumber(DAY),
      mapSlug: getDailyMapSlug(DAY),
      roundsCount: 5,
      timeLimitSeconds: 180,
      status: 'available',
      gameId: null,
      score: null,
      rank: null,
      nextChallengeAt: '2026-03-11T00:00:00.000Z'
    })
    // Only looking at it does not create it.
    expect(await DailyChallenge.count()).toBe(0)
  })

  it('gives every player the same rounds, in a classic game of the challenge', async () => {
    const aliceGame = await playDailyChallenge(alice, at(NOON))
    const bobGame = await playDailyChallenge(bob, at(`${DAY}T18:00:00Z`))
    const roundsOf = async (gameId: number) => ((await Game.find(gameId))!.data as ClassicGameData).rounds

    expect(aliceGame.mode).toBe(GameMode.CLASSIC)
    expect(aliceGame.dailyChallengeId).not.toBeNull()
    expect(bobGame.dailyChallengeId).toBe(aliceGame.dailyChallengeId)
    expect(aliceGame.id).not.toBe(bobGame.id)
    expect(await roundsOf(bobGame.id)).toEqual(await roundsOf(aliceGame.id))
    expect(await DailyChallenge.count()).toBe(1)
    expect((aliceGame.modeView as ClassicGameView).roundsCount).toBe(5)
  })

  it('has a single attempt per player: resumed while in progress, rejected once finished', async () => {
    const started = await playDailyChallenge(alice, at(NOON))

    expect(await getDailyChallenge(alice, at(NOON))).toMatchObject({ status: 'inProgress', gameId: started.id })
    expect((await playDailyChallenge(alice, at(NOON))).id).toBe(started.id)

    const finished = await playToTheEnd(alice, 0)
    const score = (finished.modeView as ClassicGameView).totalScore

    expect(await getDailyChallenge(alice, at(NOON))).toMatchObject({
      status: 'finished',
      gameId: started.id,
      score,
      rank: { position: 1, total: 1, topPercent: 100 }
    })
    await expect(playDailyChallenge(alice, at(NOON))).rejects.toThrow('Ya usaste tu intento')
  })

  it('uses the attempt when the player leaves the game', async () => {
    const game = await playDailyChallenge(alice, at(NOON))

    await leaveGame(alice, { gameId: game.id }, at(NOON))

    expect(await getDailyChallenge(alice, at(NOON))).toMatchObject({ status: 'forfeited', gameId: null })
    await expect(playDailyChallenge(alice, at(NOON))).rejects.toThrow('Ya usaste tu intento')
  })

  it('gives the XP of a classic game plus the bonus of the challenge', async () => {
    const game = await playToTheEnd(alice, 0)

    // Finishing it (20), 25,000 points (250), the challenge (50), the first game of the day (30) and 6 medals (300).
    expect((game.modeView as ClassicGameView).totalScore).toBe(25000)
    expect(game.achievements).toEqual(['firstTrip', 'eagleEye', 'bullseye', 'starGame.1', 'starGame.2', 'earlyBird'])
    expect(game.xp).toEqual({ earned: 650, total: 650 })
  })

  it('ranks the players of the day (equal scores share the place)', async () => {
    const carol = await createUser('carol@geoquests.test')

    await playToTheEnd(alice, 0)
    await playToTheEnd(bob, 2)
    await playToTheEnd(carol, 0)

    const board = await getDailyLeaderboard(bob, {}, at(NOON))

    expect(board).toMatchObject({ number: getDailyNumber(DAY), day: DAY, mapSlug: getDailyMapSlug(DAY) })
    expect(board.top.map((entry) => entry.position)).toEqual([1, 1, 3])
    expect(board.top[2]).toMatchObject({ isMe: true })
    expect(board.me).toMatchObject({ position: 3, total: 3, topPercent: 100 })
    expect((await getDailyChallenge(alice, at(NOON))).rank).toEqual({ position: 1, total: 3, topPercent: 34 })
  })

  it('changes every day and keeps the ranking after the games are deleted', async () => {
    const first = await playToTheEnd(alice, 0)
    // The next day there is a new challenge, in the next map.
    const tomorrow = '2026-03-11T00:30:00Z'

    expect(await getDailyChallenge(alice, at(tomorrow))).toMatchObject({
      status: 'available',
      mapSlug: getDailyMapSlug('2026-03-11')
    })

    const second = await playDailyChallenge(alice, at(tomorrow))

    expect(second.dailyChallengeId).not.toBe(first.dailyChallengeId)

    await cleanupGames({
      now: new Date(new Date(NOON).getTime() + GAME_RETENTION_MS + 1000),
      random: Math.random,
      finder: new FakePanoramaFinder()
    })

    expect(await Game.find(first.id)).toBeNull()

    const board = await getDailyLeaderboard(alice, { challengeId: first.dailyChallengeId }, at(tomorrow))

    expect(board.me).toMatchObject({ position: 1, total: 1, score: (first.modeView as ClassicGameView).totalScore })
  })

  it('changes at the midnight of the player (its time zone, like the streak)', async () => {
    await DB.table('users').where('id', alice).update({ timeZone: 'America/Argentina/Buenos_Aires' })
    // 21:05 of the 10th in Buenos Aires (UTC-3): already the 11th in UTC.
    const evening = '2026-03-11T00:05:00Z'

    expect(await getDailyChallenge(alice, at(evening))).toMatchObject({
      day: DAY,
      nextChallengeAt: '2026-03-11T03:00:00.000Z'
    })
    expect(await getDailyChallenge(bob, at(evening))).toMatchObject({ day: '2026-03-11' })

    const game = await playToTheEnd(alice, 0, evening)
    const challenge = await DailyChallenge.find(game.dailyChallengeId!)

    expect(challenge!.day).toBe(DAY)
    expect((await getDailyLeaderboard(alice, {}, at(evening))).isToday).toBe(true)
    expect((await getDailyLeaderboard(bob, { day: DAY }, at(evening))).isToday).toBe(false)
    // The streak counts the same day.
    expect((await getPlayerStats(alice, at(evening))).playedToday).toBe(true)
  })

  it('browses the rankings of the days before, up to today', async () => {
    await playToTheEnd(alice, 0, '2026-03-08T12:00:00Z')
    await playToTheEnd(alice, 0, NOON)

    // Today nobody played yet: an empty ranking, the previous one is the last day with a challenge.
    const today = await getDailyLeaderboard(bob, {}, at('2026-03-12T12:00:00Z'))

    expect(today).toMatchObject({
      challengeId: null,
      day: '2026-03-12',
      isToday: true,
      top: [],
      me: null,
      previousDay: DAY,
      nextDay: null
    })

    const previous = await getDailyLeaderboard(bob, { day: DAY }, at('2026-03-12T12:00:00Z'))

    expect(previous).toMatchObject({ day: DAY, isToday: false, previousDay: '2026-03-08', nextDay: '2026-03-12' })
    expect(previous.top).toHaveLength(1)

    const first = await getDailyLeaderboard(bob, { day: '2026-03-08' }, at('2026-03-12T12:00:00Z'))

    expect(first).toMatchObject({ previousDay: null, nextDay: DAY })
    // A day after today (or not a day) is today's.
    expect((await getDailyLeaderboard(bob, { day: '2026-04-01' }, at('2026-03-12T12:00:00Z'))).day).toBe('2026-03-12')
    expect((await getDailyLeaderboard(bob, { day: 'yesterday' }, at('2026-03-12T12:00:00Z'))).day).toBe('2026-03-12')
  })

  it('deletes the challenges of more than 7 days ago with their ranking', async () => {
    await playToTheEnd(alice, 0, '2026-03-03T12:00:00Z')
    await playToTheEnd(alice, 0, '2026-03-04T12:00:00Z')

    const options = { now: new Date('2026-03-11T08:00:00Z'), random: Math.random, finder: new FakePanoramaFinder() }

    await cleanupGames(options)

    // The 3rd is 8 days old: deleted. The 4th (7 days) stays.
    expect((await DailyChallenge.get()).map((challenge) => challenge.day)).toEqual(['2026-03-04'])
    expect(await DailyResult.count()).toBe(1)

    const board = await getDailyLeaderboard(alice, { day: '2026-03-04' }, at('2026-03-11T08:00:00Z'))

    expect(board.previousDay).toBeNull()
    expect(board.top).toHaveLength(1)
  })

  it('does not count an attempt whose game could not be created', async () => {
    await expect(playDailyChallenge(alice, { ...at(NOON), finder: new FakePanoramaFinder('empty') })).rejects.toThrow()
    expect((await getDailyChallenge(alice, at(NOON))).status).toBe('available')
  })
})
