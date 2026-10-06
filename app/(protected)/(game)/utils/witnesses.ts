import { WitnessRole } from '@/app/(protected)/(game)/models/WitnessRole'
import { RandomFn } from '@/app/(protected)/(game)/utils/geo'
import { chance, pickWeighted, seededRandom } from '@/app/(protected)/(game)/utils/seededRandom'

/**
 * Generator of the witnesses of the detective mode: from a seed and a job it
 * builds a cartoon character by layers (face, eyes, hair, clothes,
 * accessories...) and its name. Deterministic — the same seed always gives
 * the same witness, so only the seed is stored. The traits never depend on
 * the place: the look of a witness is never a clue (nor a stereotype).
 */

export type WitnessPresentation = 'f' | 'm'
export type FaceShape = 'round' | 'oval' | 'square' | 'long'
export type HairStyle =
  'short' | 'sidePart' | 'spiky' | 'curly' | 'long' | 'bob' | 'bun' | 'ponytail' | 'mohawk' | 'buzz' | 'bald'
export type EyeStyle = 'dot' | 'oval' | 'happy' | 'sleepy'
export type BrowStyle = 'thin' | 'thick' | 'arched'
export type NoseStyle = 'button' | 'line' | 'round'
export type FacialHair = 'none' | 'mustache' | 'beard' | 'goatee' | 'stubble'
export type Glasses = 'none' | 'round' | 'square' | 'sun'
export type EyeColor = 'brown' | 'green' | 'blue' | 'grey'
export type Headwear = 'none' | 'policeCap' | 'flatCap' | 'cap' | 'sunHat' | 'beanie'

export interface WitnessTraits {
  presentation: WitnessPresentation
  name: string
  skin: string
  faceShape: FaceShape
  hairStyle: HairStyle
  hairColor: string
  eyes: EyeStyle
  /** Color of the iris (seen in every eye style but `happy`, closed). */
  eyeColor: EyeColor
  brows: BrowStyle
  nose: NoseStyle
  facialHair: FacialHair
  glasses: Glasses
  earrings: boolean
  freckles: boolean
  headwear: Headwear
  /** Main color of the clothes (some jobs have a fixed one). */
  outfitColor: string
  /** Second color (tie, apron, straps, hat...). */
  accentColor: string
  /** Opening line the witness says before the clue (index of the intros). */
  introIndex: number
}

/** Opening lines a witness can say before its clue (see detective.witness.intro* in the dictionaries). */
export const WITNESS_INTROS_COUNT = 6

export const SKIN_TONES = ['#ffe0c7', '#f6c7a0', '#e8ad80', '#d0915e', '#ad7148', '#865233', '#5c3820']

const HAIR_COLORS: [string, number][] = [
  ['#1f1a1a', 3],
  ['#3b2417', 3],
  ['#6b4226', 2],
  ['#8f3b1b', 1],
  ['#e2b65c', 1.5],
  ['#9a9aa5', 1],
  ['#e9e7ee', 0.5],
  ['#3b82f6', 0.2],
  ['#ff6fae', 0.2]
]

/** Color of the iris of each eye color. */
export const EYE_COLORS: Record<EyeColor, string> = {
  brown: '#8a5224',
  green: '#2fa35b',
  blue: '#2f86e8',
  grey: '#9aa6b5'
}

const EYE_COLOR_WEIGHTS: [EyeColor, number][] = [
  ['brown', 5],
  ['green', 2],
  ['blue', 2.5],
  ['grey', 1]
]

export const OUTFIT_COLORS = [
  '#ff4d8d',
  '#22d3ee',
  '#84f06b',
  '#ffc233',
  '#a78bfa',
  '#fb923c',
  '#38bdf8',
  '#f87171',
  '#34d399'
]

const HAIR_STYLES: Record<WitnessPresentation, [HairStyle, number][]> = {
  f: [
    ['long', 3],
    ['bob', 2],
    ['bun', 2],
    ['ponytail', 2],
    ['curly', 2],
    ['short', 1],
    ['sidePart', 1],
    ['buzz', 0.4]
  ],
  m: [
    ['short', 3],
    ['sidePart', 2],
    ['spiky', 1.5],
    ['buzz', 1.5],
    ['bald', 1.5],
    ['curly', 1.5],
    ['mohawk', 0.5],
    ['long', 0.6],
    ['ponytail', 0.4]
  ]
}
const FACIAL_HAIR: [FacialHair, number][] = [
  ['none', 50],
  ['mustache', 12],
  ['beard', 18],
  ['goatee', 10],
  ['stubble', 10]
]
/** Headwear of each job: [headwear, probability] (the rest of the time, none). */
const ROLE_HEADWEAR: Record<WitnessRole, [Headwear, number][]> = {
  police: [['policeCap', 1]],
  taxiDriver: [['flatCap', 0.6]],
  guide: [
    ['cap', 0.4],
    ['sunHat', 0.2]
  ],
  tourist: [
    ['sunHat', 0.45],
    ['cap', 0.2]
  ],
  backpacker: [
    ['beanie', 0.35],
    ['cap', 0.2]
  ],
  vendor: [
    ['cap', 0.2],
    ['beanie', 0.1]
  ],
  waiter: []
}
/** Fixed outfit color of some jobs (uniforms). */
const ROLE_OUTFIT: Partial<Record<WitnessRole, string>> = {
  waiter: '#f4f4f6',
  police: '#2b3a74'
}

export const WITNESS_NAMES: Record<WitnessPresentation, string[]> = {
  f: [
    'Ana',
    'Mei',
    'Fátima',
    'Sofía',
    'Aiko',
    'Priya',
    'Amara',
    'Ingrid',
    'Lucía',
    'Zara',
    'Nadia',
    'Chloé',
    'Yara',
    'Leila',
    'Hana',
    'Olga',
    'Emma',
    'Camila',
    'Aisha',
    'Valentina',
    'Rosa',
    'Noor',
    'Elena',
    'Maya',
    'Sakura',
    'Zoe',
    'Inés',
    'Freya',
    'Aditi',
    'Marta'
  ],
  m: [
    'Mateo',
    'Kenji',
    'Omar',
    'Luca',
    'Diego',
    'Ravi',
    'Kwame',
    'Lars',
    'Tomás',
    'Hugo',
    'Ahmed',
    'Chen',
    'Pierre',
    'Iván',
    'Jonas',
    'Malik',
    'Kofi',
    'Andrés',
    'Yusuf',
    'Sven',
    'Hiro',
    'Arjun',
    'Bruno',
    'Nico',
    'Emil',
    'Rafael',
    'Theo',
    'Samir',
    'Joaquín',
    'Wei'
  ]
}

function pick<T>(items: T[], random: RandomFn): T {
  return items[Math.floor(random() * items.length)]
}

function pickHeadwear(role: WitnessRole, random: RandomFn): Headwear {
  const roll = random()
  let accumulated = 0

  for (const [headwear, probability] of ROLE_HEADWEAR[role]) {
    accumulated += probability

    if (roll < accumulated) {
      return headwear
    }
  }

  return 'none'
}

function pickGlasses(role: WitnessRole, random: RandomFn): Glasses {
  if (role === 'tourist' && chance(0.4, random)) {
    return 'sun'
  }

  return pickWeighted(
    [
      ['none', 65],
      ['round', 15],
      ['square', 15],
      ['sun', 5]
    ],
    random
  )
}

export interface GenerateWitnessOptions {
  /** Never closed eyes (`happy`): the color of the eyes has to be seen (the suspects). */
  openEyes?: boolean
}

/** The look and name of a witness: always the same for the same seed and job. */
export function generateWitness(seed: number, role: WitnessRole, options: GenerateWitnessOptions = {}): WitnessTraits {
  const random = seededRandom(seed)
  const presentation: WitnessPresentation = chance(0.5, random) ? 'f' : 'm'
  const outfitColor = ROLE_OUTFIT[role] ?? pick(OUTFIT_COLORS, random)
  const accentColor = pick(
    OUTFIT_COLORS.filter((color) => color !== outfitColor),
    random
  )
  const traits: WitnessTraits = {
    presentation,
    name: pick(WITNESS_NAMES[presentation], random),
    skin: pick(SKIN_TONES, random),
    faceShape: pick<FaceShape>(['round', 'oval', 'square', 'long'], random),
    hairStyle: pickWeighted(HAIR_STYLES[presentation], random),
    hairColor: pickWeighted(HAIR_COLORS, random),
    eyes: pickWeighted<EyeStyle>(
      [
        ['oval', 4],
        ['dot', 3],
        ['happy', 1.5],
        ['sleepy', 1]
      ],
      random
    ),
    // Never before the traits above: the look of the witnesses already seen must not change.
    eyeColor: 'brown',
    brows: pick<BrowStyle>(['thin', 'thick', 'arched'], random),
    nose: pick<NoseStyle>(['button', 'line', 'round'], random),
    facialHair: presentation === 'm' ? pickWeighted(FACIAL_HAIR, random) : 'none',
    glasses: pickGlasses(role, random),
    earrings: chance(presentation === 'f' ? 0.35 : 0.1, random),
    freckles: chance(0.15, random),
    headwear: pickHeadwear(role, random),
    outfitColor,
    accentColor,
    introIndex: Math.floor(random() * WITNESS_INTROS_COUNT)
  }

  // Drawn last, so the other traits are the same as before the eye colors existed.
  traits.eyeColor = pickWeighted(EYE_COLOR_WEIGHTS, random)

  if (options.openEyes && traits.eyes === 'happy') {
    traits.eyes = 'oval'
  }

  return traits
}

/** A color made darker (amount 0-1): for shadows of the skin, hair... */
export function darken(hex: string, amount: number): string {
  const value = parseInt(hex.slice(1), 16)
  const channel = (shift: number) => Math.round(((value >> shift) & 255) * (1 - amount))

  return `#${[16, 8, 0].map((shift) => channel(shift).toString(16).padStart(2, '0')).join('')}`
}

/** A color made lighter (amount 0-1). */
export function lighten(hex: string, amount: number): string {
  const value = parseInt(hex.slice(1), 16)

  const channel = (shift: number) => {
    const current = (value >> shift) & 255

    return Math.round(current + (255 - current) * amount)
  }

  return `#${[16, 8, 0].map((shift) => channel(shift).toString(16).padStart(2, '0')).join('')}`
}
