import { battleRoyaleGuide } from '@/app/(public)/data/modeGuides/battleRoyale'
import { classicGuide } from '@/app/(public)/data/modeGuides/classic'
import { dailyChallengeGuide } from '@/app/(public)/data/modeGuides/dailyChallenge'
import { detectiveGuide } from '@/app/(public)/data/modeGuides/detective'
import { multiplayerGuide } from '@/app/(public)/data/modeGuides/multiplayer'
import { Article } from '@/app/(public)/models/Article'

/** Rules of each game mode (/how-to-play/<slug>), in the order of the "How to play" page. */
export const MODE_GUIDES: Article[] = [
  classicGuide,
  dailyChallengeGuide,
  multiplayerGuide,
  battleRoyaleGuide,
  detectiveGuide
]
