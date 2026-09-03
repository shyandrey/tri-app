import type { RaceEdition, RaceEntity, RaceGender } from '../types/Race'

const source2025 = 'https://stats.protriathletes.org/t100/results?season=3'

type T100ArchiveRace = {
  raceId: string
  name: string
  dateISO: string
  date: string
  city: string
  country: string
  gender: RaceGender
  suffix?: string
}

const races2025: T100ArchiveRace[] = [
  { raceId: 't100-singapore', name: 'Singapore T100', dateISO: '2025-04-05', date: '5 апреля', city: 'Сингапур', country: 'Сингапур', gender: 'WPRO', suffix: 'women' },
  { raceId: 't100-singapore', name: 'Singapore T100', dateISO: '2025-04-06', date: '6 апреля', city: 'Сингапур', country: 'Сингапур', gender: 'MPRO', suffix: 'men' },
  { raceId: 't100-san-francisco', name: 'San Francisco T100', dateISO: '2025-05-31', date: '31 мая', city: 'Сан-Франциско', country: 'США', gender: 'WPRO & MPRO' },
  { raceId: 't100-vancouver', name: 'Vancouver T100', dateISO: '2025-06-14', date: '14 июня', city: 'Ванкувер', country: 'Канада', gender: 'WPRO & MPRO' },
  { raceId: 't100-london', name: 'London T100', dateISO: '2025-08-09', date: '9 августа', city: 'Лондон', country: 'Великобритания', gender: 'WPRO & MPRO' },
  { raceId: 't100-french-riviera', name: 'EKOÏ French Riviera T100', dateISO: '2025-08-30', date: '30 августа', city: 'Сен-Рафаэль / Фрежюс', country: 'Франция', gender: 'WPRO & MPRO' },
  { raceId: 't100-spain', name: 'Spain T100', dateISO: '2025-09-20', date: '20 сентября', city: 'Оропеса-дель-Мар', country: 'Испания', gender: 'WPRO & MPRO' },
  { raceId: 't100-wollongong', name: 'Wollongong T100', dateISO: '2025-10-18', date: '18 октября', city: 'Вуллонгонг', country: 'Австралия', gender: 'WPRO & MPRO' },
  { raceId: 't100-dubai', name: 'Dubai T100', dateISO: '2025-11-15', date: '15 ноября', city: 'Дубай', country: 'ОАЭ', gender: 'WPRO & MPRO' },
  { raceId: 't100-qatar', name: 'Qatar T100 World Championship Final', dateISO: '2025-12-12', date: '12 декабря', city: 'Доха / Лусаил', country: 'Катар', gender: 'WPRO & MPRO' },
]

export const t1002025Editions: RaceEdition[] = races2025.map((race) => ({
  id: `${race.raceId}-2025${race.suffix ? `-${race.suffix}` : ''}`,
  raceId: race.raceId,
  year: 2025,
  series: 'Triathlon World Tour',
  date: race.date,
  dateISO: race.dateISO,
  swim: '2 км',
  bike: '80 км',
  run: '18 км',
  description: `Этап T100 Triathlon World Tour 2025: ${race.name}.`,
  gender: race.gender,
  sourceUrl: source2025,
}))

export const archiveT100RaceEntities: RaceEntity[] = Array.from(
  new Map(
    races2025.map((race) => [race.raceId, {
      id: race.raceId,
      name: race.name,
      country: race.country,
      city: race.city,
      distance: 'T100' as const,
    }])
  ).values()
)
