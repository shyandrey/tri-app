import AthletesPage from '../pages/AthletesPage'
import AthleteDetailPage from '../pages/AthleteDetailPage'
import RaceDetailPage from '../pages/RaceDetailPage'
import { athletes, linkedRaceResults, rankedAthletes, athleteRanking } from './data'
import { allRaceEditionViews } from '../data/raceEditions'
import { getResultsByAthlete } from '../utils/raceResults'
import type { Route } from '../navigation/history'
import type { Page } from '../types/Page'
import { genericFeedbackContext } from '../../shared/feedback'
import type { FeedbackContext } from '../../shared/feedback'

export default function SportsArea({ route, navigate, back }: { route: Route; navigate: (route: Route) => void; back: () => void }) {
  const onNavigate = (page: Page) => navigate({ page })
  const openFeedback = (feedback: FeedbackContext) => navigate({ page: 'feedback', feedback })
  const onAthleteClick = (athlete: typeof athletes[number]) => navigate({ page: 'athlete', id: String(athlete.id) })
  if (route.page === 'athletes') return <AthletesPage athletes={rankedAthletes} ranking={athleteRanking} onBack={back} onNavigate={onNavigate} onAthleteClick={onAthleteClick} />
  if (route.page === 'race') {
    const race = allRaceEditionViews.find(r => r.editionId === route.id)!
    return <RaceDetailPage onFeedback={openFeedback} race={race} raceEditions={allRaceEditionViews} allResults={linkedRaceResults} athletes={athletes} onBack={back} onNavigate={onNavigate} onAthleteClick={onAthleteClick} />
  }
  const athlete = athletes.find(a => String(a.id) === route.id)!
  return <AthleteDetailPage onFeedback={() => openFeedback({ ...genericFeedbackContext, screen: 'athlete', route: `#/athlete/${athlete.id}`, athleteId: athlete.id, athleteName: [athlete.name, athlete.nameEn].filter((v, i, a) => v && a.indexOf(v) === i).join(' / ') })} athlete={athlete} results={getResultsByAthlete(linkedRaceResults, athlete.id)} races={allRaceEditionViews} onBack={back} onNavigate={onNavigate} onRaceClick={race => navigate({ page: 'race', id: race.editionId })} />
}
