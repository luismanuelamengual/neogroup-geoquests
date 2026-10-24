/**
 * Anti-cheat of the detective mode: the window lost the focus while the case
 * was open (e.g. to search a clue on Google or ask an AI). The thief escapes:
 * the case ends (outcome "lostFocus").
 */
export interface LostFocusAction {
  type: 'lostFocus'
}
