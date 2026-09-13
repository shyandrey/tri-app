import type { RaceEditionView } from '../types/Race'
import { getChampionshipNavigationGroup } from './raceChampionshipGroup'

function isComplementaryGenderPair(a: RaceEditionView['gender'], b: RaceEditionView['gender']) {
  return (a === 'WPRO' && b === 'MPRO') || (a === 'MPRO' && b === 'WPRO')
}

function areAdjacentDates(a: string, b: string) {
  const aTime = new Date(a).getTime()
  const bTime = new Date(b).getTime()
  if (Number.isNaN(aTime) || Number.isNaN(bTime)) return false
  const diffDays = Math.abs(aTime - bTime) / 86_400_000
  return diffDays <= 1
}

function formatCombinedDate(first: RaceEditionView, second: RaceEditionView) {
  const firstMatch = first.date.match(/^(\d{1,2})\s+(.+)$/)
  const secondMatch = second.date.match(/^(\d{1,2})\s+(.+)$/)

  if (firstMatch && secondMatch && firstMatch[2] === secondMatch[2]) {
    return `${firstMatch[1]}–${secondMatch[1]} ${firstMatch[2]}`
  }

  return `${first.date} – ${second.date}`
}

function hasSamePresentationIdentity(a: RaceEditionView, b: RaceEditionView) {
  if (a.raceId === b.raceId) return true

  const aChampionshipGroup = getChampionshipNavigationGroup(a)
  const bChampionshipGroup = getChampionshipNavigationGroup(b)
  return Boolean(aChampionshipGroup && aChampionshipGroup === bChampionshipGroup)
}

function canGroupForHome(a: RaceEditionView, b: RaceEditionView) {
  return Boolean(
    hasSamePresentationIdentity(a, b) &&
    a.year === b.year &&
    a.name === b.name &&
    a.series === b.series &&
    a.distance === b.distance &&
    a.city === b.city &&
    a.country === b.country &&
    isComplementaryGenderPair(a.gender, b.gender) &&
    areAdjacentDates(a.dateISO, b.dateISO),
  )
}

export function groupRacesForHome(races: RaceEditionView[]) {
  const grouped: RaceEditionView[] = []
  const used = new Set<number>()

  races.forEach((race, index) => {
    if (used.has(index)) return

    const partnerIndex = races.findIndex((candidate, candidateIndex) =>
      candidateIndex > index && !used.has(candidateIndex) && canGroupForHome(race, candidate),
    )

    if (partnerIndex === -1) {
      grouped.push(race)
      return
    }

    const partner = races[partnerIndex]
    const [first, second] = [race, partner].sort((a, b) => a.dateISO.localeCompare(b.dateISO))

    grouped.push({
      ...first,
      date: formatCombinedDate(first, second),
      dateISO: second.dateISO,
      gender: 'WPRO+MPRO',
    })

    used.add(partnerIndex)
  })

  return grouped
}
