import { describe, expect, it } from 'vitest'
import { SuspectTrait } from '@/app/(protected)/(game)/models/SuspectClue'
import { DETECTIVE_DIFFICULTIES } from '@/app/(protected)/(game)/utils/detectiveDifficulty'
import {
  contradictsClue,
  countContradictions,
  describeSuspect,
  generateSuspect,
  getSuspectClueCandidates,
  planLineup,
  SUSPECT_ROLE
} from '@/app/(protected)/(game)/utils/suspects'
import { generateWitness } from '@/app/(protected)/(game)/utils/witnesses'
import { getSuspectClueText } from '@/app/(protected)/(game)/utils/witnessText'
import { createTranslator } from '@/app/i18n/translate'

/** Deterministic random source (a small LCG). */
function seeded(seed: number): () => number {
  let state = seed

  return () => {
    state = (state * 1664525 + 1013904223) % 2 ** 32

    return state / 2 ** 32
  }
}

describe('suspects', () => {
  it('are drawn like witnesses, but never with closed eyes', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const suspect = generateSuspect(seed * 7919)

      expect(suspect.eyes).not.toBe('happy')
      expect(suspect).toEqual(generateSuspect(seed * 7919))
      expect(['green', 'brown', 'blue', 'grey']).toContain(suspect.eyeColor)
    }
  })

  it('do not change the look the witnesses already had (the eye color is drawn last)', () => {
    const before = generateWitness(424242, 'guide')
    const open = generateWitness(424242, 'guide', { openEyes: true })

    expect({ ...open, eyes: before.eyes }).toEqual(before)
  })

  it('only describe what is seen: a hat hides the hair, sunglasses the eyes', () => {
    let hats = 0
    let sunglasses = 0

    for (let seed = 1; seed <= 500; seed++) {
      const traits = generateSuspect(seed)
      const description = describeSuspect(traits)

      if (traits.headwear !== 'none') {
        hats++
        expect(description.hairColor).toBeNull()
        expect(description.hairStyle).toBeNull()
      }

      if (traits.glasses === 'sun') {
        sunglasses++
        expect(description.eyeColor).toBeNull()
      } else {
        expect(description.eyeColor).toBe(traits.eyeColor)
      }
    }

    expect(hats).toBeGreaterThan(0)
    expect(sunglasses).toBeGreaterThan(0)
  })

  it('never contradict a clue about something that can not be seen', () => {
    const sunglasses = generateSuspect(
      Array.from({ length: 2000 }, (_, i) => i + 1).find((seed) => generateSuspect(seed).glasses === 'sun')!
    )

    for (const eyeColor of ['green', 'brown', 'blue', 'grey']) {
      expect(contradictsClue(sunglasses, { trait: 'eyeColor', value: eyeColor })).toBe(false)
    }
  })

  it('give clues that are true of the thief, preferring what it has over what it lacks', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const traits = generateSuspect(seed)
      const { positive, negative } = getSuspectClueCandidates(traits)

      expect(positive.length).toBeGreaterThan(0)

      for (const clue of [...positive, ...negative]) {
        expect(contradictsClue(traits, clue), `${seed} ${clue.trait}`).toBe(false)
      }

      // Facts about the person ("was a woman") come first; the absent things only to fill in.
      expect(positive.some((clue) => clue.trait === 'gender')).toBe(true)
      expect(negative.every((clue) => ['glasses', 'headwear', 'facialHair'].includes(clue.trait))).toBe(true)
    }
  })
})

describe('lineup', () => {
  it('has the thief, decoys that contradict at least one clue and one different clue per stage', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const lineup = planLineup(4, 5, seeded(seed))
      const thief = generateSuspect(lineup.seeds[lineup.thief])

      expect(lineup.seeds).toHaveLength(4)
      expect(new Set(lineup.seeds).size).toBe(4)
      expect(lineup.thief).toBeGreaterThanOrEqual(0)
      expect(lineup.thief).toBeLessThan(4)

      // Five different traits, all true of the thief.
      expect(lineup.clues).toHaveLength(5)
      expect(new Set(lineup.clues.map((clue) => clue.trait)).size).toBe(5)
      expect(countContradictions(thief, lineup.clues)).toBe(0)

      // Whoever remembers every clue can tell the thief: no decoy matches them all.
      lineup.seeds.forEach((suspect, index) => {
        if (index !== lineup.thief) {
          expect(countContradictions(generateSuspect(suspect), lineup.clues), `${seed}`).toBeGreaterThanOrEqual(1)
        }
      })
    }
  })

  it('keeps the decoys close to the thief: they match most of the clues', () => {
    let near = 0
    let total = 0

    for (let seed = 1; seed <= 100; seed++) {
      const lineup = planLineup(4, 5, seeded(seed))

      lineup.seeds.forEach((suspect, index) => {
        if (index !== lineup.thief) {
          total++
          near += countContradictions(generateSuspect(suspect), lineup.clues) <= 3 ? 1 : 0
        }
      })
    }

    expect(near / total).toBeGreaterThan(0.95)
  })

  it('keeps the decoys of each difficulty as close to the thief as it says', () => {
    for (const [level, rules] of Object.entries(DETECTIVE_DIFFICULTIES)) {
      const lineupRules = { traits: rules.suspectTraits, decoyContradictions: rules.decoyContradictions }
      let total = 0
      let sum = 0

      for (let seed = 1; seed <= 60; seed++) {
        const lineup = planLineup(rules.suspects, rules.hops, seeded(seed), lineupRules)

        expect(lineup.seeds, level).toHaveLength(rules.suspects)
        expect(lineup.clues, level).toHaveLength(rules.hops)
        expect(lineup.clues.every((clue) => rules.suspectTraits.includes(clue.trait))).toBe(true)

        lineup.seeds.forEach((suspect, index) => {
          if (index !== lineup.thief) {
            total++
            sum += countContradictions(generateSuspect(suspect), lineup.clues)
          }
        })
      }

      // Average contradictions per decoy, as a fraction of the clues: inside the range of the difficulty.
      const average = sum / total / rules.hops

      expect(average, level).toBeGreaterThanOrEqual(rules.decoyContradictions[0])
      expect(average, level).toBeLessThanOrEqual(Math.max(rules.decoyContradictions[1], 1 / rules.hops) + 0.1)
    }

    // Harder: decoys closer to the thief.
    const easy = DETECTIVE_DIFFICULTIES.easy.decoyContradictions
    const hard = DETECTIVE_DIFFICULTIES.hard.decoyContradictions

    expect(hard[1]).toBeLessThan(easy[0])
  })

  it('puts the thief in any position', () => {
    const positions = new Set<number>()

    for (let seed = 1; seed <= 100; seed++) {
      positions.add(planLineup(4, 5, seeded(seed)).thief)
    }

    expect([...positions].sort()).toEqual([0, 1, 2, 3])
  })

  it('is written in every language for every trait it can tell', () => {
    const traits: SuspectTrait[] = []

    for (let seed = 1; seed <= 400; seed++) {
      const { positive, negative } = getSuspectClueCandidates(generateSuspect(seed))

      for (const clue of [...positive, ...negative]) {
        traits.push(clue.trait)

        for (const locale of ['es', 'en'] as const) {
          const text = getSuspectClueText(createTranslator(locale), clue)

          expect(text, `${locale} ${clue.trait}.${clue.value}`).not.toMatch(/detective\.|\{/)
        }
      }
    }

    expect(new Set(traits).size).toBe(9)
    expect(SUSPECT_ROLE).toBeTruthy()
  })
})
