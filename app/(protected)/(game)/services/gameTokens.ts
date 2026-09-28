import { createCipheriv, createDecipheriv, hkdfSync, randomBytes } from 'crypto'
import { deflateRawSync, inflateRawSync } from 'zlib'
import { GameState } from '@/app/(protected)/(game)/models/GameState'
import { ApiException } from '@/app/models/ApiException'

/**
 * Game tokens: the whole state of a game (including the answers of the rounds
 * still to play) serialized, compressed and encrypted with AES-256-GCM.
 *
 * The browser keeps the token (localStorage) and sends it back with every
 * request, so the rounds never need to be stored in the database. GCM is
 * authenticated encryption: the token can't be read without the key, and any
 * modified byte makes it fail to decrypt. Replays of an old (valid) token are
 * stopped by the games service with `games.playedRounds`.
 *
 * The key is derived from AUTH_SECRET (HKDF-SHA256), so there is no extra
 * secret to configure. Changing AUTH_SECRET invalidates the games in progress.
 *
 * Format: base64url( iv[12] | authTag[16] | ciphertext ).
 */
const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const TAG_LENGTH = 16
let cachedKey: Buffer | null = null

function getKey(): Buffer {
  if (!cachedKey) {
    const secret = process.env.AUTH_SECRET

    if (!secret) {
      throw new ApiException('Falta configurar AUTH_SECRET en el servidor', 500)
    }

    cachedKey = Buffer.from(hkdfSync('sha256', secret, 'geoquests', 'game-token-v1', 32))
  }

  return cachedKey
}

export function encryptGameState(state: GameState): string {
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, getKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(deflateRawSync(JSON.stringify(state))), cipher.final()])

  return Buffer.concat([iv, cipher.getAuthTag(), ciphertext]).toString('base64url')
}

/** Decrypts a game token; throws an ApiException when it was tampered with or is not a token. */
export function decryptGameState(token: unknown): GameState {
  try {
    const data = Buffer.from(String(token), 'base64url')
    const decipher = createDecipheriv(ALGORITHM, getKey(), data.subarray(0, IV_LENGTH))

    decipher.setAuthTag(data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH))

    const plain = Buffer.concat([decipher.update(data.subarray(IV_LENGTH + TAG_LENGTH)), decipher.final()])
    const state = JSON.parse(inflateRawSync(plain).toString('utf8')) as GameState

    if (state.v !== 2 || !Array.isArray(state.rounds)) {
      throw new Error('Unknown game token version')
    }

    return state
  } catch {
    throw new ApiException('La partida no es válida', 400)
  }
}
