/** Job of a witness: it sets the outfit of the generated character and how the player sees it ("the waiter says..."). */
export type WitnessRole = 'waiter' | 'guide' | 'police' | 'vendor' | 'taxiDriver' | 'tourist' | 'backpacker'

export const WITNESS_ROLES: WitnessRole[] = [
  'waiter',
  'guide',
  'police',
  'vendor',
  'taxiDriver',
  'tourist',
  'backpacker'
]

/**
 * Kinds of clues of a landmark (see models/LandmarkClues.ts): geography
 * (region, climate, landscape), culture (language, money, food, customs) and
 * history (history and architecture of the place).
 */
export type ClueKind = 'geography' | 'culture' | 'history'

export const CLUE_KINDS: ClueKind[] = ['geography', 'culture', 'history']

/**
 * The kind of clue each job knows about: whoever drives or walks around knows
 * the geography, whoever sells or serves the customs, whoever shows the place
 * (or visits it) its history. The player sees the job, so it can choose whom
 * to ask for the clue it needs.
 */
export const ROLE_CLUE_KIND: Record<WitnessRole, ClueKind> = {
  taxiDriver: 'geography',
  backpacker: 'geography',
  police: 'geography',
  waiter: 'culture',
  vendor: 'culture',
  guide: 'history',
  tourist: 'history'
}

/** The jobs that know about a kind of clue. */
export function getClueKindRoles(kind: ClueKind): WitnessRole[] {
  return WITNESS_ROLES.filter((role) => ROLE_CLUE_KIND[role] === kind)
}
