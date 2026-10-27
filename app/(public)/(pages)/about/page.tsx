import type { Metadata } from 'next'
import Link from 'next/link'
import { publicPageMetadata } from '@/app/(public)/utils/metadata'
import { getT } from '@/app/i18n/server'
import { CONTACT_EMAIL } from '@/app/utils/legal'

const SECTIONS = ['what', 'who', 'images', 'funding', 'contact'] as const

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return publicPageMetadata({ title: t('metadata.about'), description: t('aboutPage.description'), path: '/about' })
}

/** What GeoQuests is, who makes it and how it is funded. */
export default async function AboutPage() {
  const t = await getT()

  return (
    <article>
      <h1>{t('aboutPage.title')}</h1>
      <p>{t('aboutPage.intro')}</p>
      {SECTIONS.map((section) => (
        <section key={section}>
          <h2>{t(`aboutPage.${section}.title`)}</h2>
          <p>{t(`aboutPage.${section}.text`, { email: CONTACT_EMAIL })}</p>
        </section>
      ))}
      <p className="links">
        <Link href="/how-to-play" className="text-link">
          {t('publicSite.nav.howToPlay')}
        </Link>{' '}
        ·{' '}
        <Link href="/guides" className="text-link">
          {t('publicSite.nav.guides')}
        </Link>{' '}
        ·{' '}
        <Link href="/contact" className="text-link">
          {t('publicSite.footer.contact')}
        </Link>
      </p>
    </article>
  )
}
