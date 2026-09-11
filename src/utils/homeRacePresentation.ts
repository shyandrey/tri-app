import type { Race } from '../types/Race'

function isComplementaryGenderPair(a?: Race['gender'], b?: Race['gender']) {
  return (a === 'WPRO' && b === 'MPRO') || (a === 'MPRO' && b === 'WPRO')
}

function areAdjacentDates(a: string, b: string) {
  const aTime = new Date(a).getTime()
  const bTime = new Date(b).getTime()
  if (Number.isNaN(aTime) || Number.isNaN(bTime)) return false
  const diffDays = Math.abs(aTime - bTime) / 86_400_000
  return diffDays <= 1
}

function formatCombinedDate(first: Race, second: Race) {
  const firstMatch = first.date.match(/^(\d{1,2})\s+(.+)$/)
  const secondMatch = second.date.match(/^(\d{1,2})\s+(.+)$/)

  if (firstMatch && secondMatch && firstMatch[2] === secondMatch[2]) {
    return `${firstMatch[1]}–${secondMatch[1]} ${firstMatch[2]}`
  }

  return `${first.date} – ${second.date}`
}

function canGroupForHome(a: Race, b: Race) {
  return Boolean(
    a.raceId &&
    b.raceId &&
    a.raceId === b.raceId &&
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

export function groupRacesForHome(races: Race[]) {
  const grouped: Race[] = []
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
      gender: 'WPRO & MPRO',
    })

    used.add(partnerIndex)
  })

  return grouped
}
