import type { Metadata } from 'next'
import ArticleCard from '@/app/(public)/components/ArticleCard'
import { GUIDES } from '@/app/(public)/data/guides'
import { publicPageMetadata } from '@/app/(public)/utils/metadata'
import { getLocale, getT } from '@/app/i18n/server'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return publicPageMetadata({ title: t('metadata.guides'), description: t('guidesPage.description'), path: '/guides' })
}

/** List of the geography guides and game tips. */
export default async function GuidesPage() {
  const t = await getT()
  const locale = await getLocale()

  return (
    <article>
      <h1>{t('guidesPage.title')}</h1>
      <p>{t('guidesPage.intro')}</p>
      <div className="card-grid">
        {GUIDES.map((guide) => (
          <ArticleCard key={guide.slug} article={guide} href={`/guides/${guide.slug}`} locale={locale} />
        ))}
      </div>
    </article>
  )
}
