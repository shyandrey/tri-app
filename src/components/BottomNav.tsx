import type { Page } from '../types/Page'
import { AthleteIcon, CalendarIcon, HomeIcon, MoreIcon, RankingIcon } from './AppIcons'

type BottomNavProps = {
  currentPage: Page
  onNavigate: (page: Page) => void
}

function BottomNav({ currentPage, onNavigate }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      <button
        aria-label="Главная"
        className={currentPage === 'home' ? 'bottom-nav__active' : ''}
        onClick={() => onNavigate('home')}
      >
        <HomeIcon className="bottom-nav__icon" />
      </button>

      <button
        aria-label="Календарь"
        className={currentPage === 'calendar' ? 'bottom-nav__active' : ''}
        onClick={() => onNavigate('calendar')}
      >
        <CalendarIcon className="bottom-nav__icon" />
      </button>

      <button
        aria-label="Профили атлетов"
        className={currentPage === 'athletes' ? 'bottom-nav__active' : ''}
        onClick={() => onNavigate('athletes')}
      >
        <AthleteIcon className="bottom-nav__icon" />
      </button>

      <button
        aria-label="Топ атлетов"
        className={currentPage === 'top' ? 'bottom-nav__active' : ''}
        onClick={() => onNavigate('top')}
      >
        <RankingIcon className="bottom-nav__icon" />
      </button>

      <button
        aria-label="Ещё"
        className={currentPage === 'more' ? 'bottom-nav__active' : ''}
        onClick={() => onNavigate('more')}
      >
        <MoreIcon className="bottom-nav__icon" />
      </button>
    </nav>
  )
}

export default BottomNav
