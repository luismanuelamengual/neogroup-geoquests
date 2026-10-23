import { DB } from '@neogroup/neorm'
import { beforeEach, describe, expect, it } from 'vitest'
import { ClassicGameData } from '@/app/(protected)/(game)/models/ClassicGameData'
import { ClassicGameView } from '@/app/(protected)/(game)/models/ClassicGameView'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameView } from '@/app/(protected)/(game)/models/GameView'
import { PlayerProgress } from '@/app/(protected)/(game)/models/PlayerProgress'
import { cleanupGames, GAME_RETENTION_MS } from '@/app/(protected)/(game)/services/gameCleanup'
import { createGame, getPlayerStats, sendGameAction } from '@/app/(protected)/(game)/services/games'
import { getMaps } from '@/app/(protected)/(game)/services/maps'
import { getLevelProgress, XP_FIRST_LEVEL } from '@/app/(protected)/(game)/utils/xp'
import progressAndDaily from '@/database/migrations/003-player-progress-and-daily-challenges'
import { backfillXp } from '@/database/migrations/006-player-xp'
import { createUser, resetDatabase } from '@/tests/setup/database'
import { FakePanoramaFinder } from '@/tests/setup/fakeFinder'

const ATLANTIC = { latitude: 0, longitude: -30 }

describe('player progress', () => {
  let userId: number
  let mapId: number

  beforeEach(async () => {
    await resetDatabase()
    userId = await createUser()
    mapId = (await getMaps()).find((map) => map.slug === 'famous-cities')!.id
  })

  /** Plays a whole classic game at `at`: right on every location, or in the middle of the ocean. */
  async function playGame(at: string, exact = true, player = userId): Promise<GameView> {
    const now = () => new Date(at)
    const options = { finder: new FakePanoramaFinder(), now }
    let game = await createGame(player, { mapId, mode: GameMode.CLASSIC }, options)
    const rounds = ((await Game.find(game.id))!.data as ClassicGameData).rounds

    for (const [index, round] of rounds.entries()) {
      await sendGameAction(player, { gameId: game.id, action: { type: 'startRound' } }, { now })
      game = await sendGameAction(
        player,
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

  function stats(at: string) {
    return getPlayerStats(userId, { now: () => new Date(at) })
  }

  it('starts empty', async () => {
    expect(await stats('2026-03-01T12:00:00Z')).toEqual({
      gamesPlayed: 0,
      casesSolved: 0,
      bestScore: 0,
      averageScore: 0,
      currentStreak: 0,
      bestStreak: 0,
      streakFreezes: 0,
      playedToday: false,
      xp: 0,
      level: 1,
      rank: 'tourist',
      levelXp: 0,
      nextLevelXp: XP_FIRST_LEVEL
    })
  })

  it('adds every finished game once, and keeps it after the game is deleted', async () => {
    const good = await playGame('2026-03-01T12:00:00Z')
    const bad = await playGame('2026-03-01T13:00:00Z', false)
    const goodScore = (good.modeView as ClassicGameView).totalScore
    const badScore = (bad.modeView as ClassicGameView).totalScore

    // Asking for a finished game again does not count it again.
    await sendGameAction(userId, { gameId: good.id, action: { type: 'startRound' } }).catch(() => null)

    const expected = {
      gamesPlayed: 2,
      bestScore: goodScore,
      averageScore: Math.round((goodScore + badScore) / 2),
      currentStreak: 1,
      bestStreak: 1,
      playedToday: true
    }

    expect(await stats('2026-03-01T20:00:00Z')).toMatchObject(expected)

    // The games are deleted after the retention period: the progress stays.
    await cleanupGames({
      now: new Date(new Date('2026-03-01T13:00:00Z').getTime() + GAME_RETENTION_MS + 1000),
      random: Math.random,
      finder: new FakePanoramaFinder()
    })
    expect(await Game.whereIn('id', [good.id, bad.id]).count()).toBe(0)
    expect(await stats('2026-03-01T20:00:00Z')).toMatchObject({ gamesPlayed: 2, bestScore: goodScore })
  })

  it('counts a game not finished as nothing', async () => {
    await createGame(userId, { mapId, mode: GameMode.CLASSIC }, { finder: new FakePanoramaFinder() })

    expect((await stats('2026-03-01T20:00:00Z')).gamesPlayed).toBe(0)
  })

  it('counts the days in a row with a finished game', async () => {
    await playGame('2026-03-01T10:00:00Z')
    await playGame('2026-03-01T22:00:00Z')
    expect(await stats('2026-03-01T23:00:00Z')).toMatchObject({ currentStreak: 1, playedToday: true })

    await playGame('2026-03-02T09:00:00Z')
    await playGame('2026-03-03T09:00:00Z')
    expect(await stats('2026-03-03T10:00:00Z')).toMatchObject({ currentStreak: 3, bestStreak: 3 })
    // The next day it is still alive (it can be extended) but not played yet.
    expect(await stats('2026-03-04T10:00:00Z')).toMatchObject({ currentStreak: 3, playedToday: false })
    // Two days later, without freezes, it is lost.
    expect(await stats('2026-03-05T10:00:00Z')).toMatchObject({ currentStreak: 0, bestStreak: 3 })

    await playGame('2026-03-05T10:00:00Z')
    expect(await stats('2026-03-05T11:00:00Z')).toMatchObject({ currentStreak: 1, bestStreak: 3 })
  })

  it('earns a freeze every 7 days, which saves one missed day', async () => {
    for (let day = 1; day <= 7; day++) {
      await playGame(`2026-03-0${day}T12:00:00Z`)
    }

    expect(await stats('2026-03-07T13:00:00Z')).toMatchObject({ currentStreak: 7, streakFreezes: 1 })
    // The 8th is missed: on the 9th the streak can still be saved.
    expect(await stats('2026-03-09T08:00:00Z')).toMatchObject({ currentStreak: 7 })

    await playGame('2026-03-09T12:00:00Z')
    expect(await stats('2026-03-09T13:00:00Z')).toMatchObject({ currentStreak: 8, streakFreezes: 0 })
  })

  it('uses the time zone of the player for the day', async () => {
    await DB.table('users').where('id', userId).update({ timeZone: 'America/Argentina/Buenos_Aires' })

    // 22:00 and 23:30 in Buenos Aires (UTC-3) are the same day there, although not in UTC.
    await playGame('2026-03-02T01:00:00Z')
    await playGame('2026-03-02T02:30:00Z')
    expect(await stats('2026-03-02T02:45:00Z')).toMatchObject({ currentStreak: 1, playedToday: true })

    // 21:30 of the next day in Buenos Aires.
    await playGame('2026-03-03T00:30:00Z')
    expect(await stats('2026-03-03T00:45:00Z')).toMatchObject({ currentStreak: 2 })
  })

  it('gives XP for every finished game, with a bonus for the first one of the day', async () => {
    const first = await playGame('2026-03-01T12:00:00Z')
    const second = await playGame('2026-03-01T13:00:00Z', false)
    const third = await playGame('2026-03-02T12:00:00Z', false)
    const xpOf = (game: GameView) => 20 + Math.floor((game.modeView as ClassicGameView).totalScore / 100)
    const total = xpOf(first) + 30 + xpOf(second) + xpOf(third) + 30

    expect(first.xp).toEqual({ earned: xpOf(first) + 30, total: xpOf(first) + 30 })
    // The same day: no bonus.
    expect(second.xp).toEqual({ earned: xpOf(second), total: xpOf(first) + 30 + xpOf(second) })
    // Another day: the bonus again.
    expect(third.xp).toEqual({ earned: xpOf(third) + 30, total })
    expect(third.players[0].level).toBe(getLevelProgress(total).level)
    expect(await stats('2026-03-02T13:00:00Z')).toMatchObject({ xp: total, ...getLevelProgress(total) })
    // A new game shows the level the player has now.
    const next = await createGame(userId, { mapId, mode: GameMode.CLASSIC }, { finder: new FakePanoramaFinder() })

    expect(next.players[0].level).toBe(getLevelProgress(total).level)
    expect(next.xp).toBeNull()

    // Asking for a finished game again does not give its XP again.
    await sendGameAction(userId, { gameId: third.id, action: { type: 'startRound' } }).catch(() => null)
    expect((await stats('2026-03-02T13:00:00Z')).xp).toBe(total)
  })

  it('gives the players that already played the XP of their counters', async () => {
    await playGame('2026-03-01T12:00:00Z')
    await DB.table('player_progress')
      .where('userId', userId)
      .update({ xp: 0, gamesPlayed: 10, totalScore: 123456, casesSolved: 2 })

    await backfillXp()

    expect((await stats('2026-03-01T13:00:00Z')).xp).toBe(20 * 10 + 1234 + 150 * 2)
  })

  it('fills in the progress of the games finished before the migration', async () => {
    await playGame('2026-03-01T12:00:00Z')
    await playGame('2026-03-02T12:00:00Z')
    const before = await stats('2026-03-02T13:00:00Z')

    await DB.table('player_progress').delete()
    await progressAndDaily.up()

    expect(await PlayerProgress.where('userId', userId).count()).toBe(1)
    // The XP is not part of that migration (see 006-player-xp).
    expect(await stats('2026-03-02T13:00:00Z')).toEqual({ ...before, xp: 0, ...getLevelProgress(0) })
  })
})
