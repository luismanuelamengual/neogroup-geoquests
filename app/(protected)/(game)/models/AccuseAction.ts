/** The detective points at the thief among the suspects of the last stop (the case ends either way). */
export interface AccuseAction {
  type: 'accuse'
  /** Index of the suspect in the lineup. */
  suspect: number
}
