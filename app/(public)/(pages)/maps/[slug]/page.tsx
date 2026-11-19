import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getMapPhotos } from '@/app/(protected)/(game)/utils/mapPhotos'
import ArticleView from '@/app/(public)/components/ArticleView'
import { MAP_GUIDES } from '@/app/(public)/data/mapGuides'
import { findArticle } from '@/app/(public)/utils/articles'
import { publicPageMetadata } from '@/app/(public)/utils/metadata'
import { getLocale } from '@/app/i18n/server'

type Params = Promise<{ slug: string }>

export const dynamicParams = false

export function generateStaticParams() {
  return MAP_GUIDES.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const guide = findArticle(MAP_GUIDES, (await params).slug)

  if (!guide) {
    return {}
  }

  const text = guide.text[await getLocale()]

  return publicPageMetadata({
    title: text.title,
    description: text.description,
    path: `/maps/${guide.slug}`,
    image: getMapPhotos(guide.slug)[0]?.src,
    type: 'article'
  })
}

/** Guide of a map of the game (/maps/famous-cities, /maps/argentina...), with the photos of its card. */
export default async function MapGuidePage({ params }: { params: Params }) {
  const { slug } = await params
  const guide = findArticle(MAP_GUIDES, slug)

  if (!guide) {
    notFound()
  }

  return (
    <ArticleView
      article={guide}
      basePath="/maps"
      backLabelKey="publicSite.nav.maps"
      playLabelKey="publicSite.playThisMap"
      photos={getMapPhotos(slug)}
      related={MAP_GUIDES.filter((other) => other.slug !== slug).slice(0, 3)}
    />
  )
}
