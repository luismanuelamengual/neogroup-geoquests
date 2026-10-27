import './index.scss'
import Link from 'next/link'
import Logo from '@/app/components/Logo'
import { getT } from '@/app/i18n/server'

/** Footer of the public site: links to every editorial and legal page, and the image credits. */
export default async function PublicFooter() {
  const t = await getT()

  return (
    <footer className="public-footer">
      <div className="columns">
        <div className="about">
          <Logo size="small" />
          <p>{t('publicSite.footer.tagline')}</p>
        </div>
        <nav>
          <h2>{t('publicSite.footer.game')}</h2>
          <Link href="/how-to-play">{t('publicSite.nav.howToPlay')}</Link>
          <Link href="/guides">{t('publicSite.nav.guides')}</Link>
          <Link href="/login">{t('publicSite.nav.play')}</Link>
        </nav>
        <nav>
          <h2>{t('publicSite.footer.info')}</h2>
          <Link href="/about">{t('publicSite.nav.about')}</Link>
          <Link href="/contact">{t('publicSite.footer.contact')}</Link>
          <Link href="/privacy">{t('publicSite.footer.privacy')}</Link>
          <Link href="/terms">{t('publicSite.footer.terms')}</Link>
          <Link href="/delete-account">{t('publicSite.footer.deleteAccount')}</Link>
        </nav>
      </div>
      <p className="credits">{t('landing.credits')}</p>
    </footer>
  )
}
