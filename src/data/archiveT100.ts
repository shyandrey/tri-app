import type { RaceEdition, RaceEntity, RaceGender } from '../types/Race'

const source2024 = 'https://stats.protriathletes.org/t100/results?season=2'
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

const races2024: T100ArchiveRace[] = [
  { raceId: 't100-miami', name: 'Miami T100', dateISO: '2024-03-09', date: '9 марта', city: 'Майами', country: 'США', gender: 'WPRO & MPRO' },
  { raceId: 't100-singapore', name: 'Singapore T100', dateISO: '2024-04-13', date: '13 апреля', city: 'Сингапур', country: 'Сингапур', gender: 'WPRO', suffix: 'women' },
  { raceId: 't100-singapore', name: 'Singapore T100', dateISO: '2024-04-14', date: '14 апреля', city: 'Сингапур', country: 'Сингапур', gender: 'MPRO', suffix: 'men' },
  { raceId: 't100-san-francisco', name: 'San Francisco T100', dateISO: '2024-06-08', date: '8 июня', city: 'Сан-Франциско', country: 'США', gender: 'WPRO & MPRO' },
  { raceId: 't100-london', name: 'London T100', dateISO: '2024-07-27', date: '27 июля', city: 'Лондон', country: 'Великобритания', gender: 'WPRO', suffix: 'women' },
  { raceId: 't100-london', name: 'London T100', dateISO: '2024-07-28', date: '28 июля', city: 'Лондон', country: 'Великобритания', gender: 'MPRO', suffix: 'men' },
  { raceId: 't100-ibiza', name: 'Ibiza T100', dateISO: '2024-09-28', date: '28 сентября', city: 'Ибица', country: 'Испания', gender: 'WPRO & MPRO' },
  { raceId: 't100-lake-las-vegas', name: 'Lake Las Vegas T100', dateISO: '2024-10-19', date: '19 октября', city: 'Лас-Вегас', country: 'США', gender: 'WPRO & MPRO' },
  { raceId: 't100-dubai', name: 'Dubai T100', dateISO: '2024-11-16', date: '16 ноября', city: 'Дубай', country: 'ОАЭ', gender: 'WPRO', suffix: 'women' },
  { raceId: 't100-dubai', name: 'Dubai T100', dateISO: '2024-11-17', date: '17 ноября', city: 'Дубай', country: 'ОАЭ', gender: 'MPRO', suffix: 'men' },
]

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

const toEdition = (race: T100ArchiveRace, year: 2024 | 2025, sourceUrl: string): RaceEdition => ({
  id: `${race.raceId}-${year}${race.suffix ? `-${race.suffix}` : ''}`,
  raceId: race.raceId,
  year,
  series: 'Triathlon World Tour',
  date: race.date,
  dateISO: race.dateISO,
  swim: '2 км',
  bike: '80 км',
  run: '18 км',
  description: `Этап T100 Triathlon World Tour ${year}: ${race.name}.`,
  gender: race.gender,
  sourceUrl,
})

export const t1002024Editions: RaceEdition[] = races2024.map((race) => toEdition(race, 2024, source2024))
export const t1002025Editions: RaceEdition[] = races2025.map((race) => toEdition(race, 2025, source2025))

export const archiveT100RaceEntities: RaceEntity[] = Array.from(
  new Map(
    [...races2024, ...races2025].map((race) => [race.raceId, {
      id: race.raceId,
      name: race.name,
      country: race.country,
      city: race.city,
      distance: 'T100' as const,
    }])
  ).values()
)
