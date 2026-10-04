'use client'

import './index.scss'
import CasinoIcon from '@mui/icons-material/Casino'
import classNames from 'classnames'
import { useMemo, useState } from 'react'
import SpeechBubble from '@/app/(protected)/(game)/components/SpeechBubble'
import WitnessAvatar from '@/app/(protected)/(game)/components/WitnessAvatar'
import { LANDMARK_CLUES } from '@/app/(protected)/(game)/data/landmarkClues'
import { WITNESS_ROLES } from '@/app/(protected)/(game)/models/WitnessRole'
import { generateWitness } from '@/app/(protected)/(game)/utils/witnesses'
import { getWitnessIntro, getWitnessRoleName } from '@/app/(protected)/(game)/utils/witnessText'
import GameButton from '@/app/components/GameButton'
import { useI18n } from '@/app/i18n/I18nProvider'

/** Seeds of a new set of random witnesses. */
function randomWitnessSeeds(count = 30): number[] {
  return Array.from({ length: count }, () => Math.floor(Math.random() * 2 ** 31))
}

/**
 * Development page of the witnesses (/dev/witnesses): many random witnesses
 * to review the character generator. Tapping one makes it say a random clue.
 */
export default function WitnessGallery({ initialSeeds }: { initialSeeds: number[] }) {
  const { t, locale } = useI18n()
  const [seeds, setSeeds] = useState(initialSeeds)
  const [active, setActive] = useState<number | null>(null)
  const [talking, setTalking] = useState(false)
  const clues = useMemo(() => Object.values(LANDMARK_CLUES).flatMap((clue) => clue[locale]), [locale])
  const witnesses = useMemo(
    () =>
      seeds.map((seed, index) => {
        const role = WITNESS_ROLES[index % WITNESS_ROLES.length]

        return { seed, role, traits: generateWitness(seed, role), clue: clues[seed % clues.length] }
      }),
    [seeds, clues]
  )

  const handleSelect = (index: number) => {
    setActive(index)
    setTalking(true)
  }

  return (
    <div className="witness-gallery">
      <header className="header">
        <div>
          <h1 className="title">{t('detective.gallery.title')}</h1>
          <p className="subtitle">{t('detective.gallery.subtitle')}</p>
        </div>
        <GameButton
          onClick={() => {
            setSeeds(randomWitnessSeeds())
            setActive(null)
          }}
          startIcon={<CasinoIcon />}
        >
          {t('detective.gallery.reroll')}
        </GameButton>
      </header>
      <div className="grid">
        {witnesses.map(({ seed, role, traits, clue }, index) => {
          const selected = active === index

          return (
            <button
              key={seed}
              type="button"
              className={classNames('witness', { selected })}
              onClick={() => handleSelect(index)}
            >
              {selected && (
                <SpeechBubble
                  className="bubble"
                  speaker={traits.name}
                  text={`${getWitnessIntro(t, traits.introIndex)} ${clue}`}
                  typing
                  onDone={() => setTalking(false)}
                />
              )}
              <WitnessAvatar
                seed={seed}
                role={role}
                expression={selected ? (talking ? 'talking' : 'smile') : 'neutral'}
                size={130}
              />
              <span className="name">{traits.name}</span>
              <span className="role">{getWitnessRoleName(t, role, traits.presentation)}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
