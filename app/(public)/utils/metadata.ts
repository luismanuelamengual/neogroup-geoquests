import type { Metadata } from 'next'

/**
 * Metadata of a public (indexable) page: its title and description, the
 * canonical URL and the Open Graph card. `title` goes through the template of
 * the root layout ("<title> · GeoQuests") unless `absoluteTitle` is set.
 */
export function publicPageMetadata({
  title,
  description,
  path,
  absoluteTitle,
  image = '/modes/classic.png',
  type = 'website'
}: {
  title: string
  description: string
  path: string
  absoluteTitle?: boolean
  image?: string
  type?: 'website' | 'article'
}): Metadata {
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      type,
      siteName: 'GeoQuests',
      images: [{ url: image, width: 800, height: 400 }]
    },
    twitter: { card: 'summary_large_image', title, description, images: [image] }
  }
}
