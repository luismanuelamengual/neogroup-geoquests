import './index.scss'
import Link from 'next/link'
import LanguageSwitch from '@/app/(public)/components/LanguageSwitch'
import GameButton from '@/app/components/GameButton'
import Logo from '@/app/components/Logo'
import { getLocale, getT } from '@/app/i18n/server'

const LINKS = [
  { href: '/how-to-play', labelKey: 'publicSite.nav.howToPlay' },
  { href: '/guides', labelKey: 'publicSite.nav.guides' },
  { href: '/about', labelKey: 'publicSite.nav.about' }
] as const

/**
 * Top bar of the public site (landing, guides, rules, legal pages): the logo,
 * the links to the editorial sections, the language (only signed out: a
 * signed-in player has it in the profile) and the way into the game.
 */
export default async function PublicHeader({ signedIn }: { signedIn: boolean }) {
  const t = await getT()
  const locale = await getLocale()

  return (
    <header className="public-header">
      <Link href="/" className="brand" aria-label="GeoQuests">
        <Logo size="small" />
      </Link>
      <nav className="links">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="link">
            {t(link.labelKey)}
          </Link>
        ))}
      </nav>
      <div className="header-actions">
        {!signedIn && <LanguageSwitch locale={locale} label={t('publicSite.language')} />}
        <GameButton size="small" href={signedIn ? '/play' : '/login'}>
          {t('publicSite.nav.play')}
        </GameButton>
      </div>
    </header>
  )
}
