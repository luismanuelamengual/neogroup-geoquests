import type { MetadataRoute } from 'next'
import { GUIDES } from '@/app/(public)/data/guides'
import { MODE_GUIDES } from '@/app/(public)/data/modeGuides'
import { PRIVACY_POLICY_UPDATED_AT, TERMS_UPDATED_AT } from '@/app/utils/legal'
import { SITE_URL } from '@/app/utils/urls'

/** Date of the last change of the pages without a date of their own (landing, about, contact...). */
const SITE_UPDATED_AT = new Date('2026-10-26T00:00:00Z')

/** /sitemap.xml: every public, indexable page (the game itself needs a session). */
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, lastModified: Date, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path}`,
    lastModified,
    priority
  })

  return [
    page('/', SITE_UPDATED_AT, 1),
    page('/how-to-play', SITE_UPDATED_AT, 0.9),
    ...MODE_GUIDES.map((guide) => page(`/how-to-play/${guide.slug}`, new Date(guide.updatedAt), 0.8)),
    page('/guides', SITE_UPDATED_AT, 0.9),
    ...GUIDES.map((guide) => page(`/guides/${guide.slug}`, new Date(guide.updatedAt), 0.8)),
    page('/about', SITE_UPDATED_AT, 0.5),
    page('/contact', SITE_UPDATED_AT, 0.5),
    page('/privacy', PRIVACY_POLICY_UPDATED_AT, 0.3),
    page('/terms', TERMS_UPDATED_AT, 0.3)
  ]
}
