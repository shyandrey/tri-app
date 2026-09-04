import type { RaceEdition, RaceEntity, RaceGender } from '../types/Race'

const source2024 = 'https://www.ironman.com/news/2024-ironman-pro-series-how-it-works'
const source2025 = 'https://www.ironman.com/news/ironman-pro-series-returns-2025-seven-new-host-venues'

type ArchiveRace = {
  raceId: string
  name: string
  dateISO: string
  date: string
  city: string
  country: string
  distance: 'IRONMAN' | '70.3'
  gender: RaceGender
  suffix?: string
}

const distances = {
  IRONMAN: { swim: '3.8 км', bike: '180 км', run: '42.2 км' },
  '70.3': { swim: '1.9 км', bike: '90 км', run: '21.1 км' },
} as const

const races2024: ArchiveRace[] = [
  { raceId: 'ironman-70-3-oceanside', name: 'IRONMAN 70.3 Oceanside', dateISO: '2024-04-06', date: '6 апреля', city: 'Оушенсайд', country: 'США', distance: '70.3', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-texas', name: 'IRONMAN Texas North American Championship', dateISO: '2024-04-27', date: '27 апреля', city: 'Вудлендс', country: 'США', distance: 'IRONMAN', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-70-3-st-george', name: 'IRONMAN 70.3 St. George North American Championship', dateISO: '2024-05-04', date: '4 мая', city: 'Сент-Джордж', country: 'США', distance: '70.3', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-70-3-mallorca', name: 'IRONMAN 70.3 Alcúdia-Mallorca', dateISO: '2024-05-11', date: '11 мая', city: 'Алькудия', country: 'Испания', distance: '70.3', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-70-3-chattanooga', name: 'IRONMAN 70.3 Chattanooga', dateISO: '2024-05-19', date: '19 мая', city: 'Чаттануга', country: 'США', distance: '70.3', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-hamburg', name: 'IRONMAN Hamburg European Championship', dateISO: '2024-06-02', date: '2 июня', city: 'Гамбург', country: 'Германия', distance: 'IRONMAN', gender: 'WPRO' },
  { raceId: 'ironman-70-3-boulder', name: 'IRONMAN 70.3 Boulder', dateISO: '2024-06-08', date: '8 июня', city: 'Боулдер', country: 'США', distance: '70.3', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-cairns', name: 'IRONMAN Cairns Asia-Pacific Championship', dateISO: '2024-06-16', date: '16 июня', city: 'Кэрнс', country: 'Австралия', distance: 'IRONMAN', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-70-3-mont-tremblant', name: 'IRONMAN 70.3 Mont-Tremblant', dateISO: '2024-06-23', date: '23 июня', city: 'Мон-Тремблан', country: 'Канада', distance: '70.3', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-70-3-les-sables', name: 'IRONMAN 70.3 Les Sables d’Olonne', dateISO: '2024-06-29', date: '29 июня', city: 'Ле-Сабль-д’Олон', country: 'Франция', distance: '70.3', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-vitoria-gasteiz', name: 'IRONMAN Vitoria-Gasteiz', dateISO: '2024-07-14', date: '14 июля', city: 'Витория-Гастейс', country: 'Испания', distance: 'IRONMAN', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-lake-placid', name: 'IRONMAN Lake Placid', dateISO: '2024-07-21', date: '21 июля', city: 'Лейк-Плэсид', country: 'США', distance: 'IRONMAN', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-frankfurt', name: 'IRONMAN Frankfurt European Championship', dateISO: '2024-08-18', date: '18 августа', city: 'Франкфурт', country: 'Германия', distance: 'IRONMAN', gender: 'MPRO' },
  { raceId: 'ironman-70-3-tallinn', name: 'IRONMAN 70.3 Tallinn European Championship', dateISO: '2024-08-25', date: '25 августа', city: 'Таллин', country: 'Эстония', distance: '70.3', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-70-3-zell-am-see', name: 'IRONMAN 70.3 Zell am See-Kaprun', dateISO: '2024-09-01', date: '1 сентября', city: 'Целль-ам-Зее', country: 'Австрия', distance: '70.3', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-world-championship-nice', name: 'IRONMAN World Championship', dateISO: '2024-09-22', date: '22 сентября', city: 'Ницца', country: 'Франция', distance: 'IRONMAN', gender: 'WPRO', suffix: 'women' },
  { raceId: 'ironman-world-championship-kona', name: 'IRONMAN World Championship', dateISO: '2024-10-26', date: '26 октября', city: 'Кона', country: 'США', distance: 'IRONMAN', gender: 'MPRO', suffix: 'men' },
  { raceId: 'ironman-70-3-western-australia', name: 'IRONMAN 70.3 Western Australia', dateISO: '2024-12-01', date: '1 декабря', city: 'Басселтон', country: 'Австралия', distance: '70.3', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-70-3-world-championship-taupo', name: 'IRONMAN 70.3 World Championship', dateISO: '2024-12-14', date: '14 декабря', city: 'Таупо', country: 'Новая Зеландия', distance: '70.3', gender: 'WPRO', suffix: 'women' },
  { raceId: 'ironman-70-3-world-championship-taupo', name: 'IRONMAN 70.3 World Championship', dateISO: '2024-12-15', date: '15 декабря', city: 'Таупо', country: 'Новая Зеландия', distance: '70.3', gender: 'MPRO', suffix: 'men' },
]

const races2025: ArchiveRace[] = [
  { raceId: 'ironman-70-3-geelong', name: 'IRONMAN 70.3 Geelong', dateISO: '2025-03-23', date: '23 марта', city: 'Джилонг', country: 'Австралия', distance: '70.3', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-south-africa', name: 'IRONMAN South Africa African Championship', dateISO: '2025-03-30', date: '30 марта', city: 'Гкеберха', country: 'ЮАР', distance: 'IRONMAN', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-70-3-oceanside', name: 'IRONMAN 70.3 Oceanside', dateISO: '2025-04-05', date: '5 апреля', city: 'Оушенсайд', country: 'США', distance: '70.3', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-texas', name: 'IRONMAN Texas North American Championship', dateISO: '2025-04-26', date: '26 апреля', city: 'Вудлендс', country: 'США', distance: 'IRONMAN', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-70-3-venice-jesolo', name: 'IRONMAN 70.3 Venice-Jesolo', dateISO: '2025-05-04', date: '4 мая', city: 'Езоло', country: 'Италия', distance: '70.3', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-70-3-st-george', name: 'IRONMAN 70.3 St. George North American Championship', dateISO: '2025-05-10', date: '10 мая', city: 'Сент-Джордж', country: 'США', distance: '70.3', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-70-3-aix-en-provence', name: 'IRONMAN 70.3 Aix-en-Provence', dateISO: '2025-05-18', date: '18 мая', city: 'Экс-ан-Прованс', country: 'Франция', distance: '70.3', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-hamburg', name: 'IRONMAN Hamburg European Championship', dateISO: '2025-06-01', date: '1 июня', city: 'Гамбург', country: 'Германия', distance: 'IRONMAN', gender: 'WPRO' },
  { raceId: 'ironman-70-3-eagleman', name: 'IRONMAN 70.3 Eagleman', dateISO: '2025-06-08', date: '8 июня', city: 'Кембридж', country: 'США', distance: '70.3', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-cairns', name: 'IRONMAN Cairns', dateISO: '2025-06-15', date: '15 июня', city: 'Кэрнс', country: 'Австралия', distance: 'IRONMAN', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-frankfurt', name: 'IRONMAN Frankfurt European Championship', dateISO: '2025-06-29', date: '29 июня', city: 'Франкфурт', country: 'Германия', distance: 'IRONMAN', gender: 'MPRO' },
  { raceId: 'ironman-70-3-swansea', name: 'IRONMAN 70.3 Swansea', dateISO: '2025-07-13', date: '13 июля', city: 'Суонси', country: 'Великобритания', distance: '70.3', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-lake-placid', name: 'IRONMAN Lake Placid', dateISO: '2025-07-20', date: '20 июля', city: 'Лейк-Плэсид', country: 'США', distance: 'IRONMAN', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-70-3-zell-am-see', name: 'IRONMAN 70.3 Zell am See-Kaprun', dateISO: '2025-08-31', date: '31 августа', city: 'Целль-ам-Зее', country: 'Австрия', distance: '70.3', gender: 'WPRO & MPRO' },
  { raceId: 'ironman-world-championship-nice', name: 'IRONMAN World Championship', dateISO: '2025-09-14', date: '14 сентября', city: 'Ницца', country: 'Франция', distance: 'IRONMAN', gender: 'MPRO', suffix: 'men' },
  { raceId: 'ironman-world-championship-kona', name: 'IRONMAN World Championship', dateISO: '2025-10-11', date: '11 октября', city: 'Кона', country: 'США', distance: 'IRONMAN', gender: 'WPRO', suffix: 'women' },
  { raceId: 'ironman-70-3-world-championship-marbella', name: 'IRONMAN 70.3 World Championship', dateISO: '2025-11-08', date: '8 ноября', city: 'Марбелья', country: 'Испания', distance: '70.3', gender: 'WPRO', suffix: 'women' },
  { raceId: 'ironman-70-3-world-championship-marbella', name: 'IRONMAN 70.3 World Championship', dateISO: '2025-11-09', date: '9 ноября', city: 'Марбелья', country: 'Испания', distance: '70.3', gender: 'MPRO', suffix: 'men' },
]

function toEdition(race: ArchiveRace, year: 2024 | 2025, sourceUrl: string): RaceEdition {
  return {
    id: `${race.raceId}-${year}${race.suffix ? `-${race.suffix}` : ''}`,
    raceId: race.raceId,
    year,
    series: 'IRONMAN Pro Series',
    date: race.date,
    dateISO: race.dateISO,
    ...distances[race.distance],
    description: `Этап IRONMAN Pro Series ${year}: ${race.name}.`,
    gender: race.gender,
    sourceUrl,
  }
}

export const ironmanProSeries2024Editions = races2024.map((race) => toEdition(race, 2024, source2024))
export const ironmanProSeries2025Editions = races2025.map((race) => toEdition(race, 2025, source2025))

export const archiveIronmanRaceEntities: RaceEntity[] = Array.from(
  new Map(
    [...races2024, ...races2025].map((race) => [race.raceId, {
      id: race.raceId,
      name: race.name,
      country: race.country,
      city: race.city,
      distance: race.distance,
    }])
  ).values()
)
