import { describe, expect, it } from 'vitest'
import {
  GAME_CODE_ALPHABET,
  GAME_CODE_LENGTH,
  generateGameCode,
  normalizeGameCode
} from '@/app/(protected)/(game)/utils/gameCodes'

describe('game codes', () => {
  it('generates codes of the right length using only unambiguous characters', () => {
    for (let index = 0; index < 50; index++) {
      const code = generateGameCode()

      expect(code).toHaveLength(GAME_CODE_LENGTH)
      expect([...code].every((char) => GAME_CODE_ALPHABET.includes(char))).toBe(true)
    }

    expect(GAME_CODE_ALPHABET).not.toMatch(/[0O1IL5S]/)
  })

  it('normalizes the codes typed by the players', () => {
    expect(normalizeGameCode(' k7q-x2m ')).toBe('K7QX2M')
    expect(normalizeGameCode('K7QX2')).toBeNull()
    expect(normalizeGameCode('K7QX2O')).toBeNull()
    expect(normalizeGameCode(null)).toBeNull()
  })
})
