import { SuspectClue, SuspectTrait } from '@/app/(protected)/(game)/models/SuspectClue'
import { WitnessRole } from '@/app/(protected)/(game)/models/WitnessRole'
import { RandomFn } from '@/app/(protected)/(game)/utils/geo'
import { shuffle } from '@/app/(protected)/(game)/utils/random'
import { generateWitness, WitnessTraits } from '@/app/(protected)/(game)/utils/witnesses'

/**
 * The thief of the detective mode and the decoys it is mixed with at the last
 * stop. They are drawn like the witnesses (same generator, from a seed) but
 * with open eyes (see GenerateWitnessOptions) and always with the same job (the
 * backpack of the loot). Along the case the witnesses tell traits of the thief
 * ("had green eyes"): the lineup is built so that those traits tell the thief
 * from every decoy, and the detective has to remember them.
 */

/** Job (outfit) of every suspect: none of the witnesses' jobs is a clue. */
export const SUSPECT_ROLE: WitnessRole = 'backpacker'

/** Look of a suspect: always the same for the same seed. */
export function generateSuspect(seed: number): WitnessTraits {
  return generateWitness(seed, SUSPECT_ROLE, { openEyes: true })
}

/** Names of the hair colors (what a witness says), by the colors the generator draws. */
const HAIR_COLOR_NAMES: Record<string, string> = {
  '#1f1a1a': 'dark',
  '#3b2417': 'dark',
  '#6b4226': 'brown',
  '#8f3b1b': 'red',
  '#e2b65c': 'blond',
  '#9a9aa5': 'grey',
  '#e9e7ee': 'grey',
  '#3b82f6': 'blue',
  '#ff6fae': 'pink'
}
/** Hair styles a witness tells apart (the short ones look alike). */
const HAIR_STYLE_NAMES: Record<WitnessTraits['hairStyle'], string> = {
  short: 'short',
  sidePart: 'short',
  spiky: 'spiky',
  curly: 'curly',
  long: 'long',
  bob: 'bob',
  bun: 'bun',
  ponytail: 'ponytail',
  mohawk: 'mohawk',
  buzz: 'buzz',
  bald: 'bald'
}
const HEADWEAR_NAMES: Record<WitnessTraits['headwear'], string> = {
  none: 'none',
  policeCap: 'cap',
  flatCap: 'beret',
  cap: 'cap',
  sunHat: 'sunHat',
  beanie: 'beanie'
}

/** Every trait that can be told. */
export const ALL_SUSPECT_TRAITS: SuspectTrait[] = [
  'gender',
  'hairColor',
  'hairStyle',
  'eyeColor',
  'glasses',
  'facialHair',
  'headwear',
  'freckles',
  'earrings'
]

/** The values a suspect has in each trait (as in a SuspectClue); null when that trait can't be seen in the drawing. */
export type SuspectDescription = Record<SuspectTrait, string | null>

/**
 * What is seen of a suspect: a hat hides the hair, sunglasses hide the eyes.
 * Bald people have no hair color: it is "none".
 */
export function describeSuspect(traits: WitnessTraits): SuspectDescription {
  const hat = traits.headwear !== 'none'
  const hair = traits.hairStyle !== 'bald'

  return {
    gender: traits.presentation,
    hairColor: hat ? null : hair ? HAIR_COLOR_NAMES[traits.hairColor] : 'none',
    hairStyle: hat ? null : HAIR_STYLE_NAMES[traits.hairStyle],
    eyeColor: traits.glasses === 'sun' ? null : traits.eyeColor,
    glasses: traits.glasses === 'none' ? 'none' : traits.glasses === 'sun' ? 'sun' : 'clear',
    facialHair: traits.facialHair,
    headwear: HEADWEAR_NAMES[traits.headwear],
    freckles: traits.freckles ? 'yes' : 'no',
    earrings: traits.earrings ? 'yes' : 'no'
  }
}

/**
 * Traits a witness can tell about a suspect, as clues: first what it has
 * ("had green eyes", "wore glasses"), then — only to complete the list — what
 * it doesn't ("didn't wear glasses"). Never what can't be seen.
 */
export function getSuspectClueCandidates(
  traits: WitnessTraits,
  allowed: SuspectTrait[] = ALL_SUSPECT_TRAITS
): { positive: SuspectClue[]; negative: SuspectClue[] } {
  const description = describeSuspect(traits)
  const positive: SuspectClue[] = []
  const negative: SuspectClue[] = []

  for (const [trait, value] of Object.entries(description) as [SuspectTrait, string | null][]) {
    if (value === null || !allowed.includes(trait)) {
      continue
    }

    const absent = value === 'none' || value === 'no'

    // A bald thief's hair color ("none") says nothing: its hair style (bald) already does.
    if (trait === 'hairColor' && absent) {
      continue
    }

    // Women never have facial hair: "had no beard" tells nothing.
    if (trait === 'facialHair' && absent && traits.presentation === 'f') {
      continue
    }

    // Of "no freckles" or "no earrings" nobody would remember a thing.
    if (value === 'no') {
      continue
    }

    ;(absent ? negative : positive).push({ trait, value })
  }

  return { positive, negative }
}

/** Whether the look of a suspect contradicts a clue (a trait that can't be seen contradicts nothing). */
export function contradictsClue(traits: WitnessTraits, clue: SuspectClue): boolean {
  const value = describeSuspect(traits)[clue.trait]

  return value !== null && value !== clue.value
}

/** How many of the clues a suspect contradicts. */
export function countContradictions(traits: WitnessTraits, clues: SuspectClue[]): number {
  return clues.filter((clue) => contradictsClue(traits, clue)).length
}

/** Seeds a suspect can be drawn from. */
function randomSeed(random: RandomFn): number {
  return Math.floor(random() * 2 ** 31)
}

/** Attempts to find a thief with enough traits to tell, and decoys that contradict its clues, before settling for less. */
const MAX_ATTEMPTS = 500

/** A lineup: the suspects (seeds, shuffled), which one is the thief and the clues (in the order they are given). */
export interface PlannedLineup {
  seeds: number[]
  thief: number
  clues: SuspectClue[]
}

/** What sets how hard it is to tell the thief (see DetectiveDifficultySettings). */
export interface LineupRules {
  /** Traits the witnesses can tell. */
  traits: SuspectTrait[]
  /** [min, max] of the clues each decoy contradicts, as a fraction of the clues. */
  decoyContradictions: [number, number]
}

/** Default rules: the ones of the medium difficulty. */
const DEFAULT_RULES: LineupRules = { traits: ALL_SUSPECT_TRAITS, decoyContradictions: [0, 0.5] }

/**
 * Plans the end of a case: a thief, `clueCount` clues of its traits (different
 * traits, in random order) and `size - 1` decoys that contradict at least one
 * of them, so whoever remembers them all can tell the thief. How many each
 * decoy contradicts is set by the rules (while possible: otherwise any number
 * above zero): the fewer, the more it looks like the thief.
 */
export function planLineup(
  size: number,
  clueCount: number,
  random: RandomFn = Math.random,
  rules: LineupRules = DEFAULT_RULES
): PlannedLineup {
  let thiefSeed = randomSeed(random)
  let clues: SuspectClue[] = []

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const { positive, negative } = getSuspectClueCandidates(generateSuspect(thiefSeed), rules.traits)

    if (positive.length + negative.length >= clueCount) {
      clues = [...shuffle(positive, random), ...shuffle(negative, random)].slice(0, clueCount)

      break
    }

    thiefSeed = randomSeed(random)
  }

  const seeds = [thiefSeed]
  const minContradictions = Math.max(1, Math.ceil(rules.decoyContradictions[0] * clues.length))
  const maxContradictions = Math.max(minContradictions, Math.ceil(rules.decoyContradictions[1] * clues.length))

  for (let attempt = 0; seeds.length < size && attempt < MAX_ATTEMPTS * 4; attempt++) {
    const seed = randomSeed(random)
    const contradictions = countContradictions(generateSuspect(seed), clues)
    const strict = attempt < MAX_ATTEMPTS
    const fits = strict
      ? contradictions >= minContradictions && contradictions <= maxContradictions
      : contradictions >= 1

    if (fits && !seeds.includes(seed)) {
      seeds.push(seed)
    }
  }

  const lineup = shuffle(seeds, random)

  return { seeds: lineup, thief: lineup.indexOf(thiefSeed), clues }
}
