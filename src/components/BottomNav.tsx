type Page =
  | 'home'
  | 'calendar'
  | 'race'
  | 'athletes'
  | 'athlete'
  | 'top'

type BottomNavProps = {
  currentPage: Page
  onNavigate: (page: Page) => void
}

function BottomNav({
  currentPage,
  onNavigate,
}: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      <button
        className={currentPage === 'home' ? 'bottom-nav__active' : ''}
        onClick={() => onNavigate('home')}
      >
        ⌂
      </button>

      <button
        className={currentPage === 'calendar' ? 'bottom-nav__active' : ''}
        onClick={() => onNavigate('calendar')}
      >
        ▦
      </button>

      <button
        className={currentPage === 'athletes' ? 'bottom-nav__active' : ''}
        onClick={() => onNavigate('athletes')}
      >
        ♙
      </button>

      <button
        className={currentPage === 'top' ? 'bottom-nav__active' : ''}
        onClick={() => onNavigate('top')}
      >
        🏆
      </button>

      <button>
        •••
      </button>
    </nav>
  )
}

export default BottomNav