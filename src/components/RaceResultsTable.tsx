import { useEffect, useMemo, useState } from 'react'
import type { Athlete } from '../types/Athlete'
import type { RaceResult } from '../types/RaceResult'
import { countryCodeToFlag } from '../utils/countryFlag'
import { getBestSplit, getResultTime, sortRaceResults, type ResultSortKey } from '../utils/raceResultTime'
import './RaceResultsTable.css'

type Gender = 'M' | 'W'
type RaceResultsTableProps = {
  results: RaceResult[]
  athletes: Athlete[]
  onAthleteClick: (athlete: Athlete) => void
  selectedGender?: Gender
  onGenderChange?: (gender: Gender) => void
  showGenderTabs?: boolean
}
const sortOptions: { key: ResultSortKey; label: string }[] = [{ key: 'swim', label: 'Swim' }, { key: 'bike', label: 'Bike' }, { key: 'run', label: 'Run' }, { key: 'overall', label: 'Total' }]
const genderLabels = { M: 'MEN', W: 'WOMEN' } as const

function RaceResultsTable({ results, athletes, onAthleteClick, selectedGender: controlledGender, onGenderChange, showGenderTabs = true }: RaceResultsTableProps) {
  const [sortKey, setSortKey] = useState<ResultSortKey>('overall')
  const genders = useMemo(() => { const present = new Set(results.map((result) => result.gender).filter(Boolean)); return (['M', 'W'] as const).filter((gender) => present.has(gender)) }, [results])
  const [internalGender, setInternalGender] = useState<Gender | undefined>(genders[0])
  const selectedGender = controlledGender ?? internalGender

  useEffect(() => {
    if (!controlledGender) setInternalGender(genders[0])
    setSortKey('overall')
  }, [results, genders, controlledGender])

  const selectGender = (gender: Gender) => {
    if (onGenderChange) onGenderChange(gender)
    else setInternalGender(gender)
    setSortKey('overall')
  }

  const visibleResults = useMemo(() => selectedGender ? results.filter((result) => result.gender === selectedGender) : results, [results, selectedGender])
  const sortedResults = useMemo(() => sortRaceResults(visibleResults, sortKey), [visibleResults, sortKey])
  const bestSwim = useMemo(() => getBestSplit(visibleResults, 'swim'), [visibleResults])
  const bestBike = useMemo(() => getBestSplit(visibleResults, 'bike'), [visibleResults])
  const bestRun = useMemo(() => getBestSplit(visibleResults, 'run'), [visibleResults])
  const athleteFlag = (result: RaceResult, athlete?: Athlete) => countryCodeToFlag(result.countryCode) || athlete?.flag || ''

  return <div className="results-table">
    <div className="results-table__toolbar"><div className="results-table__title-row"><h2>Результаты</h2>{showGenderTabs && genders.length > 1 && <div className="results-table__gender-tabs" aria-label="Категория результатов">{genders.map((gender) => <button key={gender} className={selectedGender === gender ? 'is-active' : ''} onClick={() => selectGender(gender)}>{genderLabels[gender]}</button>)}</div>}</div>
      <div className="results-table__sort-tabs">{sortOptions.map((option) => <button key={option.key} className={sortKey === option.key ? 'is-active' : ''} onClick={() => setSortKey(option.key)}>{option.label}</button>)}</div></div>
    <div className="results-table__desktop-wrap"><table className="results-table__desktop"><thead><tr><th>#</th><th>Athlete</th><th><button className={sortKey === 'swim' ? 'is-active-sort' : ''} onClick={() => setSortKey('swim')}>Swim</button></th><th>T1</th><th><button className={sortKey === 'bike' ? 'is-active-sort' : ''} onClick={() => setSortKey('bike')}>Bike</button></th><th>T2</th><th><button className={sortKey === 'run' ? 'is-active-sort' : ''} onClick={() => setSortKey('run')}>Run</button></th><th><button className={sortKey === 'overall' ? 'is-active-sort' : ''} onClick={() => setSortKey('overall')}>Total</button></th></tr></thead><tbody>
      {sortedResults.map((result, index) => { const athlete = result.athleteId ? athletes.find((item) => item.id === result.athleteId) : undefined; const selectedTime = getResultTime(result, sortKey); const splitRank = sortKey !== 'overall' && selectedTime ? index + 1 : undefined; const flag = athleteFlag(result, athlete); return <tr key={result.id} className={athlete ? 'is-clickable' : ''} onClick={() => athlete && onAthleteClick(athlete)}><td className="results-table__position"><span>{result.position}</span>{sortKey !== 'overall' && <small>({splitRank ?? '—'})</small>}</td><td><div className="results-table__athlete">{athlete?.image ? <img src={athlete.image} alt="" /> : <span className="results-table__avatar">{result.athleteName.charAt(0)}</span>}<div><strong>{result.athleteName}{flag ? ` ${flag}` : ''}</strong>{result.country && <small>{result.country}</small>}</div></div></td><td><span className={result.swimTime === bestSwim ? 'best-split-badge' : ''}>{result.swimTime ?? '—'}</span></td><td>{result.t1Time ?? '—'}</td><td><span className={result.bikeTime === bestBike ? 'best-split-badge' : ''}>{result.bikeTime ?? '—'}</span></td><td>{result.t2Time ?? '—'}</td><td><span className={result.runTime === bestRun ? 'best-split-badge' : ''}>{result.runTime ?? '—'}</span></td><td className="results-table__total">{typeof result.position === 'string' ? result.position : result.totalTime ?? '—'}</td></tr> })}
    </tbody></table></div>
    <div className="results-table__mobile"><div className="results-table__mobile-head"><span>#</span><span>Athlete</span><span>{sortOptions.find((option) => option.key === sortKey)?.label}</span></div>
      {sortedResults.map((result, index) => { const athlete = result.athleteId ? athletes.find((item) => item.id === result.athleteId) : undefined; const selectedTime = getResultTime(result, sortKey); const splitRank = sortKey !== 'overall' && selectedTime ? index + 1 : undefined; const isBestSelectedSplit = (sortKey === 'swim' && selectedTime === bestSwim) || (sortKey === 'bike' && selectedTime === bestBike) || (sortKey === 'run' && selectedTime === bestRun); const flag = athleteFlag(result, athlete); return <button type="button" className={`results-table__mobile-row ${athlete ? 'is-clickable' : ''}`} key={result.id} onClick={() => athlete && onAthleteClick(athlete)}><span className="results-table__mobile-rank"><span>{result.position}</span>{sortKey !== 'overall' && <small>({splitRank ?? '—'})</small>}</span><span className="results-table__mobile-athlete">{athlete?.image ? <img src={athlete.image} alt="" /> : <span className="results-table__avatar">{result.athleteName.charAt(0)}</span>}<span><strong>{result.athleteName}{flag ? ` ${flag}` : ''}</strong>{result.country && <small>{result.country}</small>}</span></span><strong className="results-table__mobile-time"><span className={isBestSelectedSplit ? 'best-split-badge' : ''}>{sortKey === 'overall' && typeof result.position === 'string' ? result.position : selectedTime ?? '—'}</span></strong></button> })}
    </div>
  </div>
}
export default RaceResultsTable