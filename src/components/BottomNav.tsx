import type { CSSProperties } from 'react'
import { NavActiveCapsule } from './NavActiveCapsule'
import './BottomNav.css'
import type { Page } from '../types/Page'
import { AthleteIcon, CalendarIcon, HomeIcon, MoreIcon, PointsTableIcon } from './AppIcons'

type BottomNavProps = {
  currentPage: Page
  onNavigate: (page: Page) => void
}

function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  const activeIndex = ['home', 'calendar', 'athletes', 'rankings', 'more'].indexOf(currentPage)
  return (
    <nav className="bottom-nav" aria-label="Основная навигация" style={{ '--nav-index': activeIndex } as CSSProperties}>
      {activeIndex >= 0 && <NavActiveCapsule index={activeIndex} />}
      <button
        aria-label="Главная"
        aria-current={currentPage === 'home' ? 'page' : undefined}
        className={currentPage === 'home' ? 'bottom-nav__active' : ''}
        onClick={() => onNavigate('home')}
      >
        <HomeIcon className="bottom-nav__icon" />
      </button>

      <button
        aria-label="Календарь"
        aria-current={currentPage === 'calendar' ? 'page' : undefined}
        className={currentPage === 'calendar' ? 'bottom-nav__active' : ''}
        onClick={() => onNavigate('calendar')}
      >
        <CalendarIcon className="bottom-nav__icon" />
      </button>

      <button
        aria-label="Профили атлетов"
        aria-current={currentPage === 'athletes' ? 'page' : undefined}
        className={currentPage === 'athletes' ? 'bottom-nav__active' : ''}
        onClick={() => onNavigate('athletes')}
      >
        <AthleteIcon className="bottom-nav__icon" />
      </button>

      <button aria-label="Рейтинги" aria-current={currentPage === 'rankings' ? 'page' : undefined} className={currentPage === 'rankings' ? 'bottom-nav__active' : ''} onClick={() => onNavigate('rankings')}><PointsTableIcon className="bottom-nav__icon" /></button>

      <button
        aria-label="Ещё"
        aria-current={currentPage === 'more' ? 'page' : undefined}
        className={currentPage === 'more' ? 'bottom-nav__active' : ''}
        onClick={() => onNavigate('more')}
      >
        <MoreIcon className="bottom-nav__icon" />
      </button>
    </nav>
  )
}

export default BottomNav
