import { RandomFn } from '@/app/(protected)/(game)/utils/geo'

/** Characters of the invitation codes: no 0/O, 1/I/L or 5/S, easy to read aloud and type. */
export const GAME_CODE_ALPHABET = 'ABCDEFGHJKMNPQRTUVWXYZ2346789'
export const GAME_CODE_LENGTH = 6

/** Random invitation code of a multiplayer game (e.g. "K7QX2M"). */
export function generateGameCode(random: RandomFn = Math.random): string {
  let code = ''

  for (let index = 0; index < GAME_CODE_LENGTH; index++) {
    code += GAME_CODE_ALPHABET[Math.floor(random() * GAME_CODE_ALPHABET.length)]
  }

  return code
}

/** A code as typed by a player, normalized (trimmed, upper case, no spaces or dashes); null when it can't be one. */
export function normalizeGameCode(input: unknown): string | null {
  const code = String(input ?? '')
    .toUpperCase()
    .replace(/[\s-]/g, '')

  return code.length === GAME_CODE_LENGTH && [...code].every((char) => GAME_CODE_ALPHABET.includes(char)) ? code : null
}
