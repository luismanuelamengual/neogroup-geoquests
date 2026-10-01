import { mapSlug } from '@/app/(protected)/(game)/utils/mapPhotos'
import type { MessageKey } from '@/app/i18n/messages'
import type { Translator } from '@/app/i18n/translate'

/**
 * Maps are stored in the database in Spanish. The dictionaries translate the
 * known ones (matched by the slug of their stored name); any other map keeps
 * the text it was stored with.
 */
function localizeMapField(t: Translator, storedName: string, field: 'name' | 'description', stored: string): string {
  const key = `maps.${mapSlug(storedName)}.${field}` as MessageKey
  const translated = t(key)

  return translated === key ? stored : translated
}

/** Name of a map in the language of `t`. */
export function localizeMapName(t: Translator, storedName: string): string
export function localizeMapName(t: Translator, storedName: string | null): string | null

export function localizeMapName(t: Translator, storedName: string | null): string | null {
  return storedName == null ? null : localizeMapField(t, storedName, 'name', storedName)
}

/** Description of a map in the language of `t`. */
export function localizeMapDescription(t: Translator, storedName: string, storedDescription: string): string {
  return localizeMapField(t, storedName, 'description', storedDescription)
}
