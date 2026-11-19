import type { Metadata } from 'next'
import ArticleCard from '@/app/(public)/components/ArticleCard'
import { MAP_GUIDES } from '@/app/(public)/data/mapGuides'
import { publicPageMetadata } from '@/app/(public)/utils/metadata'
import { getLocale, getT } from '@/app/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return publicPageMetadata({ title: t('metadata.maps'), description: t('mapsPage.description'), path: '/maps' })
}

/** List of the maps of the game, each linked to its guide. */
export default async function MapsPage() {
  const t = await getT()
  const locale = await getLocale()

  return (
    <article>
      <h1>{t('mapsPage.title')}</h1>
      <p>{t('mapsPage.intro')}</p>
      <div className="card-grid">
        {MAP_GUIDES.map((guide) => (
          <ArticleCard key={guide.slug} article={guide} href={`/maps/${guide.slug}`} locale={locale} />
        ))}
      </div>
    </article>
  )
}
