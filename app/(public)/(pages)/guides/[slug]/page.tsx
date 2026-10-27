import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleView from '@/app/(public)/components/ArticleView'
import { GUIDES } from '@/app/(public)/data/guides'
import { findArticle } from '@/app/(public)/utils/articles'
import { publicPageMetadata } from '@/app/(public)/utils/metadata'
import { getLocale } from '@/app/i18n/server'

type Params = Promise<{ slug: string }>

/** Guides linked at the end of each guide. */
const RELATED_GUIDES = 3

export const dynamicParams = false

export function generateStaticParams() {
  return GUIDES.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const guide = findArticle(GUIDES, (await params).slug)

  if (!guide) {
    return {}
  }

  const text = guide.text[await getLocale()]

  return publicPageMetadata({
    title: text.title,
    description: text.description,
    path: `/guides/${guide.slug}`,
    type: 'article'
  })
}

/** A geography guide (/guides/street-clues...). */
export default async function GuidePage({ params }: { params: Params }) {
  const { slug } = await params
  const guide = findArticle(GUIDES, slug)

  if (!guide) {
    notFound()
  }

  // The next guides of the list (going around), so every guide links to others.
  const index = GUIDES.indexOf(guide)
  const related = Array.from({ length: Math.min(RELATED_GUIDES, GUIDES.length - 1) }, (_, offset) => {
    return GUIDES[(index + offset + 1) % GUIDES.length] as (typeof GUIDES)[number]
  })

  return <ArticleView article={guide} basePath="/guides" backLabelKey="publicSite.nav.guides" related={related} />
}
