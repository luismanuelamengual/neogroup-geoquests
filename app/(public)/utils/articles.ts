import { Article } from '@/app/(public)/models/Article'
import { Locale, LOCALE_TAGS } from '@/app/i18n/config'

/** Words of an article in a language, to estimate its reading time. */
function countWords(article: Article, locale: Locale): number {
  const { title, sections } = article.text[locale]
  const texts = [
    title,
    ...sections.flatMap((section) => [section.title ?? '', ...section.paragraphs, ...(section.list ?? [])])
  ]

  return texts.join(' ').split(/\s+/).filter(Boolean).length
}

/** Minutes it takes to read an article (220 words per minute, at least 1). */
export function getReadingMinutes(article: Article, locale: Locale): number {
  return Math.max(1, Math.round(countWords(article, locale) / 220))
}

/** "26 de octubre de 2026" / "October 26, 2026". */
export function formatArticleDate(isoDate: string, locale: Locale): string {
  return new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(LOCALE_TAGS[locale], {
    dateStyle: 'long',
    timeZone: 'UTC'
  })
}

export function findArticle(articles: Article[], slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug)
}
