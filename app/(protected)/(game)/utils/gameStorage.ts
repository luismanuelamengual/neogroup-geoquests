import { GameSession } from '@/app/(protected)/(game)/models/GameView'

/**
 * Browser storage of the games played on this device (localStorage, so a game
 * survives closing the tab or the installed app being killed).
 *
 * Each entry keeps the encrypted token (needed to keep playing) and the last
 * game view (answers only of the rounds already played — safe to store in
 * clear), which lets the summary show the round details. Only the latest
 * MAX_STORED_GAMES games are kept. Every access is guarded: storage can be
 * unavailable (private mode, disabled, full).
 */
const KEY_PREFIX = 'geoquests:game:'
const MAX_STORED_GAMES = 5

interface StoredGame extends GameSession {
  savedAt: number
}

function storage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null
  } catch {
    return null
  }
}

export function loadGameSession(gameId: number): GameSession | null {
  try {
    const raw = storage()?.getItem(`${KEY_PREFIX}${gameId}`)

    return raw ? (JSON.parse(raw) as StoredGame) : null
  } catch {
    return null
  }
}

export function hasGameSession(gameId: number): boolean {
  return loadGameSession(gameId) !== null
}

export function removeGameSession(gameId: number): void {
  try {
    storage()?.removeItem(`${KEY_PREFIX}${gameId}`)
  } catch {
    // Ignore storage errors.
  }
}

/** Removes the oldest stored games beyond MAX_STORED_GAMES. */
function pruneGameSessions(store: Storage): void {
  const entries: { key: string; savedAt: number }[] = []

  for (let index = 0; index < store.length; index++) {
    const key = store.key(index)

    if (key?.startsWith(KEY_PREFIX)) {
      try {
        entries.push({ key, savedAt: (JSON.parse(store.getItem(key) ?? '{}') as StoredGame).savedAt ?? 0 })
      } catch {
        entries.push({ key, savedAt: 0 })
      }
    }
  }

  entries
    .sort((a, b) => b.savedAt - a.savedAt)
    .slice(MAX_STORED_GAMES)
    .forEach(({ key }) => store.removeItem(key))
}

export function saveGameSession(session: GameSession): void {
  const store = storage()

  if (!store) {
    return
  }

  try {
    const entry: StoredGame = { ...session, savedAt: Date.now() }

    store.setItem(`${KEY_PREFIX}${session.game.id}`, JSON.stringify(entry))
    pruneGameSessions(store)
  } catch {
    // Ignore storage errors (e.g. quota): the game keeps working in memory.
  }
}
