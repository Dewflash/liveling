import type { CSSProperties } from 'react'
import type { PageType } from '../types'
import '../styles/Navigation.css'

interface NavigationProps {
  currentPage: PageType
  onNavigate: (page: PageType) => void
}

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const pages: Array<{ id: PageType; label: string; icon: string }> = [
    { id: 'home', label: 'Home', icon: '/ribbon/home.svg' },
    { id: 'missions', label: 'Missions', icon: '/ribbon/missions.svg' },
    { id: 'forest', label: 'Forest', icon: '/ribbon/forest.svg' },
    { id: 'game', label: 'Game', icon: '/ribbon/game.svg' },
    { id: 'shop', label: 'Shop', icon: '/ribbon/shop.svg' },
    { id: 'profile', label: 'Profile', icon: '/ribbon/profile.svg' },
  ]

  return (
    <nav className="navigation-ribbon">
      {pages.map((page) => (
        <button
          key={page.id}
          type="button"
          className={`nav-button nav-${page.id} ${currentPage === page.id ? 'active' : ''}`}
          onClick={() => onNavigate(page.id)}
          title={page.label}
          aria-current={currentPage === page.id ? 'page' : undefined}
        >
          <span
            className="nav-icon"
            aria-hidden="true"
            style={{ '--icon-url': `url(${page.icon})` } as CSSProperties}
          />
          <span className="nav-label">{page.label}</span>
        </button>
      ))}
    </nav>
  )
}
