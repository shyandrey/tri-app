import { athleteDisplayName } from '../utils/athleteDisplayName'
import { useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Athlete } from '../types/Athlete'
import type { Page } from '../types/Page'
import { usePageState } from '../navigation/usePageState'
import { officialStandings, seriesTitles } from '../data/officialStandings'
import type { OfficialSeries, StandingGender, StandingSeason } from '../data/officialStandings'
import { athleteImageDelivery } from '../utils/athleteImageDelivery'
import { countryCodeToFlag } from '../utils/countryFlag'
import { CalendarIcon, ChevronRightIcon } from '../components/AppIcons'
import RankingsSwipeTrack from '../components/RankingsSwipeTrack'
import BottomNav from '../components/BottomNav'
import StandingsSeasonPicker from '../components/StandingsSeasonPicker'
import { rankingsShowcase } from './rankingsShowcase'
import './OfficialRankingsPage.css'

type Selection = { series: OfficialSeries; season: StandingSeason; gender: StandingGender }
export default function OfficialRankingsPage({ athletes, onBack, onNavigate, onAthleteClick, onFeedback }: { athletes: Athlete[]; onFeedback: () => void; onBack: () => void; onNavigate: (page: Page) => void; onAthleteClick: (athlete: Athlete) => void }) {
  const [selection, setSelection] = usePageState<Selection>('officialStandings', { series: 'IRONMAN_PRO_SERIES', season: 2026, gender: 'M' })
  // Guard old or malformed persisted selections without touching source data.
  const table = officialStandings.find(t => t.series === selection.series && t.seasonYear === selection.season && t.gender === selection.gender) ?? officialStandings.find(t => t.series === 'IRONMAN_PRO_SERIES' && t.seasonYear === 2026 && t.gender === 'M')!
  const { series, gender } = table
  const season = table.seasonYear as StandingSeason
  const update = (patch: Partial<Selection>) => setSelection({ series, season, gender, ...patch })
  const [scene] = useState(() => Math.floor(Math.random() * 4))
  const artwork = rankingsShowcase[series][Number.isInteger(scene) && scene >= 0 && scene < 4 ? scene : 0]
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerButton = useRef<HTMLButtonElement>(null)
  const setGender = (gender: StandingGender) => update({ gender })
  const closePicker = () => { setPickerOpen(false); requestAnimationFrame(() => pickerButton.current?.focus()) }
  return <main className="app app--official-rankings" data-series={series}>
    <h1 className="standings-page-title">Официальные рейтинги</h1>
    <section className="standings-showcase" aria-label={`${seriesTitles[series]}. Стрелки переключают серию`} tabIndex={0}
      data-scene={artwork.scene}
      onKeyDown={e => { if (e.target === e.currentTarget && ['ArrowLeft', 'ArrowRight'].includes(e.key)) { e.preventDefault(); update({ series: e.key === 'ArrowRight' ? 'T100' : 'IRONMAN_PRO_SERIES' }) } }}>
      <RankingsSwipeTrack index={series === 'T100' ? 1 : 0} onSelect={i => update({ series: i ? 'T100' : 'IRONMAN_PRO_SERIES' })} label="Свайп серии">
        {(['IRONMAN_PRO_SERIES', 'T100'] as const).map(s => {
          const art = rankingsShowcase[s][scene]
          return <div className="rankings-showcase-panel" key={s} data-series={s} data-scene={art.scene} aria-hidden={s !== series}
            style={{ '--art-aspect': art.aspectRatio, '--portrait-position': art.portraitObjectPosition, '--landscape-position': art.landscapeObjectPosition } as CSSProperties}>
            <picture>
              <source media="(orientation: landscape)" srcSet={art.landscapePath} type="image/webp" />
              <source srcSet={art.path} type="image/webp" />
              <img className="standings-showcase__art" alt={seriesTitles[s]} draggable={false} fetchPriority={s === series ? 'high' : 'low'} />
            </picture>
          </div>
        })}
      </RankingsSwipeTrack>
      <button className="page-back-button" onClick={onBack}>← Назад</button>
    </section>
    <div className="standings-content">
    <div className="standings-series" role="group" aria-label="Серия">
      {(['IRONMAN_PRO_SERIES','T100'] as const).map(s => <button key={s} type="button" aria-label={seriesTitles[s]} aria-pressed={series === s} onClick={() => update({ series: s })}><span /></button>)}
    </div>
    <div className="standings-controls standings-gender">
      <span aria-live="polite">{gender === 'M' ? 'Мужчины' : 'Женщины'}</span>
      <div role="group" aria-label="Категория рейтинга">{(['M','W'] as const).map(g => <button type="button" key={g} aria-label={g === 'M' ? 'Мужчины' : 'Женщины'} aria-pressed={gender === g} onClick={() => setGender(g)}><span className="race-card__gender-symbol standings-gender-symbol" aria-hidden="true">{g === 'M' ? '♂︎' : '♀︎'}</span></button>)}</div>
      <button ref={pickerButton} className="standings-season" type="button" aria-haspopup="dialog" aria-expanded={pickerOpen} onClick={() => setPickerOpen(true)}><CalendarIcon /><span>{season}</span><ChevronRightIcon /></button>
    </div>
    <div className="standings-swipe" tabIndex={0} role="region" aria-label="Рейтинг. Стрелки влево и вправо переключают категорию" onKeyDown={e => { if (e.target === e.currentTarget && ['ArrowLeft','ArrowRight'].includes(e.key)) { e.preventDefault(); setGender(e.key === 'ArrowRight' ? 'W' : 'M') } }}
      >
      <RankingsSwipeTrack index={gender === 'W' ? 1 : 0} onSelect={i => setGender(i ? 'W' : 'M')} gap={12} label="Свайп категории">
      {(['M', 'W'] as const).map(panelGender => {
        const panelTable = officialStandings.find(t => t.series === series && t.seasonYear === season && t.gender === panelGender)!
        return <div className="rankings-table-panel" key={panelGender} inert={panelGender !== gender} aria-hidden={panelGender !== gender}>
      <table key={`${series}-${season}-${panelGender}`} className="official-standings" data-season={season} data-gender={panelGender}>
        <caption>{seriesTitles[series]} · {season} · {panelGender === 'M' ? 'Мужчины' : 'Женщины'}</caption>
        <thead><tr><th scope="col">#</th><th scope="col">ATHLETE</th><th scope="col">POINTS</th></tr></thead>
        <tbody>{panelTable.rows.map(row => {
          const athlete = athletes.find(a => a.id === row.athleteId)
          const displayName = athleteDisplayName(athlete, row.athleteName)
          return <tr key={row.officialRank} data-athlete-id={row.athleteId}><td>{row.officialRank}</td><td><a href={`#/athlete/${row.athleteId}`} onClick={e => { if (athlete && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) { e.preventDefault(); onAthleteClick(athlete) } }}>
            <span className="standings-avatar">{athlete?.image ? <img {...athleteImageDelivery(athlete.image, '36px')} loading="lazy" alt="" onError={e => { e.currentTarget.style.display = 'none' }} /> : null}<span aria-hidden="true">{displayName.split(' ').map(n => n[0]).slice(0,2).join('')}</span></span>
            <span className="standings-name">{displayName}<span className="standings-flag" role="img" aria-label={row.nationalityNormalized}>{countryCodeToFlag(row.nationalityNormalized)}</span></span>
          </a></td><td>{new Intl.NumberFormat('ru-RU').format(row.officialPoints)}</td></tr>
        })}</tbody>
      </table></div>
      })}
      </RankingsSwipeTrack>
    </div>
    <div className="standings-feedback"><button className="feedback-entry" type="button" onClick={onFeedback}>Сообщить об ошибке</button></div>
    </div>
    <BottomNav currentPage="rankings" onNavigate={onNavigate} />
    {pickerOpen && <StandingsSeasonPicker value={season} onSelect={year => update({ season: year })} onClose={closePicker} />}
  </main>
}
