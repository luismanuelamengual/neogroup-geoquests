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
