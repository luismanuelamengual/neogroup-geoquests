import type { Metadata } from 'next'
import ArticleCard from '@/app/(public)/components/ArticleCard'
import { MODE_GUIDES } from '@/app/(public)/data/modeGuides'
import { publicPageMetadata } from '@/app/(public)/utils/metadata'
import { getLocale, getT } from '@/app/i18n/server'

const BASICS = ['look', 'clues', 'pin', 'score'] as const

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return publicPageMetadata({
    title: t('metadata.howToPlay'),
    description: t('howToPlayPage.description'),
    path: '/how-to-play'
  })
}

/** "How to play": the basics of a round, the scoring and a link to the rules of every mode. */
export default async function HowToPlayPage() {
  const t = await getT()
  const locale = await getLocale()

  return (
    <article>
      <h1>{t('howToPlayPage.title')}</h1>
      <p>{t('howToPlayPage.intro')}</p>
      <h2>{t('howToPlayPage.basicsTitle')}</h2>
      <ol>
        {BASICS.map((step) => (
          <li key={step}>{t(`howToPlayPage.basics.${step}`)}</li>
        ))}
      </ol>
      <h2>{t('howToPlayPage.scoringTitle')}</h2>
      <p>{t('howToPlayPage.scoringText')}</p>
      <h2>{t('howToPlayPage.modesTitle')}</h2>
      <div className="card-grid">
        {MODE_GUIDES.map((guide) => (
          <ArticleCard key={guide.slug} article={guide} href={`/how-to-play/${guide.slug}`} locale={locale} />
        ))}
      </div>
      <h2>{t('howToPlayPage.progressTitle')}</h2>
      <p>{t('howToPlayPage.progressText')}</p>
    </article>
  )
}
