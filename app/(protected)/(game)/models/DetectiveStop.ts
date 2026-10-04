import { DetectivePlace } from '@/app/(protected)/(game)/models/DetectivePlace'

/** A place of the suspect's route, with the Street View panorama shown there ("the suspect's eyes"). */
export interface DetectiveStop extends DetectivePlace {
  panoId: string
}
