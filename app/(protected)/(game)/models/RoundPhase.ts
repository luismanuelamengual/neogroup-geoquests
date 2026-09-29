/**
 * Phase of the current round of a multiplayer round based game: the players
 * are guessing (after a short countdown), or the round is closed and its
 * result — everybody's pins — is being shown.
 */
export type RoundPhase = 'guessing' | 'reveal'
