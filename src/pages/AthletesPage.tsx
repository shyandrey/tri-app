import { useMemo, useState } from 'react'
import type { Athlete, AthleteGender } from '../types/Athlete'
import BottomNav from '../components/BottomNav'
import type { Page } from '../types/Page'

type AthletesPageProps = {
  athletes: Athlete[]
  onBack: () => void
  onAthleteClick: (athlete: Athlete) => void
  onNavigate: (page: Page) => void
}

type GenderFilter = 'ALL' | AthleteGender

type CountryFilter = {
  key: string
  label: string
  flag: string
  count: number
}

function AthletesPage({ athletes, onBack, onAthleteClick, onNavigate }: AthletesPageProps) {
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState<GenderFilter>('ALL')
  const [countryFilter, setCountryFilter] = useState('ALL')

  const genderCounts = useMemo(() => ({
    ALL: athletes.length,
    M: athletes.filter((athlete) => athlete.gender === 'M').length,
    W: athletes.filter((athlete) => athlete.gender === 'W').length,
  }), [athletes])

  const genderFilteredAthletes = useMemo(
    () => athletes.filter((athlete) => genderFilter === 'ALL' || athlete.gender === genderFilter),
    [athletes, genderFilter],
  )

  const countries = useMemo<CountryFilter[]>(() => {
    const byCountry = new Map<string, CountryFilter>()

    genderFilteredAthletes.forEach((athlete) => {
      const key = athlete.countryCode ?? athlete.country
      const current = byCountry.get(key)
      if (current) {
        current.count += 1
        return
      }

      byCountry.set(key, {
        key,
        label: athlete.countryCode ?? athlete.country,
        flag: athlete.flag,
        count: 1,
      })
    })

    return Array.from(byCountry.values())
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
  }, [genderFilteredAthletes])

  const visibleAthletes = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()

    return genderFilteredAthletes.filter((athlete) => {
      const athleteCountryKey = athlete.countryCode ?? athlete.country
      const matchesCountry = countryFilter === 'ALL' || athleteCountryKey === countryFilter
      const matchesSearch = !normalizedSearch || [
        athlete.name,
        athlete.nameEn,
        athlete.country,
        athlete.countryEn,
        athlete.countryCode,
        athlete.discipline,
      ].filter(Boolean).join(' ').toLowerCase().includes(normalizedSearch)

      return matchesCountry && matchesSearch
    })
  }, [countryFilter, genderFilteredAthletes, search])

  const chooseGender = (gender: GenderFilter) => {
    setGenderFilter(gender)
    setCountryFilter('ALL')
  }

  return (
    <main className="app app--athletes">
      <button className="page-back-button" onClick={onBack}>← Назад</button>

      <section className="section athletes-page">
        <div className="section__header athletes-page__header">
          <div>
            <h1>Профили атлетов</h1>
          </div>
        </div>

        <div className="calendar-search-wrap athletes-search-wrap">
          <input
            className="calendar-search athletes-search"
            type="text"
            placeholder="Найти атлета..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && (
            <button type="button" className="calendar-search-clear" aria-label="Очистить поиск" onClick={() => setSearch('')}>×</button>
          )}
        </div>

        <div className="athletes-gender-filter" aria-label="Пол атлета">
          {([
            { value: 'ALL', label: 'ALL', symbol: '◎' },
            { value: 'M', label: 'MEN', symbol: '♂' },
            { value: 'W', label: 'WOMEN', symbol: '♀' },
          ] as const).map((item) => (
            <button
              key={item.value}
              type="button"
              className={genderFilter === item.value ? 'athletes-gender-card is-active' : 'athletes-gender-card'}
              onClick={() => chooseGender(item.value)}
            >
              <span className="athletes-gender-card__symbol">{item.symbol}</span>
              <span className="athletes-gender-card__label">{item.label}</span>
              <span className="athletes-gender-card__count">{genderCounts[item.value]}</span>
            </button>
          ))}
        </div>

        <div className="athletes-countries-header">
          <h2>Страны</h2>
          <span>{genderFilteredAthletes.length} атлетов</span>
        </div>

        <div className="athletes-country-scroller" aria-label="Фильтр по стране">
          <button
            type="button"
            className={countryFilter === 'ALL' ? 'athletes-country-chip is-active' : 'athletes-country-chip'}
            onClick={() => setCountryFilter('ALL')}
          >
            <span className="athletes-country-chip__flag">🌍</span>
            <span className="athletes-country-chip__code">ALL</span>
            <span className="athletes-country-chip__count">{genderFilteredAthletes.length}</span>
          </button>

          {countries.map((country) => (
            <button
              key={country.key}
              type="button"
              className={countryFilter === country.key ? 'athletes-country-chip is-active' : 'athletes-country-chip'}
              onClick={() => setCountryFilter(country.key)}
            >
              <span className="athletes-country-chip__flag">{country.flag}</span>
              <span className="athletes-country-chip__code">{country.label}</span>
              <span className="athletes-country-chip__count">{country.count}</span>
            </button>
          ))}
        </div>

        <div className="athletes-results-heading">
          <span>{visibleAthletes.length} найдено</span>
          {(genderFilter !== 'ALL' || countryFilter !== 'ALL' || search) && (
            <button type="button" onClick={() => { setGenderFilter('ALL'); setCountryFilter('ALL'); setSearch('') }}>Сбросить</button>
          )}
        </div>

        <div className="athletes-list athletes-list--profiles">
          {visibleAthletes.map((athlete) => (
            <article className="athlete-card athlete-card--profile" key={athlete.id} onClick={() => onAthleteClick(athlete)}>
              <div className="athlete-card__portrait-wrap">
                {athlete.image ? (
                  <img className="athlete-card__image" src={athlete.image} alt="" />
                ) : (
                  <div className="athlete-card__image athlete-card__image--placeholder">{athlete.name.charAt(0)}</div>
                )}
                <span className="athlete-card__flag-badge">{athlete.flag}</span>
              </div>
              <div className="athlete-card__info">
                <h3>{athlete.name}</h3>
                {athlete.nameEn && <span className="athlete-card__name-en">{athlete.nameEn}</span>}
                <p>{athlete.countryCode ?? athlete.country} · {athlete.country}</p>
              </div>
              <span className="athlete-card__arrow">›</span>
            </article>
          ))}

          {visibleAthletes.length === 0 && (
            <div className="athletes-empty">
              <strong>Атлеты не найдены</strong>
              <span>Попробуй изменить страну, пол или поисковый запрос.</span>
            </div>
          )}
        </div>
      </section>

      <BottomNav currentPage="athletes" onNavigate={onNavigate} />
    </main>
  )
}

export default AthletesPage
