import { athletes } from '../data/athletes'
import { raceResults } from '../data/results'
import { allRaceEditionViews } from '../data/raceEditions'
import { linkResultsToAthletes } from '../utils/raceResults'
import { calculateAthleteRanking, sortAthletesByRanking } from '../utils/athleteRanking'
import { getRankingDatasetClock } from '../utils/rankingDatasetClock'

export { athletes }
// Module evaluation is shared by every sports route. Keep the original dataset clock/order.
export const linkedRaceResults = linkResultsToAthletes(raceResults)
const rankingAsOf = getRankingDatasetClock(athletes, linkedRaceResults, allRaceEditionViews)
export const athleteRanking = calculateAthleteRanking(athletes, linkedRaceResults, allRaceEditionViews, rankingAsOf)
export const rankedAthletes = sortAthletesByRanking(athletes, linkedRaceResults, allRaceEditionViews, rankingAsOf, athleteRanking)
export const hasAthlete = (id?: string) => athletes.some(a => String(a.id) === id)
