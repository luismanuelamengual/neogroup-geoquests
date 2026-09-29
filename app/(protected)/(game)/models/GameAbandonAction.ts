/**
 * What happens to a game left without activity for too long (see
 * services/gameCleanup.ts): it is deleted, or it is finished with the results
 * it had so far.
 */
export type GameAbandonAction = 'delete' | 'finish'
