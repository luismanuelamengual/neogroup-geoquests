import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameModeView } from '@/app/(protected)/(game)/models/GameModeView'
import { GameSettings } from '@/app/(protected)/(game)/models/GameSettings'
import { Place } from '@/app/(protected)/(game)/models/Place'
import { Quest } from '@/app/(protected)/(game)/models/Quest'
import { QuestMode } from '@/app/(protected)/(game)/models/QuestMode'
import { QuestModeView } from '@/app/(protected)/(game)/models/QuestModeView'
import { QuestPlace } from '@/app/(protected)/(game)/models/QuestPlace'
import { QuestView } from '@/app/(protected)/(game)/models/QuestView'
import { findGameModeEngine, getGameModeEngines } from '@/app/(protected)/(game)/services/gameModes'

/** Enabled quest by id, or null. */
export async function findQuest(questId: number): Promise<Quest | null> {
  return Number.isInteger(questId) ? Quest.where('id', questId).where('enabled', true).first() : null
}

/**
 * Enabled places of a quest (linked through `quest_places`).
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

/** A game mode offered by an enabled quest (both enabled), or null. */
export async function findQuestMode(questId: number, mode: GameMode): Promise<QuestMode | null> {
  if (!(await findQuest(questId))) {
    return null
  }

  return QuestMode.where('questId', questId).where('mode', mode).where('enabled', true).first()
}

/** The enabled modes of a quest that have an engine (modes still in development are not offered). */
async function getQuestModeViews(questId: number): Promise<QuestModeView[]> {
  const questModes = await QuestMode.where('questId', questId).where('enabled', true).orderBy('mode').get()

  return questModes.flatMap((questMode) => {
    const engine = findGameModeEngine(questMode.mode)

    if (!engine) {
      return []
    }

    const { definition } = engine

    return [
      {
        mode: definition.mode,
        name: definition.name,
        minPlayers: definition.minPlayers,
        maxPlayers: definition.maxPlayers,
        settings: engine.resolveSettings(questMode.settings ?? {}) as GameSettings
      }
    ]
  })
}

/**
 * The playable quests, with their game modes: every enabled quest with at
 * least one enabled place and one playable mode. With `mode`, only the quests
 * that offer that mode.
 */
export async function getQuests(mode?: GameMode): Promise<QuestView[]> {
  const quests = await Quest.where('enabled', true).orderBy('id').get()
  const views = await Promise.all(
    quests.map(async (quest) => ({
      id: quest.id,
      name: quest.name,
      description: quest.description,
      image: quest.image,
      placesCount: (await getQuestPlaces(quest.id)).length,
      modes: await getQuestModeViews(quest.id)
    }))
  )

  return views.filter(
    (view) =>
      view.placesCount > 0 && view.modes.length > 0 && (mode == null || view.modes.some((item) => item.mode === mode))
  )
}

/** The game modes of the main menu: every registered mode offered by at least one playable quest. */
export async function getGameModes(): Promise<GameModeView[]> {
  const quests = await getQuests()

  return getGameModeEngines()
    .map(({ definition }) => ({
      mode: definition.mode,
      slug: definition.slug,
      name: definition.name,
      description: definition.description,
      image: definition.image,
      minPlayers: definition.minPlayers,
      maxPlayers: definition.maxPlayers,
      questsCount: quests.filter((quest) => quest.modes.some((item) => item.mode === definition.mode)).length
    }))
    .filter((view) => view.questsCount > 0)
    .sort((a, b) => a.mode - b.mode)
}
