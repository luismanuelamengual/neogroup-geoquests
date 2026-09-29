import GroupsIcon from '@mui/icons-material/Groups'
import PersonIcon from '@mui/icons-material/Person'
import type { SvgIconProps } from '@mui/material/SvgIcon'
import { ComponentType } from 'react'
import { GameMode } from '@/app/(protected)/(game)/models/GameMode'

/** Icon of each game mode: to add a mode, add its icon here. */
const MODE_ICONS: Partial<Record<GameMode, ComponentType<SvgIconProps>>> = {
  [GameMode.CLASSIC]: PersonIcon,
  [GameMode.CLASSIC_MULTIPLAYER]: GroupsIcon
}

/** Icon of a game mode (menu cards, play buttons). */
export default function GameModeIcon({ mode, ...props }: { mode: GameMode } & SvgIconProps) {
  const Icon = MODE_ICONS[mode] ?? PersonIcon

  return <Icon {...props} />
}
