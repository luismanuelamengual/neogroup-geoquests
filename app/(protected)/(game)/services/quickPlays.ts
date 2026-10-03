import { GameMode } from '@/app/(protected)/(game)/models/GameMode'
import { GameSettingsInput } from '@/app/(protected)/(game)/models/GameSettingsInput'
import { MapView } from '@/app/(protected)/(game)/models/MapView'
import { QuickPlayView } from '@/app/(protected)/(game)/models/QuickPlayView'

/** Rules of every quick game: a classic game of 5 rounds of 3 minutes. */
export const QUICK_PLAY_SETTINGS: Required<GameSettingsInput> = { rounds: 5, timeLimitSeconds: 180 }

/**
 * Quick games of the main menu, in order. Maps are matched by their stored
 * name (the one of the seed: their ids are not fixed).
 */
const QUICK_PLAYS: { key: string; mapName: string }[] = [
  { key: 'famous-cities', mapName: 'Ciudades famosas' },
  { key: 'world-cities', mapName: 'Ciudades del mundo' },
  { key: 'landmarks', mapName: 'Lugares icónicos' }
]

/** The quick games whose map can be played (a disabled or missing map hides its quick game). */
export function getQuickPlays(maps: MapView[]): QuickPlayView[] {
  return QUICK_PLAYS.flatMap(({ key, mapName }) => {
    const map = maps.find((item) => item.name === mapName)

    return map ? [{ key, mode: GameMode.CLASSIC, map, settings: QUICK_PLAY_SETTINGS }] : []
  })
}
