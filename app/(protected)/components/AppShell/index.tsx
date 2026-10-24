'use client'

import './index.scss'
import GroupsIcon from '@mui/icons-material/Groups'
import LogoutIcon from '@mui/icons-material/Logout'
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech'
import PersonIcon from '@mui/icons-material/Person'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ButtonBase from '@mui/material/ButtonBase'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import classNames from 'classnames'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { getSession, signOut } from 'next-auth/react'
import { MouseEvent, ReactNode, useEffect, useState } from 'react'
import { PlayerStats } from '@/app/(protected)/(game)/models/PlayerStats'
import StreakBadge from '@/app/(protected)/components/StreakBadge'
import { SessionUser } from '@/app/(protected)/models/SessionUser'
import { useProgressStore } from '@/app/(protected)/stores/progress'
import { useUserStore } from '@/app/(protected)/stores/users'
import Logo from '@/app/components/Logo'
import PlayerAvatar from '@/app/components/PlayerAvatar'
import { useT } from '@/app/i18n/I18nProvider'
import type { MessageKey } from '@/app/i18n/messages'

const NAV_ITEMS: { href: string; labelKey: MessageKey; icon: ReactNode }[] = [
  { href: '/play', labelKey: 'nav.play', icon: <SportsEsportsIcon /> },
  { href: '/multiplayer', labelKey: 'nav.multiplayer', icon: <GroupsIcon /> },
  { href: '/achievements', labelKey: 'nav.achievements', icon: <MilitaryTechIcon /> }
]

/** Whether a nav item is the current section: its page or any page under it (e.g. /multiplayer/battle-royale). */
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`)
}

/**
 * Shell of every authenticated page: a game-like top bar (logo, navigation,
 * streak and player badge with its level) and a bottom tab bar on phones. The play screen renders on top
 * of it in full screen.
 */
export default function AppShell({
  children,
  user: initialUser,
  stats: initialStats
}: {
  children: ReactNode
  user: SessionUser
  stats: PlayerStats
}) {
  const t = useT()
  const router = useRouter()
  const pathname = usePathname()
  const user = useUserStore((state) => state.user) ?? initialUser
  const stats = useProgressStore((state) => state.stats) ?? initialStats
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)

  // Coming back to an installed PWA after the session expired: go to login.
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && !(await getSession())) {
        router.push('/login')
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [router])

  const openMenu = (event: MouseEvent<HTMLElement>) => setMenuAnchor(event.currentTarget)
  const closeMenu = () => setMenuAnchor(null)

  const handleLogout = () => {
    closeMenu()
    signOut({ redirectTo: '/login' })
  }

  return (
    <div className="app-shell">
      <header className="appbar">
        <Link href="/play" className="brand">
          <Logo size="small" />
        </Link>
        <nav className="nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={classNames('nav-link', { active: isActive(pathname, item.href) })}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>
        <div className="spacer" />
        <StreakBadge stats={stats} />
        <ButtonBase onClick={openMenu} className="player" focusRipple>
          <PlayerAvatar name={user.displayName} level={stats.level} />
          <span className="player-name">{user.displayName}</span>
        </ButtonBase>
        <Menu
          anchorEl={menuAnchor}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          open={!!menuAnchor}
          onClose={closeMenu}
        >
          <div className="app-shell-menu-header">
            <span className="name">{user.displayName}</span>
            <span className="email">{user.email}</span>
            <span className="level">
              {t('xp.level', { level: stats.level })} · {t(`xp.ranks.${stats.rank}` as MessageKey)}
            </span>
          </div>
          <Divider />
          <MenuItem component={Link} href="/account" onClick={closeMenu}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            {t('nav.myProfile')}
          </MenuItem>
          <MenuItem component={Link} href="/progress" onClick={closeMenu}>
            <ListItemIcon>
              <TrendingUpIcon fontSize="small" />
            </ListItemIcon>
            {t('nav.progress')}
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            {t('nav.logout')}
          </MenuItem>
        </Menu>
      </header>
      <main className="content">{children}</main>
      <nav className="tabbar">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={classNames('tab', { active: isActive(pathname, item.href) })}
          >
            {item.icon}
            <span>{t(item.labelKey)}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
