import master from '../../data/calendar/2027-master.json'
import type { RaceDesignation, RaceEdition, RaceEntity } from '../types/Race'

// Reviewed identity decisions. Master bytes/dates/provenance are retained unchanged.
const identities: Record<string, string> = {
  'gold-coast-t100': 't100-gold-coast',
  'singapore-t100': 't100-singapore',
  'french-riviera-t100': 't100-french-riviera',
  'san-francisco-t100': 't100-san-francisco',
  'vancouver-t100': 't100-vancouver',
  'marbella-t100': 't100-spain',
  'saudi-arabia-t100': 't100-saudi-arabia',
  'qatar-t100-world-championship-final': 't100-qatar',
  'ironman-70-3-world-championship-chattanooga': 'ironman-70-3-world-championship',
  'ironman-world-championship-kona': 'ironman-world-championship',
}
const newKeys = new Set(['ironman-70-3-muscat', 'ironman-70-3-valencia', 'ironman-lanzarote', 'ironman-70-3-tours-metropole', 'ironman-70-3-jonkoping', 'ironman-70-3-leipzig'])
export const calendar2027Entities: RaceEntity[] = master.races.filter(r => newKeys.has(r.key)).map(r => ({
  id: r.key, name: r.name, distance: r.distance as RaceEntity['distance'], city: '', country: '',
}))
// Canonical championship entity; host-specific historical IDs remain valid aliases.
calendar2027Entities.push({ id: 'ironman-world-championship', name: 'IRONMAN World Championship', distance: 'IRONMAN', city: '', country: '' })

const formatDate = (iso: string) => new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`))
export const calendar2027Editions: RaceEdition[] = master.races.map((entry, index) => {
  const raceId = identities[entry.key] ?? entry.key
  const designation: RaceDesignation = raceId === 'ironman-70-3-world-championship' ? 'world_championship_70_3'
    : raceId === 'ironman-world-championship' ? 'world_championship_ironman'
      : raceId === 't100-qatar' ? 'series_final' : 'regular'
  const venue = raceId === 't100-spain' ? { city: 'Марбелья', country: 'Испания' }
    : raceId === 'ironman-70-3-world-championship' ? { city: 'Чаттануга', country: 'США' }
      : raceId === 'ironman-world-championship' ? { city: 'Кона', country: 'США' } : {}
  return {
    id: `${raceId}-2027`, raceId, year: 2027, legacyId: -202700 - index,
    displayName: entry.name,
    series: entry.series as RaceEdition['series'], designation, ...venue,
    date: entry.dateStart === entry.dateEnd ? formatDate(entry.dateStart) : `${formatDate(entry.dateStart)} – ${formatDate(entry.dateEnd)}`,
    dateISO: entry.dateStart, dateEndISO: entry.dateEnd, dateKind: entry.dateKind,
    gender: entry.gender === 'TBD' ? 'UNKNOWN' : 'WPRO+MPRO',
    // No guessed PRO day, course measurements, Stats PTO URL or SOF.
    swim: '', bike: '', run: '',
    description: entry.dateStart !== entry.dateEnd ? 'Даты мероприятия. День профессионального старта уточняется.' : '',
    ...(entry.sourceUrl ? { sourceUrl: entry.sourceUrl } : {}),
  }
})
export const calendar2027Provenance = master
