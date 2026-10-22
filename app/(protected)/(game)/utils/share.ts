/** The shareable result of a game (Wordle style): one colored square per round, by its score. */

/** Square of a round: 🟩 close, 🟨 in the region, 🟧 far, 🟥 no points. */
export function getRoundSquare(score: number | null): string {
  if (!score || score <= 0) {
    return '🟥'
  }

  if (score >= 4000) {
    return '🟩'
  }

  return score >= 2000 ? '🟨' : '🟧'
}

export interface ShareTextInput {
  /** First line, e.g. "GeoQuests diario #12". */
  title: string
  /** e.g. "21.430 / 25.000 pts". */
  scoreLine: string
  roundScores: (number | null)[]
  /** e.g. "🔥 Racha: 12 días" (null: no streak line). */
  streakLine: string | null
  url: string
}

/** Text to share the result of a game: title, score, the squares of the rounds, the streak and the link. */
export function buildShareText({ title, scoreLine, roundScores, streakLine, url }: ShareTextInput): string {
  return [`${title} 🌍`, scoreLine, roundScores.map(getRoundSquare).join(''), streakLine, url]
    .filter((line): line is string => !!line)
    .join('\n')
}
