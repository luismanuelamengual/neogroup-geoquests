import type { MessageKey } from '@/app/i18n/messages'
import type { Translator } from '@/app/i18n/translate'

/**
 * The name and description of a map are not stored in the database: they are
 * in the i18n dictionaries, under the slug of the map (`maps.<slug>.name` and
 * `maps.<slug>.description`). A map with no entry (e.g. one added to the
 * database but not to the dictionaries yet) falls back to `fallback`.
 */
function getMapField(t: Translator, slug: string, field: 'name' | 'description', fallback: string): string {
  const key = `maps.${slug}.${field}` as MessageKey
  const translated = t(key)

  return translated === key ? fallback : translated
}

/** Name of a map in the language of `t` (its slug when it has no translation). */
export function getMapName(t: Translator, slug: string): string
export function getMapName(t: Translator, slug: string | null): string | null

export function getMapName(t: Translator, slug: string | null): string | null {
  return slug == null ? null : getMapField(t, slug, 'name', slug)
}

/** Description of a map in the language of `t` (empty when it has no translation). */
export function getMapDescription(t: Translator, slug: string): string {
  return getMapField(t, slug, 'description', '')
}
