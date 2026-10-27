import type { Metadata } from 'next'
import { publicPageMetadata } from '@/app/(public)/utils/metadata'
import { LOCALE_TAGS } from '@/app/i18n/config'
import { getLocale, getT } from '@/app/i18n/server'
import { CONTACT_EMAIL, TERMS_UPDATED_AT } from '@/app/utils/legal'

const SECTIONS = ['service', 'account', 'conduct', 'content', 'ads', 'availability', 'changes'] as const

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT()

  return publicPageMetadata({ title: t('metadata.terms'), description: t('metadata.termsDescription'), path: '/terms' })
}

/** Terms of use. Public, signed in or not. */
export default async function TermsPage() {
  const t = await getT()
  const locale = await getLocale()
  const updatedAt = TERMS_UPDATED_AT.toLocaleDateString(LOCALE_TAGS[locale], { dateStyle: 'long', timeZone: 'UTC' })

  return (
    <article>
      <h1>{t('legal.terms.title')}</h1>
      <p className="updated">{t('legal.updatedAt', { date: updatedAt })}</p>
      <p>{t('legal.terms.intro')}</p>
      {SECTIONS.map((section) => (
        <section key={section}>
          <h2>{t(`legal.terms.${section}.title`)}</h2>
          <p>{t(`legal.terms.${section}.text`, { email: CONTACT_EMAIL })}</p>
        </section>
      ))}
    </article>
  )
}
