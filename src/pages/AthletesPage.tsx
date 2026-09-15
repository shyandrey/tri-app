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

const EN_KEYS = "qwertyuiop[]asdfghjkl;'zxcvbnm,."
const RU_KEYS = 'йцукенгшщзхъфывапролджэячсмитьбю'

function swapKeyboardLayout(value: string) {
  const lower = value.toLowerCase()
  return Array.from(lower, (char) => {
    const enIndex = EN_KEYS.indexOf(char)
    if (enIndex >= 0) return RU_KEYS[enIndex]
    const ruIndex = RU_KEYS.indexOf(char)
    if (ruIndex >= 0) return EN_KEYS[ruIndex]
    return char
  }).join('')
}

function normalizeSearch(value: string) {
  return value.trim().toLowerCase().replace(/ё/g, 'е')
}

function AthletePlaceholder() {
  return (
    <div className="athlete-card__image athlete-card__image--placeholder" aria-hidden="true">
      <svg className="athlete-placeholder-icon" viewBox="0 0 64 64">
        <path className="athlete-placeholder-icon__swash" d="M7 45c11-15 26-22 50-24M10 51c13-9 28-13 46-12" />
        <circle cx="32" cy="20" r="8" />
        <path d="M19 48c2-12 6-18 13-18s11 6 13 18" />
        <path className="athlete-placeholder-icon__goggles" d="M24 19h5l3 2 3-2h5M24 19l-2-2M40 19l2-2" />
      </svg>
    </div>
  )
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

  const countryOrder = useMemo(() => {
    const byCountry = new Map<string, CountryFilter>()
    athletes.forEach((athlete) => {
      const key = athlete.countryCode ?? athlete.country
      const current = byCountry.get(key)
      if (current) { current.count += 1; return }
      byCountry.set(key, { key, label: athlete.countryCode ?? athlete.country, flag: athlete.flag, count: 1 })
    })
    return Array.from(byCountry.values())
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .map(({ key, label, flag }) => ({ key, label, flag }))
  }, [athletes])

  const countries = useMemo<CountryFilter[]>(() => {
    const counts = new Map<string, number>()
    genderFilteredAthletes.forEach((athlete) => {
      const key = athlete.countryCode ?? athlete.country
      counts.set(key, (counts.get(key) ?? 0) + 1)
    })
    return countryOrder.map((country) => ({ ...country, count: counts.get(country.key) ?? 0 }))
  }, [countryOrder, genderFilteredAthletes])

  const visibleAthletes = useMemo(() => {
    const query = normalizeSearch(search)
    const swappedQuery = normalizeSearch(swapKeyboardLayout(search))
    const queries = [...new Set([query, swappedQuery].filter(Boolean))]

    return genderFilteredAthletes.filter((athlete) => {
      const athleteCountryKey = athlete.countryCode ?? athlete.country
      const matchesCountry = countryFilter === 'ALL' || athleteCountryKey === countryFilter
      const haystack = normalizeSearch([
        athlete.name, athlete.nameEn, athlete.country, athlete.countryEn,
        athlete.countryCode, athlete.discipline,
      ].filter(Boolean).join(' '))
      const matchesSearch = queries.length === 0 || queries.some((candidate) => haystack.includes(candidate))
      return matchesCountry && matchesSearch
    })
  }, [countryFilter, genderFilteredAthletes, search])

  return (
    <main className="app app--athletes">
      <button className="page-back-button" onClick={onBack}>← Назад</button>
      <section className="section athletes-page">
        <div className="section__header athletes-page__header"><div><h1>Профили атлетов</h1></div></div>
        <div className="calendar-search-wrap athletes-search-wrap">
          <input className="calendar-search athletes-search" type="text" placeholder="Найти атлета..." value={search} onChange={(event) => setSearch(event.target.value)} />
          {search && <button type="button" className="calendar-search-clear" aria-label="Очистить поиск" onClick={() => setSearch('')}>×</button>}
        </div>
        <div className="athletes-gender-filter" aria-label="Пол атлета">
          {([{ value: 'ALL', label: 'ALL', symbol: '◎' }, { value: 'M', label: 'MEN', symbol: '♂' }, { value: 'W', label: 'WOMEN', symbol: '♀' }] as const).map((item) => (
            <button key={item.value} type="button" className={genderFilter === item.value ? 'athletes-gender-card is-active' : 'athletes-gender-card'} onClick={() => setGenderFilter(item.value)}>
              <span className="athletes-gender-card__symbol">{item.symbol}</span><span className="athletes-gender-card__label">{item.label}</span><span className="athletes-gender-card__count">{genderCounts[item.value]}</span>
            </button>
          ))}
        </div>
        <div className="athletes-country-scroller" aria-label="Фильтр по стране">
          <button type="button" className={countryFilter === 'ALL' ? 'athletes-country-chip is-active' : 'athletes-country-chip'} onClick={() => setCountryFilter('ALL')}>
            <span className="athletes-country-chip__flag">🌍</span><span className="athletes-country-chip__code">ALL</span><span className="athletes-country-chip__count">{genderFilteredAthletes.length}</span>
          </button>
          {countries.map((country) => (
            <button key={country.key} type="button" className={countryFilter === country.key ? 'athletes-country-chip is-active' : 'athletes-country-chip'} onClick={() => setCountryFilter(country.key)}>
              <span className="athletes-country-chip__flag">{country.flag}</span><span className="athletes-country-chip__code">{country.label}</span><span className="athletes-country-chip__count">{country.count}</span>
            </button>
          ))}
        </div>
        <div className="athletes-list athletes-list--profiles">
          {visibleAthletes.map((athlete) => (
            <article className="athlete-card athlete-card--profile" key={athlete.id} onClick={() => onAthleteClick(athlete)}>
              <div className="athlete-card__portrait-wrap">
                {athlete.image ? <img className="athlete-card__image" src={athlete.image} alt="" /> : <AthletePlaceholder />}
                <span className="athlete-card__flag-badge">{athlete.flag}</span>
              </div>
              <div className="athlete-card__info">
                <h3>{athlete.name}</h3>{athlete.nameEn && <span className="athlete-card__name-en">{athlete.nameEn}</span>}<p>{athlete.countryCode ?? athlete.country} · {athlete.country}</p>
              </div>
              <span className="athlete-card__arrow">›</span>
            </article>
          ))}
          {visibleAthletes.length === 0 && <div className="athletes-empty"><strong>Атлеты не найдены</strong><span>Попробуй изменить страну, пол или поисковый запрос.</span></div>}
        </div>
      </section>
      <BottomNav currentPage="athletes" onNavigate={onNavigate} />
    </main>
  )
}
export default AthletesPage
