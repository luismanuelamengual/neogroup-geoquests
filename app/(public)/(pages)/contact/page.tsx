import type { Metadata } from 'next'
import Link from 'next/link'
import { publicPageMetadata } from '@/app/(public)/utils/metadata'
import { getT } from '@/app/i18n/server'
import { CONTACT_EMAIL } from '@/app/utils/legal'

const TOPICS = ['support', 'bugs', 'ideas', 'privacy', 'education'] as const

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return publicPageMetadata({
    title: t('metadata.contact'),
    description: t('contactPage.description'),
    path: '/contact'
  })
}

/** How to reach the people behind GeoQuests. */
export default async function ContactPage() {
  const t = await getT()
  const [beforeEmail, afterEmail] = t('contactPage.intro').split('{email}')

  return (
    <article>
      <h1>{t('contactPage.title')}</h1>
      <p>
        {beforeEmail}
        <a href={`mailto:${CONTACT_EMAIL}`} className="text-link">
          {CONTACT_EMAIL}
        </a>
        {afterEmail}
      </p>
      <h2>{t('contactPage.topicsTitle')}</h2>
      <ul>
        {TOPICS.map((topic) => (
          <li key={topic}>{t(`contactPage.topics.${topic}`)}</li>
        ))}
      </ul>
      <h2>{t('contactPage.deleteTitle')}</h2>
      <p>{t('contactPage.deleteText')}</p>
      <p>
        <Link href="/delete-account" className="text-link">
          {t('contactPage.deleteLink')}
        </Link>
      </p>
    </article>
  )
}
