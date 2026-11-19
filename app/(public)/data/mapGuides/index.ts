import { argentinaGuide } from '@/app/(public)/data/mapGuides/argentina'
import { europeGuide } from '@/app/(public)/data/mapGuides/europe'
import { famousCitiesGuide } from '@/app/(public)/data/mapGuides/famousCities'
import { landmarksGuide } from '@/app/(public)/data/mapGuides/landmarks'
import { latinAmericaMapGuide } from '@/app/(public)/data/mapGuides/latinAmerica'
import { spainGuide } from '@/app/(public)/data/mapGuides/spain'
import { unitedStatesGuide } from '@/app/(public)/data/mapGuides/unitedStates'
import { worldCitiesGuide } from '@/app/(public)/data/mapGuides/worldCities'
import { Article } from '@/app/(public)/models/Article'

/**
 * Guide of each map of the game (/maps/<slug>, the slug of the map in the
 * database), in the order of the maps page. The photos come from MAP_PHOTOS.
 */
export const MAP_GUIDES: Article[] = [
  famousCitiesGuide,
  worldCitiesGuide,
  landmarksGuide,
  latinAmericaMapGuide,
  europeGuide,
  argentinaGuide,
  spainGuide,
  unitedStatesGuide
]
