import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleView from '@/app/(public)/components/ArticleView'
import { MODE_GUIDES } from '@/app/(public)/data/modeGuides'
import { findArticle } from '@/app/(public)/utils/articles'
import { publicPageMetadata } from '@/app/(public)/utils/metadata'
import { getLocale } from '@/app/i18n/server'

type Params = Promise<{ slug: string }>

export const dynamicParams = false

export function generateStaticParams() {
  return MODE_GUIDES.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const guide = findArticle(MODE_GUIDES, (await params).slug)

  if (!guide) {
    return {}
  }

  const text = guide.text[await getLocale()]

  return publicPageMetadata({
    title: text.title,
    description: text.description,
    path: `/how-to-play/${guide.slug}`,
    image: guide.image,
    type: 'article'
  })
}

/** Rules of a game mode (/how-to-play/classic, /how-to-play/detective...). */
export default async function ModeGuidePage({ params }: { params: Params }) {
  const { slug } = await params
  const guide = findArticle(MODE_GUIDES, slug)

  if (!guide) {
    notFound()
  }

  return (
    <ArticleView
      article={guide}
      basePath="/how-to-play"
      backLabelKey="publicSite.nav.howToPlay"
      related={MODE_GUIDES.filter((other) => other.slug !== slug)}
    />
  )
}
