import { Place } from '@/app/(protected)/(game)/models/Place'
import { Quest } from '@/app/(protected)/(game)/models/Quest'
import { QuestPlace } from '@/app/(protected)/(game)/models/QuestPlace'
import { QuestView } from '@/app/(protected)/(game)/models/QuestView'
import { MAX_ROUND_SCORE } from '@/app/(protected)/(game)/utils/score'

/** Enabled quest by id, or null. */
export async function findQuest(questId: number): Promise<Quest | null> {
  return Number.isInteger(questId) ? Quest.where('id', questId).where('enabled', true).first() : null
}

/**
 * Enabled places of a quest (linked through `quest_place`).
 *
 * Read through the QuestPlace entity, not a raw `DB.table()` query: on
 * PostgreSQL the columns are created unquoted and folded to lower case
 * (`placeid`), so raw rows don't have camelCase keys — entities map them.
 */
export async function getQuestPlaces(questId: number): Promise<Place[]> {
  const links = await QuestPlace.where('questId', questId).get()
  const placeIds = links.map((link) => link.placeId)

  if (placeIds.length === 0) {
    return []
  }

  return Place.whereIn('id', placeIds).where('enabled', true).orderBy('id').get()
}

/** The quests of the main menu: every enabled quest with at least one enabled place. */
export async function getQuests(): Promise<QuestView[]> {
  const quests = await Quest.where('enabled', true).orderBy('id').get()
  const views = await Promise.all(
    quests.map(async (quest) => ({
      id: quest.id,
      name: quest.name,
      description: quest.description,
      rounds: quest.rounds,
      time: quest.time,
      image: quest.image,
      placesCount: (await getQuestPlaces(quest.id)).length,
      maxScore: quest.rounds * MAX_ROUND_SCORE
    }))
  )

  return views.filter((view) => view.placesCount > 0)
}
