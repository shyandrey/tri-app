import OfficialRankingsPage from '../pages/OfficialRankingsPage'
import { athletes } from '../data/athletes'
import type { Route } from '../navigation/history'
import { genericFeedbackContext } from '../../shared/feedback'

export default function RankingsArea({ navigate, back }: {
  route: Route
  navigate: (route: Route) => void
  back: () => void
}) {
  return <OfficialRankingsPage athletes={athletes} onBack={back}
    onNavigate={page => navigate({ page })}
    onAthleteClick={athlete => navigate({ page: 'athlete', id: String(athlete.id) })}
    onFeedback={() => navigate({ page: 'feedback', feedback: genericFeedbackContext })} />
}
