import { QuestModeView } from '@/app/(protected)/(game)/models/QuestModeView'

/** A quest as shown in the main menu, with the game modes it offers. */
export interface QuestView {
  id: number
  name: string
  description: string
  image: string | null
  placesCount: number
  modes: QuestModeView[]
}
