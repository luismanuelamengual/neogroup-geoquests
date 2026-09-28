/** A quest as shown in the main menu. */
export interface QuestView {
  id: number
  name: string
  description: string
  rounds: number
  /** Time limit of each round, in minutes (null = no limit). */
  time: number | null
  image: string | null
  placesCount: number
  /** Best possible score of a game (rounds × max score per round). */
  maxScore: number
}
