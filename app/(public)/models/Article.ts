import { Locale } from '@/app/i18n/config'

/** A block of an article: an optional heading, its paragraphs and an optional bullet list after them. */
export interface ArticleSection {
  title?: string
  paragraphs: string[]
  list?: string[]
}

/** Text of an article in one language. */
export interface ArticleText {
  title: string
  /** Summary shown in the cards and in the meta description (one or two sentences). */
  description: string
  sections: ArticleSection[]
}

/**
 * Editorial page of the public site: a guide (/guides/<slug>) or the rules of
 * a game mode (/how-to-play/<slug>). The text is written in every language.
 */
export interface Article {
  /** Stable part of the URL, in English. */
  slug: string
  /** Emoji of the cards. */
  icon: string
  /** Illustration under /public (the game modes have one). */
  image?: string
  /** Where the game of the article is played (the button at the end). */
  playPath?: string
  /** ISO dates (YYYY-MM-DD) of the first publication and the last change. */
  publishedAt: string
  updatedAt: string
  text: Record<Locale, ArticleText>
}
