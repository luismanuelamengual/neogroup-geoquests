import './index.scss'
import Image from 'next/image'
import Link from 'next/link'
import ArticleCard from '@/app/(public)/components/ArticleCard'
import PublicFooter from '@/app/(public)/components/PublicFooter'
import PublicHeader from '@/app/(public)/components/PublicHeader'
import { GUIDES } from '@/app/(public)/data/guides'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'
import Logo from '@/app/components/Logo'
import { getLocale, getT } from '@/app/i18n/server'

const STEPS = [
  { icon: '👀', titleKey: 'landing.steps.look.title', textKey: 'landing.steps.look.text' },
  { icon: '📍', titleKey: 'landing.steps.mark.title', textKey: 'landing.steps.mark.text' },
  { icon: '🏆', titleKey: 'landing.steps.score.title', textKey: 'landing.steps.score.text' }
] as const
/** Game modes of the landing, each linked to its rules (/how-to-play/<slug>). */
const MODES = [
  { slug: 'classic', image: '/modes/classic.png', nameKey: 'modes.classic.name', textKey: 'modes.classic.description' },
  { slug: 'daily-challenge', image: '/modes/classic.png', nameKey: 'daily.title', textKey: 'daily.subtitle' },
  {
    slug: 'multiplayer',
    image: '/modes/multiplayer.png',
    nameKey: 'modes.friends.name',
    textKey: 'modes.friends.description'
  },
  {
    slug: 'battle-royale',
    image: '/modes/battle-royale.png',
    nameKey: 'modes.battle-royale.name',
    textKey: 'modes.battle-royale.description'
  },
  {
    slug: 'detective',
    image: '/modes/detective.png',
    nameKey: 'modes.detective.name',
    textKey: 'modes.detective.description'
  }
] as const
/** Maps of the game (their name and description are in the dictionaries, under maps.<slug>). */
const MAPS = [
  'famous-cities',
  'world-cities',
  'landmarks',
  'latin-america',
  'europe',
  'argentina',
  'spain',
  'united-states'
] as const
const FAQ = ['free', 'account', 'devices', 'friends', 'learn'] as const
/** Guides shown on the landing (the first ones of the guides page). */
const LANDING_GUIDES = 3

/**
 * Public landing page (signed-out visitors): what the game is, its modes and
 * maps, the latest guides and the frequent questions, so a visitor (or a
 * search engine) understands the game without signing in.
 */
export default async function LandingPage() {
  const t = await getT()
  const locale = await getLocale()

  return (
    <div className="landing-page">
      <PublicHeader signedIn={false} />
      <main className="landing-content">
        <section className="hero">
          <Logo size="large" className="logo" />
          <h1 className="tagline">{t('landing.tagline')}</h1>
          <div className="actions">
            <GameButton size="large" href="/login">
              {t('landing.playFree')}
            </GameButton>
            <GameButton size="large" color="ghost" href="/how-to-play">
              {t('landing.howToPlay')}
            </GameButton>
          </div>
        </section>
        <section className="intro">
          <h2>{t('landing.intro.title')}</h2>
          <p>{t('landing.intro.p1')}</p>
          <p>{t('landing.intro.p2')}</p>
        </section>
        <section className="block">
          <h2>{t('landing.stepsTitle')}</h2>
          <div className="steps">
            {STEPS.map((step, index) => (
              <GamePanel
                key={step.titleKey}
                className="step"
                title={`${index + 1}. ${t(step.titleKey)}`}
                accent={index === 1 ? 'magenta' : index === 2 ? 'lime' : 'cyan'}
              >
                <div className="icon">{step.icon}</div>
                <p>{t(step.textKey)}</p>
              </GamePanel>
            ))}
          </div>
        </section>
        <section className="block">
          <h2>{t('landing.modesTitle')}</h2>
          <p className="section-intro">{t('landing.modesIntro')}</p>
          <div className="modes">
            {MODES.map((mode) => (
              <Link key={mode.slug} href={`/how-to-play/${mode.slug}`} className="mode">
                <Image src={mode.image} alt={t(mode.nameKey)} width={800} height={400} className="image" />
                <span className="name">{t(mode.nameKey)}</span>
                <span className="text">{t(mode.textKey)}</span>
                <span className="more">{t('landing.readRules')} →</span>
              </Link>
            ))}
          </div>
        </section>
        <section className="block">
          <h2>{t('landing.mapsTitle')}</h2>
          <p className="section-intro">{t('landing.mapsIntro')}</p>
          <ul className="maps">
            {MAPS.map((slug) => (
              <li key={slug}>
                <strong>{t(`maps.${slug}.name`)}</strong>
                <span>{t(`maps.${slug}.description`)}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="block">
          <h2>{t('landing.guidesTitle')}</h2>
          <p className="section-intro">{t('landing.guidesIntro')}</p>
          <div className="guides">
            {GUIDES.slice(0, LANDING_GUIDES).map((guide) => (
              <ArticleCard key={guide.slug} article={guide} href={`/guides/${guide.slug}`} locale={locale} />
            ))}
          </div>
          <p className="see-all">
            <Link href="/guides" className="text-link">
              {t('landing.seeAllGuides')} →
            </Link>
          </p>
        </section>
        <section className="block faq">
          <h2>{t('landing.faqTitle')}</h2>
          {FAQ.map((question) => (
            <details key={question}>
              <summary>{t(`landing.faq.${question}.question`)}</summary>
              <p>{t(`landing.faq.${question}.answer`)}</p>
            </details>
          ))}
        </section>
        <section className="cta">
          <h2>{t('landing.ctaTitle')}</h2>
          <p>{t('landing.ctaText')}</p>
          <GameButton size="large" href="/register">
            {t('landing.playFree')}
          </GameButton>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}
