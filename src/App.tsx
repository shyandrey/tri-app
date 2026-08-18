import AthleteDetailPage from './pages/AthleteDetailPage'
import AthletesPage from './pages/AthletesPage'
import RaceDetailPage from './pages/RaceDetailPage'
import CalendarPage from './pages/CalendarPage'
import { useState } from 'react'
import './App.css'
import triLogo from './assets/300w_5.png'
import RaceCard from './components/RaceCard'
const races = [
  {
    id: 1,
    tag: '70.3',
    name: 'IRONMAN 70.3 Kraichgau',
    date: '2 июня',
    location: 'Германия',
    city: 'Крайгхау',
    swim: '1.9 км',
    bike: '90 км',
    run: '21.1 км',
    description:
      'Полужелезная дистанция IRONMAN, 1.9 / 90 / 21.1',
  },
  {
    id: 2,
    tag: 'IRONMAN',
    name: 'IRONMAN Tallinn',
    date: '18 августа',
    location: 'Эстония',
    city: 'Таллин',
    swim: '3.8 км',
    bike: '180 км',
    run: '42.2 км',
    description:
      'Полная дистанция IRONMAN в Таллине с плаванием, велоэтапом и марафоном.',
  },
  {
    id: 3,
    tag: 'T100',
    name: 'T100 London',
    date: '9 августа',
    location: 'Великобритания',
    city: 'Лондон',
    swim: '2 км',
    bike: '80 км',
    run: '18 км',
    description:
      '2 км плавание, велоэтап 80 км, 18 км бег',
  },
]

const athletes = [
  {
    id: 1,
    name: 'Кристиан Блюмменфельт',
    country: 'Норвегия',
    flag: '🇳🇴',
    discipline: 'IRONMAN / T100',
    bio:
      'Норвежский триатлет, выступающий на олимпийской, средней и полной дистанциях.',
    achievements: [
      'Олимпийский чемпион',
      'Чемпион мира IRONMAN',
      'Чемпион мира IRONMAN 70.3',
    ],
  },
  {
    id: 2,
    name: 'Мартен ван Рил',
    country: 'Бельгия',
    flag: '🇧🇪',
    discipline: 'T100',
    bio:
      'Бельгийский профессиональный триатлет, специализирующийся на коротких и средних дистанциях.',
    achievements: [
      'Победитель международных стартов',
      'Один из ведущих атлетов серии T100',
    ],
  },
  {
    id: 3,
    name: 'Хейден Уайлд',
    country: 'Новая Зеландия',
    flag: '🇳🇿',
    discipline: 'T100',
    bio:
      'Новозеландский триатлет, один из сильнейших спортсменов своего поколения на коротких и средних дистанциях.',
    achievements: [
      'Олимпийский призёр',
      'Победитель крупных международных стартов',
    ],
  },
]

function App() {
  const [page, setPage] = useState<
  'home' | 'calendar' | 'race' | 'athletes' | 'athlete'
>('home')
  const [previousPage, setPreviousPage] = useState<'home' | 'calendar'>('home')
  const [selectedRace, setSelectedRace] = useState<(typeof races)[number] | null>(null)
  const [selectedAthlete, setSelectedAthlete] = useState<(typeof athletes)[number] | null>(null)
  if (page === 'calendar') {
  return (
    <CalendarPage
  races={races}
  onBack={() => setPage('home')}
  onRaceClick={(race) => {
    setSelectedRace(race)
    setPreviousPage('calendar')
    setPage('race')
  }}
/>
  )
}
if (page === 'race' && selectedRace) {
  return (
    <RaceDetailPage
      race={selectedRace}
      onBack={() => setPage(previousPage)}
    />
  )
}
if (page === 'athletes') {
  return (
    <AthletesPage
  athletes={athletes}
  onBack={() => setPage('home')}
  onAthleteClick={(athlete) => {
    setSelectedAthlete(athlete)
    setPage('athlete')
  }}
/>
  )
}
if (page === 'athlete' && selectedAthlete) {
  return (
    <AthleteDetailPage
      athlete={selectedAthlete}
      onBack={() => setPage('athletes')}
    />
  )
}
  return (
    <main className="app">
      <header className="hero">
        <div className="hero__brand">
          <img
            className="hero__logo-image"
            src={triLogo}
            alt="TRI App"
/>

          <div>
            <h1>TRI APP</h1>
            <p>Триатлон в одном приложении</p>
          </div>
        </div>

        <div className="hero__text">
          <h2>
            ТРИАТЛОН —
            <br />
            ЭТО <span>МОЩНО</span>
          </h2>

          <p>
            Календарь стартов, профили атлетов
            <br />
            и всё, что нужно триатлету.
          </p>
        </div>
      </header>

      <section className="section">
        <div className="section__header">
          <h2>⚡ Ближайшие старты</h2>
          <button onClick={() => setPage('calendar')}>
            Смотреть все
          </button>
        </div>
        {races.map((race) => (
  <RaceCard
  key={race.id}
  tag={race.tag}
  name={race.name}
  date={race.date}
  location={race.location}
  onClick={() => {
    setSelectedRace(race)
    setPreviousPage('home')
    setPage('race')
  }}
/>
))}
      </section>

      <section className="features">
        <article
          className="feature-card"
          onClick={() => setPage('calendar')}
        >
          <div className="feature-card__icon">〰️</div>
          <h3>Календарь стартов</h3>
          <p>Соревнования по триатлону</p>
        </article>

        <article
          className="feature-card"
          onClick={() => setPage('athletes')}
        >
          <div className="feature-card__icon">⚡</div>
          <h3>Профили атлетов</h3>
          <p>Результаты и достижения</p>
        </article>

        <article className="feature-card">
          <div className="feature-card__icon">🏆</div>
          <h3>Топ атлетов</h3>
          <p>Рейтинг и лучшие результаты</p>
        </article>
      </section>

      <section className="section">
        <div className="section__header">
          <h2>Новости из канала</h2>
          <button>@trista_watt</button>
        </div>

        <article className="news-card">
          <div>
            <h3>IRONMAN объявил новый календарь стартов</h3>
            <p>Последние новости из Telegram-канала</p>
          </div>

          <span className="news-card__telegram">➤</span>
        </article>
      </section>

      <nav className="bottom-nav">
        <button className="bottom-nav__active">⌂</button>
        <button>▦</button>
        <button>♙</button>
        <button>🏆</button>
        <button>•••</button>
      </nav>
    </main>
  )
}

export default App