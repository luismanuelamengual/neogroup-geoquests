'use client'

import './index.scss'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import classNames from 'classnames'
import Link from 'next/link'
import { useState } from 'react'
import GameModeIcon from '@/app/(protected)/(game)/components/GameModeIcon'
import GameSettingsPicker from '@/app/(protected)/(game)/components/GameSettingsPicker'
import MapCard from '@/app/(protected)/(game)/components/MapCard'
import { GameModeView } from '@/app/(protected)/(game)/models/GameModeView'
import { GameSettingsInput } from '@/app/(protected)/(game)/models/GameSettingsInput'
import { MapView } from '@/app/(protected)/(game)/models/MapView'
import { getModeMenuPath } from '@/app/(protected)/(game)/utils/modeRoutes'
import { useT } from '@/app/i18n/I18nProvider'

/**
 * Second step of the menus (/play/[mode], /multiplayer/[mode]): after
 * choosing the game mode, the player chooses the rules of the game (the ones
 * the mode lets choose: rounds, time per round) and where to play — the maps,
 * as a grid that grows with them.
 */
export default function MapPicker({ mode, maps }: { mode: GameModeView; maps: MapView[] }) {
  const t = useT()
  const multiplayer = mode.maxPlayers > 1
  const [settings, setSettings] = useState<GameSettingsInput>(() => ({
    rounds: 'rounds' in mode.settings ? mode.settings.rounds : undefined,
    timeLimitSeconds: 'timeLimitSeconds' in mode.settings ? mode.settings.timeLimitSeconds : undefined
  }))

  return (
    <div className={classNames('map-picker', { multi: multiplayer })}>
      <Link href={getModeMenuPath(mode)} className="back">
        <ArrowBackIcon fontSize="small" /> {multiplayer ? t('nav.multiplayer') : t('common.menu')}
      </Link>
      <header className="header">
        <GameModeIcon mode={mode.mode} className="icon" />
        <div className="heading">
          <h1 className="title">{mode.name}</h1>
          <p className="subtitle">{t('picker.chooseWhere')}</p>
        </div>
      </header>
      {maps.length > 0 && (
        <GameSettingsPicker
          options={mode.configurable}
          value={settings}
          onChange={setSettings}
          multiplayer={multiplayer}
        />
      )}
      <section className="maps">
        {maps.map((map) => (
          <MapCard key={map.id} map={map} mode={mode} settings={settings} />
        ))}
      </section>
      {maps.length === 0 && <p className="empty">{t('picker.noMaps')}</p>}
    </div>
  )
}
