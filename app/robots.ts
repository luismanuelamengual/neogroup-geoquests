import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/app/utils/urls'

/**
 * /robots.txt: the public pages are crawlable; the API and the pages of the
 * game (they need a session, a crawler only gets the login redirect) are not,
 * except for the AdSense crawler.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/play',
          '/multiplayer',
          '/game/',
          '/join/',
          '/account',
          '/progress',
          '/achievements',
          '/ranking',
          '/dev/'
        ]
      },
      // The AdSense crawler may visit every page that can show ads.
      { userAgent: 'Mediapartners-Google', allow: '/' }
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  }
}
