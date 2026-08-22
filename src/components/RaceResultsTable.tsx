import { useMemo, useState } from 'react'
import type { Athlete } from '../types/Athlete'
import type { RaceResult } from '../types/RaceResult'
import { countryCodeToFlag } from '../utils/countryFlag'
import {
  getBestSplit,
  getResultTime,
  sortRaceResults,
  type ResultSortKey,
} from '../utils/raceResultTime'
import './RaceResultsTable.css'

type RaceResultsTableProps = {
  results: RaceResult[]
  athletes: Athlete[]
  onAthleteClick: (athlete: Athlete) => void
}

const sortOptions: { key: ResultSortKey; label: string }[] = [
  { key: 'overall', label: 'Overall' },
  { key: 'swim', label: 'Swim' },
  { key: 'bike', label: 'Bike' },
  { key: 'run', label: 'Run' },
]

function RaceResultsTable({
  results,
  athletes,
  onAthleteClick,
}: RaceResultsTableProps) {
  const [sortKey, setSortKey] = useState<ResultSortKey>('overall')

  const sortedResults = useMemo(
    () => sortRaceResults(results, sortKey),
    [results, sortKey]
  )

  const bestSwim = useMemo(() => getBestSplit(results, 'swim'), [results])
  const bestBike = useMemo(() => getBestSplit(results, 'bike'), [results])
  const bestRun = useMemo(() => getBestSplit(results, 'run'), [results])

  return (
    <div className="results-table">
      <div className="results-table__toolbar">
        <h2>Результаты</h2>

        <div className="results-table__sort-tabs">
          {sortOptions.map((option) => (
            <button
              key={option.key}
              className={sortKey === option.key ? 'is-active' : ''}
              onClick={() => setSortKey(option.key)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="results-table__desktop-wrap">
        <table className="results-table__desktop">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Athlete</th>
              <th><button onClick={() => setSortKey('swim')}>Swim</button></th>
              <th>T1</th>
              <th><button onClick={() => setSortKey('bike')}>Bike</button></th>
              <th>T2</th>
              <th><button onClick={() => setSortKey('run')}>Run</button></th>
              <th><button onClick={() => setSortKey('overall')}>Total</button></th>
            </tr>
          </thead>

          <tbody>
            {sortedResults.map((result) => {
              const athlete = result.athleteId
                ? athletes.find((item) => item.id === result.athleteId)
                : undefined

              return (
                <tr
                  key={result.id}
                  className={athlete ? 'is-clickable' : ''}
                  onClick={() => athlete && onAthleteClick(athlete)}
                >
                  <td className="results-table__position">{result.position}</td>
                  <td>
                    <div className="results-table__athlete">
                      {athlete?.image ? (
                        <img src={athlete.image} alt="" />
                      ) : (
                        <span className="results-table__avatar">
                          {result.athleteName.charAt(0)}
                        </span>
                      )}

                      <div>
                        <strong>
                          {result.athleteName}{' '}
                          {countryCodeToFlag(result.countryCode)}
                        </strong>
                        {result.country && <small>{result.country}</small>}
                      </div>
                    </div>
                  </td>
                  <td className={result.swimTime === bestSwim ? 'is-best-split' : ''}>
                    {result.swimTime ?? '—'}
                  </td>
                  <td>{result.t1Time ?? '—'}</td>
                  <td className={result.bikeTime === bestBike ? 'is-best-split' : ''}>
                    {result.bikeTime ?? '—'}
                  </td>
                  <td>{result.t2Time ?? '—'}</td>
                  <td className={result.runTime === bestRun ? 'is-best-split' : ''}>
                    {result.runTime ?? '—'}
                  </td>
                  <td className="results-table__total">
                    {typeof result.position === 'string'
                      ? result.position
                      : result.totalTime ?? '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="results-table__mobile">
        <div className="results-table__mobile-head">
          <span>#</span>
          <span>Athlete</span>
          <span>{sortOptions.find((option) => option.key === sortKey)?.label}</span>
        </div>

        {sortedResults.map((result, index) => {
          const athlete = result.athleteId
            ? athletes.find((item) => item.id === result.athleteId)
            : undefined
          const selectedTime = getResultTime(result, sortKey)

          return (
            <button
              type="button"
              className={`results-table__mobile-row ${athlete ? 'is-clickable' : ''}`}
              key={result.id}
              onClick={() => athlete && onAthleteClick(athlete)}
            >
              <span className="results-table__mobile-rank">
                {sortKey === 'overall' ? result.position : index + 1}
              </span>

              <span className="results-table__mobile-athlete">
                {athlete?.image ? (
                  <img src={athlete.image} alt="" />
                ) : (
                  <span className="results-table__avatar">
                    {result.athleteName.charAt(0)}
                  </span>
                )}

                <span>
                  <strong>
                    {result.athleteName}{' '}
                    {countryCodeToFlag(result.countryCode)}
                  </strong>
                  {result.country && <small>{result.country}</small>}
                </span>
              </span>

              <strong className="results-table__mobile-time">
                {sortKey === 'overall' && typeof result.position === 'string'
                  ? result.position
                  : selectedTime ?? '—'}
              </strong>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default RaceResultsTable
