import './index.scss'
import Image from 'next/image'
import Link from 'next/link'
import { Fragment } from 'react'
import AdSlot from '@/app/(protected)/(ads)/components/AdSlot'
import ArticleCard from '@/app/(public)/components/ArticleCard'
import { Article } from '@/app/(public)/models/Article'
import { formatArticleDate, getReadingMinutes } from '@/app/(public)/utils/articles'
import GameButton from '@/app/components/GameButton'
import { MessageKey } from '@/app/i18n/messages'
import { getLocale, getT } from '@/app/i18n/server'
import { SITE_URL } from '@/app/utils/urls'

/** Sections an article needs to get a second ad in the middle (the first one goes at the end). */
const MIN_SECTIONS_FOR_MIDDLE_AD = 5

interface ArticleViewProps {
  article: Article
  /** Path of the list the article belongs to: /guides or /how-to-play. */
  basePath: string
  backLabelKey: MessageKey
  /** Other articles of the same list, linked at the end. */
  related: Article[]
}

/**
 * A guide or the rules of a mode: the editorial pages of the site, the only
 * ones of the public site with ads (after the text, and in the middle of the
 * long ones).
 */
export default async function ArticleView({ article, basePath, backLabelKey, related }: ArticleViewProps) {
  const t = await getT()
  const locale = await getLocale()
  const text = article.text[locale]
  const middleAdAfter = text.sections.length >= MIN_SECTIONS_FOR_MIDDLE_AD ? Math.floor(text.sections.length / 2) : -1
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: text.title,
    description: text.description,
    inLanguage: locale,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    mainEntityOfPage: `${SITE_URL}${basePath}/${article.slug}`,
    publisher: { '@type': 'Organization', name: 'GeoQuests', url: SITE_URL }
  }

  return (
    <article className="article-view">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <nav className="breadcrumbs">
        <Link href="/">{t('publicSite.home')}</Link>
        <span aria-hidden="true">›</span>
        <Link href={basePath}>{t(backLabelKey)}</Link>
      </nav>
      <h1>
        <span className="icon" aria-hidden="true">
          {article.icon}
        </span>{' '}
        {text.title}
      </h1>
      <p className="meta">
        {t('publicSite.updatedAt', { date: formatArticleDate(article.updatedAt, locale) })} ·{' '}
        {t('publicSite.readingTime', { count: getReadingMinutes(article, locale) })}
      </p>
      <p className="lead">{text.description}</p>
      {article.image && (
        <Image className="illustration" src={article.image} alt={text.title} width={800} height={400} priority />
      )}
      {text.sections.map((section, index) => (
        <Fragment key={index}>
          <section>
            {section.title && <h2>{section.title}</h2>}
            {section.paragraphs.map((paragraph, paragraphIndex) => (
              <p key={paragraphIndex}>{paragraph}</p>
            ))}
            {section.list && (
              <ul>
                {section.list.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            )}
          </section>
          {index === middleAdAfter && <AdSlot className="article-ad" />}
        </Fragment>
      ))}
      {article.playPath && (
        <div className="actions">
          <GameButton href={article.playPath}>{t('publicSite.playThisMode')}</GameButton>
        </div>
      )}
      <AdSlot className="article-ad" />
      {related.length > 0 && (
        <aside className="related">
          <h2>{t('publicSite.keepReading')}</h2>
          <div className="cards">
            {related.map((other) => (
              <ArticleCard key={other.slug} article={other} href={`${basePath}/${other.slug}`} locale={locale} />
            ))}
          </div>
        </aside>
      )}
    </article>
  )
}
