import { describe, expect, it } from 'vitest'
import { buildShareText, getRoundSquare } from '@/app/(protected)/(game)/utils/share'

describe('share text', () => {
  it('colors every round by its score', () => {
    expect([5000, 4000, 3999, 2000, 1999, 1, 0, null].map(getRoundSquare)).toEqual([
      '🟩',
      '🟩',
      '🟨',
      '🟨',
      '🟧',
      '🟧',
      '🟥',
      '🟥'
    ])
  })

  it('builds the text with the title, the score, the rounds, the streak and the link', () => {
    expect(
      buildShareText({
        title: 'GeoQuests diario #12',
        scoreLine: '21.430 / 25.000 pts',
        roundScores: [4900, 4500, 2500, 4100, 0],
        streakLine: '🔥 Racha: 12 días',
        url: 'https://geoquests.app'
      })
    ).toBe('GeoQuests diario #12 🌍\n21.430 / 25.000 pts\n🟩🟩🟨🟩🟥\n🔥 Racha: 12 días\nhttps://geoquests.app')
  })

  it('leaves out the streak line when there is none', () => {
    expect(buildShareText({ title: 'T', scoreLine: 'S', roundScores: [100], streakLine: null, url: 'https://x' })).toBe(
      'T 🌍\nS\n🟧\nhttps://x'
    )
  })
})
