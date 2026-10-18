import { DB } from '@neogroup/neorm'
import { beforeEach, describe, expect, it } from 'vitest'
import { deleteAccount } from '@/app/(protected)/(account)/services/accounts'
import { Game } from '@/app/(protected)/(game)/models/Game'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameOptions } from '@/app/(protected)/(game)/models/GameOptions'
import { GamePlayer } from '@/app/(protected)/(game)/models/GamePlayer'
import { GamePlayerStatus } from '@/app/(protected)/(game)/models/GamePlayerStatus'
import { GameStatus } from '@/app/(protected)/(game)/models/GameStatus'
import { createGame, getGame, getGames, joinGame, startGame } from '@/app/(protected)/(game)/services/games'
import { getMaps } from '@/app/(protected)/(game)/services/maps'
import { User } from '@/app/models/User'
import { createUser, resetDatabase } from '@/tests/setup/database'
import { FakePanoramaFinder } from '@/tests/setup/fakeFinder'

const START = new Date('2026-01-01T10:00:00Z')

function at(ms: number): GameOptions {
  return { now: () => new Date(START.getTime() + ms), finder: new FakePanoramaFinder() }
}

describe('account deletion', () => {
  let host: number
  let ana: number
  let mapId: number

  beforeEach(async () => {
    await resetDatabase()
    host = await createUser('host@geoquests.test')
    ana = await createUser('ana@geoquests.test')
    mapId = (await getMaps())[0].id
  })

  it('deletes the user, its tokens and its game history', async () => {
    const solo = await createGame(ana, { mapId, mode: GameMode.CLASSIC }, at(0))

    await DB.table('password_reset_tokens').insert({ userId: ana, token: 'reset', expiresAt: new Date() })
    await DB.table('email_verification_tokens').insert({ userId: ana, token: 'verify', expiresAt: new Date() })

    await deleteAccount(ana, at(1000))

    expect(await User.find(ana)).toBeFalsy()
    expect(await GamePlayer.where('userId', ana).get()).toHaveLength(0)
    expect(await DB.table('password_reset_tokens').where('userId', ana).get()).toHaveLength(0)
    expect(await DB.table('email_verification_tokens').where('userId', ana).get()).toHaveLength(0)
    // The single player game it was playing is cancelled.
    expect(await Game.find(solo.id)).toBeFalsy()
    // Other accounts are untouched.
    expect(await User.find(host)).toBeTruthy()
  })

  it('leaves the multiplayer game it is playing, so the others can go on', async () => {
    const lobby = await createGame(host, { mapId, mode: GameMode.CLASSIC_MULTIPLAYER }, at(0))

    await joinGame(ana, { code: lobby.code! }, at(0))
    await createUser('beto@geoquests.test').then((beto) => joinGame(beto, { code: lobby.code! }, at(0)))
    await startGame(host, { gameId: lobby.id }, at(0))

    // The host deletes its account in the middle of the game: the host role passes on.
    await deleteAccount(host, at(5000))

    const response = await getGame(ana, { gameId: lobby.id }, at(6000))

    expect(response.unchanged).toBe(false)

    if (!response.unchanged) {
      expect(response.game.status).toBe(GameStatus.IN_PROGRESS)
      expect(response.game.hostUserId).toBe(ana)
      expect(response.game.players.map((player) => player.userId)).not.toContain(host)
    }

    expect((await getGames(ana)).items).toHaveLength(1)
    expect(await GamePlayer.where('gameId', lobby.id).where('status', GamePlayerStatus.ACTIVE).get()).toHaveLength(2)
  })

  it('removes the account from a waiting room, deleting the room when nobody is left', async () => {
    const lobby = await createGame(host, { mapId, mode: GameMode.CLASSIC_MULTIPLAYER }, at(0))

    await deleteAccount(host, at(1000))

    expect(await Game.find(lobby.id)).toBeFalsy()
  })
})
