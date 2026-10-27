import { languagesAndScriptsGuide } from '@/app/(public)/data/guides/languagesAndScripts'
import { latinAmericaGuide } from '@/app/(public)/data/guides/latinAmerica'
import { pinStrategyGuide } from '@/app/(public)/data/guides/pinStrategy'
import { practicePlanGuide } from '@/app/(public)/data/guides/practicePlan'
import { readingTheLandscapeGuide } from '@/app/(public)/data/guides/readingTheLandscape'
import { streetCluesGuide } from '@/app/(public)/data/guides/streetClues'
import { Article } from '@/app/(public)/models/Article'

/**
 * Geography guides and game tips (/guides/<slug>), in the order of the guides
 * page. Add a new one in its own file and list it here: the sitemap, the
 * landing and the guides page pick it up.
 */
export const GUIDES: Article[] = [
  streetCluesGuide,
  pinStrategyGuide,
  languagesAndScriptsGuide,
  readingTheLandscapeGuide,
  latinAmericaGuide,
  practicePlanGuide
]
