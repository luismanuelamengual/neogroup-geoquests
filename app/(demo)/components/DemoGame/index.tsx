'use client'

import './index.scss'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import GuessMap from '@/app/(protected)/(game)/components/GuessMap'
import ResultMap from '@/app/(protected)/(game)/components/ResultMap'
import StreetView from '@/app/(protected)/(game)/components/StreetView'
import { GameRound } from '@/app/(protected)/(game)/models/GameRound'
import { LatLng } from '@/app/(protected)/(game)/models/LatLng'
import { haversineDistance } from '@/app/(protected)/(game)/utils/geo'
import { calculateRoundScore, formatDistance, formatScore, MAX_ROUND_SCORE } from '@/app/(protected)/(game)/utils/score'
import GameButton from '@/app/components/GameButton'
import GamePanel from '@/app/components/GamePanel'
import Loading from '@/app/components/Loading'
import Logo from '@/app/components/Logo'
import { useRequests } from '@/app/hooks/useRequests'
import { useI18n } from '@/app/i18n/I18nProvider'

interface DemoGuess {
  position: LatLng
  distance: number
  score: number
}

type Phase = 'loading' | 'error' | 'guessing' | 'result' | 'summary'

/**
 * The trial game: a few Classic rounds played entirely in the browser (the
 * server only picks the locations), with the standard scoring and no time
 * limit. Ends inviting the visitor to create an account.
 */
export default function DemoGame() {
  const { t, locale } = useI18n()
  const executeRequest = useRequests()
  const [rounds, setRounds] = useState<GameRound[]>([])
  const [guesses, setGuesses] = useState<DemoGuess[]>([])
  const [guess, setGuess] = useState<LatLng | null>(null)
  const [phase, setPhase] = useState<Phase>('loading')
  const start = useCallback(async () => {
    setPhase('loading')
    setGuesses([])
    setGuess(null)

    try {
      setRounds(await executeRequest<GameRound[]>('/api/getDemoRounds', {}, false))
      setPhase('guessing')
    } catch {
      setPhase('error')
    }
  }, [executeRequest])

  useEffect(() => {
    start()
  }, [start])

  const roundIndex = guesses.length - (phase === 'result' ? 1 : 0)
  const round = rounds[Math.min(roundIndex, rounds.length - 1)]
  const lastGuess = guesses[guesses.length - 1]
  const total = guesses.reduce((sum, { score }) => sum + score, 0)

  function submitGuess() {
    if (!guess || !round) {
      return
    }

    const distance = haversineDistance(guess, round)

    setGuesses((previous) => [...previous, { position: guess, distance, score: calculateRoundScore(distance) }])
    setGuess(null)
    setPhase('result')
  }

  function nextRound() {
    setPhase(guesses.length >= rounds.length ? 'summary' : 'guessing')
  }

  const header = (
    <header className="demo-header">
      <Link href="/" aria-label="GeoQuests">
        <Logo size="small" />
      </Link>
      <span className="badge">{t('demo.badge')}</span>
      {(phase === 'guessing' || phase === 'result') && (
        <span className="round">{t('demo.round', { number: roundIndex + 1, total: rounds.length })}</span>
      )}
    </header>
  )

  if (phase === 'loading') {
    return (
      <div className="demo-game">
        {header}
        <div className="centered">
          <Loading />
          <p>{t('demo.preparing')}</p>
        </div>
      </div>
    )
  }

  if (phase === 'error' || !round) {
    return (
      <div className="demo-game">
        {header}
        <div className="centered">
          <GamePanel className="card">
            <p>{t('demo.error')}</p>
            <GameButton onClick={start}>{t('demo.retry')}</GameButton>
          </GamePanel>
        </div>
      </div>
    )
  }

  if (phase === 'summary') {
    return (
      <div className="demo-game scrollable">
        {header}
        <div className="centered">
          <GamePanel className="card summary" title={t('demo.summaryTitle')}>
            <p className="total">
              {formatScore(total, locale)} <span>/ {formatScore(MAX_ROUND_SCORE * rounds.length, locale)}</span>
            </p>
            <ol className="rounds">
              {rounds.map((played, index) => (
                <li key={played.panoId}>
                  <strong>{played.placeName}</strong>
                  <span>
                    {formatDistance(guesses[index]?.distance ?? 0, locale)} ·{' '}
                    {t('demo.points', { points: formatScore(guesses[index]?.score ?? 0, locale) })}
                  </span>
                </li>
              ))}
            </ol>
            <p>{t('demo.summaryText')}</p>
            <div className="actions">
              <GameButton size="large" href="/register">
                {t('demo.createAccount')}
              </GameButton>
              <GameButton color="ghost" onClick={start}>
                {t('demo.playAgain')}
              </GameButton>
            </div>
            <p className="links">
              <Link href="/how-to-play" className="text-link">
                {t('publicSite.nav.howToPlay')}
              </Link>{' '}
              ·{' '}
              <Link href="/guides" className="text-link">
                {t('publicSite.nav.guides')}
              </Link>
            </p>
          </GamePanel>
        </div>
      </div>
    )
  }

  if (phase === 'result' && lastGuess) {
    return (
      <div className="demo-game">
        {header}
        <ResultMap
          className="result-map"
          pairs={[{ location: round, guesses: [{ position: lastGuess.position }] }]}
          padding={{ top: 90, bottom: 220, left: 50, right: 50 }}
        />
        <GamePanel className="result-panel">
          <p className="place">{round.placeName}</p>
          <p className="score">{t('demo.points', { points: formatScore(lastGuess.score, locale) })}</p>
          <p className="distance">{t('demo.distance', { distance: formatDistance(lastGuess.distance, locale) })}</p>
          <GameButton color="lime" fullWidth onClick={nextRound}>
            {guesses.length >= rounds.length ? t('demo.seeSummary') : t('demo.nextRound')}
          </GameButton>
        </GamePanel>
      </div>
    )
  }

  return (
    <div className="demo-game">
      {header}
      <StreetView panoId={round.panoId} />
      <div className="guess-box">
        <div className="map">
          <GuessMap guess={guess} onGuessChange={setGuess} />
        </div>
        <GameButton color="lime" fullWidth disabled={!guess} onClick={submitGuess}>
          {guess ? t('game.guess') : t('game.markAPoint')}
        </GameButton>
      </div>
    </div>
  )
}
