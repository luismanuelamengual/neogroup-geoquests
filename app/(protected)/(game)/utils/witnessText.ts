import { SuspectClue } from '@/app/(protected)/(game)/models/SuspectClue'
import { WitnessRole } from '@/app/(protected)/(game)/models/WitnessRole'
import { WitnessPresentation } from '@/app/(protected)/(game)/utils/witnesses'
import type { MessageKey } from '@/app/i18n/messages'
import type { Translator } from '@/app/i18n/translate'

/** Job of a witness as shown to the player ("Camarera", "Taxista"...). */
export function getWitnessRoleName(t: Translator, role: WitnessRole, presentation: WitnessPresentation): string {
  return t(`detective.roles.${role}.${presentation}` as MessageKey)
}

/** Opening line of a witness, said before its clue (index from its traits). */
export function getWitnessIntro(t: Translator, introIndex: number): string {
  return t(`detective.witness.intro${introIndex + 1}` as MessageKey)
}

/** What a witness says of the thief ("Ah, y me fijé que tenía los ojos verdes."). */
export function getSuspectClueText(t: Translator, clue: SuspectClue): string {
  const trait = t(`detective.suspect.clues.${clue.trait}.${clue.value}` as MessageKey)

  return t('detective.witness.suspectLead', { trait })
}
