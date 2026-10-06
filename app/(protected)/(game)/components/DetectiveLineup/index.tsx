'use client'

import './index.scss'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import GavelIcon from '@mui/icons-material/Gavel'
import classNames from 'classnames'
import { useState } from 'react'
import DetectiveHud from '@/app/(protected)/(game)/components/DetectiveHud'
import StreetView from '@/app/(protected)/(game)/components/StreetView'
import WitnessAvatar from '@/app/(protected)/(game)/components/WitnessAvatar'
import { DetectiveGameView } from '@/app/(protected)/(game)/models/DetectiveGameView'
import { SUSPECT_ROLE } from '@/app/(protected)/(game)/utils/suspects'
import GameButton from '@/app/components/GameButton'
import { useT } from '@/app/i18n/I18nProvider'

/** Letters of the suspects. */
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

interface DetectiveLineupProps {
  view: DetectiveGameView
  /** The detective points at a suspect (the case ends: the server says whether it was the thief). */
  onAccuse: (suspect: number) => Promise<void>
  /** The case is closed: shows who the thief was instead of asking. */
  revealed?: boolean
  /** Leaves the reveal (to the summary of the case). */
  onContinue?: () => void
}

/**
 * The end of a case: the detective is at the last stop, in time, and the
 * thief is among a few suspects. The only help are the traits the witnesses
 * told along the case (nothing reminds them here: the detective has to
 * remember). Pointing at one ends the case; then the thief is revealed.
 */
export default function DetectiveLineup({ view, onAccuse, revealed, onContinue }: DetectiveLineupProps) {
  const t = useT()
  const lineup = view.lineup!
  const [selected, setSelected] = useState<number | null>(null)
  const [accusing, setAccusing] = useState(false)
  const caught = revealed && lineup.accused === lineup.thief

  const handleAccuse = async () => {
    if (selected === null) {
      return
    }

    setAccusing(true)

    try {
      await onAccuse(selected)
    } catch {
      setAccusing(false)
    }
  }

  return (
    <div className="detective-lineup">
      <StreetView panoId={lineup.panoId} />
      <DetectiveHud view={view} />
      <div className={classNames('panel', { revealed, caught, missed: revealed && !caught })}>
        <h2 className="title">
          {revealed
            ? t(caught ? 'detective.lineup.caughtTitle' : 'detective.lineup.wrongTitle')
            : t('detective.lineup.title')}
        </h2>
        <p className="subtitle">
          {revealed
            ? t(caught ? 'detective.lineup.caughtText' : 'detective.lineup.wrongText', {
                letter: LETTERS[lineup.thief!]
              })
            : t('detective.lineup.subtitle')}
        </p>
        <ul className="suspects">
          {lineup.suspects.map((seed, index) => {
            const isThief = revealed && index === lineup.thief
            const isAccused = revealed && index === lineup.accused

            return (
              <li key={seed}>
                <button
                  type="button"
                  className={classNames('suspect', {
                    selected: !revealed && index === selected,
                    thief: isThief,
                    wrong: isAccused && !isThief,
                    dimmed: revealed && !isThief && !isAccused
                  })}
                  disabled={revealed || accusing}
                  aria-pressed={!revealed ? index === selected : undefined}
                  onClick={() => setSelected(index)}
                >
                  <WitnessAvatar
                    seed={seed}
                    role={SUSPECT_ROLE}
                    suspect
                    expression={isThief ? 'smile' : 'neutral'}
                    size={120}
                    className="avatar"
                  />
                  <span className="letter">{t('detective.lineup.suspect', { letter: LETTERS[index] })}</span>
                  {(isThief || isAccused) && (
                    <span className="tag">
                      {t(isThief ? 'detective.lineup.thiefTag' : 'detective.lineup.accusedTag')}
                    </span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
        {revealed ? (
          <GameButton
            size="large"
            color={caught ? 'lime' : 'magenta'}
            endIcon={<ArrowForwardIcon />}
            onClick={onContinue}
          >
            {t('detective.lineup.seeSummary')}
          </GameButton>
        ) : (
          <GameButton
            size="large"
            startIcon={<GavelIcon />}
            disabled={selected === null}
            loading={accusing}
            onClick={handleAccuse}
          >
            {selected === null
              ? t('detective.lineup.choose')
              : t('detective.lineup.accuse', { letter: LETTERS[selected] })}
          </GameButton>
        )}
      </div>
    </div>
  )
}
