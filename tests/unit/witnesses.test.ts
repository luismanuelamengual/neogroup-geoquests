import { describe, expect, it } from 'vitest'
import { WITNESS_ROLES } from '@/app/(protected)/(game)/models/WitnessRole'
import { seededRandom } from '@/app/(protected)/(game)/utils/seededRandom'
import {
  darken,
  generateWitness,
  lighten,
  WITNESS_INTROS_COUNT,
  WITNESS_NAMES
} from '@/app/(protected)/(game)/utils/witnesses'
import { getWitnessIntro, getWitnessRoleName } from '@/app/(protected)/(game)/utils/witnessText'
import { createTranslator } from '@/app/i18n/translate'

describe('witness generator', () => {
  it('is deterministic: the same seed always gives the same witness', () => {
    expect(seededRandom(7)()).toBe(seededRandom(7)())
    expect(generateWitness(123456, 'guide')).toEqual(generateWitness(123456, 'guide'))
  })

  it('makes many different witnesses', () => {
    const looks = new Set<string>()
    const names = new Set<string>()

    for (let seed = 1; seed <= 300; seed++) {
      const witness = generateWitness(seed * 7919, WITNESS_ROLES[seed % WITNESS_ROLES.length])

      looks.add(
        [witness.skin, witness.faceShape, witness.hairStyle, witness.hairColor, witness.eyes, witness.glasses].join()
      )
      names.add(witness.name)
      expect([...WITNESS_NAMES.f, ...WITNESS_NAMES.m]).toContain(witness.name)
      expect(WITNESS_NAMES[witness.presentation]).toContain(witness.name)
      expect(witness.introIndex).toBeGreaterThanOrEqual(0)
      expect(witness.introIndex).toBeLessThan(WITNESS_INTROS_COUNT)
    }

    expect(looks.size).toBeGreaterThan(250)
    expect(names.size).toBeGreaterThan(40)
  })

  it('dresses each job its way', () => {
    for (let seed = 1; seed <= 50; seed++) {
      expect(generateWitness(seed, 'police')).toMatchObject({ headwear: 'policeCap', outfitColor: '#2b3a74' })
      expect(generateWitness(seed, 'waiter').headwear).toBe('none')
      expect(['none', 'flatCap']).toContain(generateWitness(seed, 'taxiDriver').headwear)
    }
  })

  it('only gives facial hair to some of the men', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const witness = generateWitness(seed, 'tourist')

      if (witness.presentation === 'f') {
        expect(witness.facialHair).toBe('none')
      }
    }
  })

  it('names jobs and opening lines in every language', () => {
    for (const locale of ['es', 'en'] as const) {
      const t = createTranslator(locale)

      for (const role of WITNESS_ROLES) {
        for (const presentation of ['f', 'm'] as const) {
          expect(getWitnessRoleName(t, role, presentation)).not.toContain('detective.')
        }
      }

      for (let index = 0; index < WITNESS_INTROS_COUNT; index++) {
        expect(getWitnessIntro(t, index)).not.toContain('detective.')
      }
    }

    expect(getWitnessRoleName(createTranslator('es'), 'waiter', 'f')).toBe('Camarera')
  })

  it('shades colors', () => {
    expect(darken('#ffffff', 0.5)).toBe('#808080')
    expect(lighten('#000000', 0.5)).toBe('#808080')
  })
})
