'use client'

import './index.scss'
import LogoutIcon from '@mui/icons-material/Logout'
import PersonIcon from '@mui/icons-material/Person'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
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
import { SessionUser } from '@/app/(protected)/models/SessionUser'
import { useUserStore } from '@/app/(protected)/stores/users'
import Logo from '@/app/components/Logo'
import PlayerAvatar from '@/app/components/PlayerAvatar'

const NAV_ITEMS = [
  { href: '/home', label: 'Jugar', icon: <SportsEsportsIcon /> },
  { href: '/account', label: 'Mi perfil', icon: <PersonIcon /> }
]

/**
 * Shell of every authenticated page: a game-like top bar (logo, navigation and
 * player badge) and a bottom tab bar on phones. The play screen renders on top
 * of it in full screen.
 */
export default function AppShell({ children, user: initialUser }: { children: ReactNode; user: SessionUser }) {
  const router = useRouter()
  const pathname = usePathname()
  const user = useUserStore((state) => state.user) ?? initialUser
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
        <Link href="/home" className="brand">
          <Logo size="small" />
        </Link>
        <nav className="nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={classNames('nav-link', { active: pathname === item.href })}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="spacer" />
        <ButtonBase onClick={openMenu} className="player" focusRipple>
          <PlayerAvatar name={user.displayName} />
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
          </div>
          <Divider />
          <MenuItem component={Link} href="/account" onClick={closeMenu}>
            <ListItemIcon>
              <PersonIcon fontSize="small" />
            </ListItemIcon>
            Mi perfil
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            Cerrar sesión
          </MenuItem>
        </Menu>
      </header>
      <main className="content">{children}</main>
      <nav className="tabbar">
        {NAV_ITEMS.map((item) => (
          <Link key={item.href} href={item.href} className={classNames('tab', { active: pathname === item.href })}>
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
