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

const sofByEditionId: Record<string, { women?: number; men?: number }> = {
  'ironman-70-3-oceanside-2024': {"women":89.21,"men":85.32},
  'ironman-texas-2024': {"women":83.32,"men":85.5},
  'ironman-70-3-st-george-2024': {"women":84.43,"men":83.88},
  'ironman-70-3-mallorca-2024': {"women":80.44,"men":90.11},
  'ironman-70-3-chattanooga-2024': {"women":83.38,"men":78.75},
  'ironman-hamburg-2024': {"women":84.07},
  'ironman-70-3-boulder-2024': {"women":72.74,"men":79.52},
  'ironman-cairns-2024': {"women":78.73,"men":82.82},
  'ironman-70-3-mont-tremblant-2024': {"women":86.4,"men":83.52},
  'ironman-70-3-les-sables-2024': {"women":82.91,"men":86.85},
  'ironman-vitoria-gasteiz-2024': {"women":81.75,"men":85.83},
  'ironman-lake-placid-2024': {"women":83.61,"men":85.76},
  'ironman-frankfurt-2024': {"men":89.88},
  'ironman-70-3-tallinn-2024': {"women":88.36,"men":84.35},
  'ironman-70-3-zell-am-see-2024': {"women":87.24,"men":85.72},
  'ironman-world-championship-nice-2024-women': {"women":93.85},
  'ironman-world-championship-kona-2024-men': {"men":93.08},
  'ironman-70-3-western-australia-2024': {"women":85.79,"men":84.17},
  'ironman-70-3-world-championship-taupo-2024-women': {"women":98.72},
  'ironman-70-3-world-championship-taupo-2024-men': {"men":93.64},
  'ironman-70-3-geelong-2025': {"women":80.97,"men":86.43},
  'ironman-south-africa-2025': {"women":85.87,"men":90.77},
  'ironman-70-3-oceanside-2025': {"women":88.88,"men":87.54},
  'ironman-texas-2025': {"women":93.16,"men":89.3},
  'ironman-70-3-venice-jesolo-2025': {"women":81.72,"men":85.96},
  'ironman-70-3-st-george-2025': {"women":88.04,"men":90.42},
  'ironman-70-3-aix-en-provence-2025': {"women":86.47,"men":85.68},
  'ironman-hamburg-2025': {"women":93.95},
  'ironman-70-3-eagleman-2025': {"women":83.69,"men":86.29},
  'ironman-cairns-2025': {"women":83.13,"men":84.08},
  'ironman-frankfurt-2025': {"men":91.69},
  'ironman-70-3-swansea-2025': {"women":88.08,"men":86.74},
  'ironman-lake-placid-2025': {"women":89.95,"men":89.08},
  'ironman-70-3-zell-am-see-2025': {"women":90.65,"men":82.1},
  'ironman-world-championship-nice-2025-men': {"men":94.96},
  'ironman-world-championship-kona-2025-women': {"women":98.28},
  'ironman-70-3-world-championship-marbella-2025-women': {"women":99.37},
  'ironman-70-3-world-championship-marbella-2025-men': {"men":96.53},
}

const distances = {
  IRONMAN: { swim: '3.8 км', bike: '180 км', run: '42.2 км' },
  '70.3': { swim: '1.9 км', bike: '90 км', run: '21.1 км' },
} as const

const races2024: ArchiveRace[] = [
  { raceId: 'ironman-70-3-oceanside', name: 'IRONMAN 70.3 Oceanside', dateISO: '2024-04-06', date: '6 апреля', city: 'Оушенсайд', country: 'США', distance: '70.3', gender: 'ALL' },
  { raceId: 'ironman-texas', name: 'IRONMAN Texas North American Championship', dateISO: '2024-04-27', date: '27 апреля', city: 'Вудлендс', country: 'США', distance: 'IRONMAN', gender: 'ALL' },
  { raceId: 'ironman-70-3-st-george', name: 'IRONMAN 70.3 St. George North American Championship', dateISO: '2024-05-04', date: '4 мая', city: 'Сент-Джордж', country: 'США', distance: '70.3', gender: 'ALL' },
  { raceId: 'ironman-70-3-mallorca', name: 'IRONMAN 70.3 Alcúdia-Mallorca', dateISO: '2024-05-11', date: '11 мая', city: 'Алькудия', country: 'Испания', distance: '70.3', gender: 'ALL' },
  { raceId: 'ironman-70-3-chattanooga', name: 'IRONMAN 70.3 Chattanooga', dateISO: '2024-05-19', date: '19 мая', city: 'Чаттануга', country: 'США', distance: '70.3', gender: 'ALL' },
  { raceId: 'ironman-hamburg', name: 'IRONMAN Hamburg European Championship', dateISO: '2024-06-02', date: '2 июня', city: 'Гамбург', country: 'Германия', distance: 'IRONMAN', gender: 'WPRO' },
  { raceId: 'ironman-70-3-boulder', name: 'IRONMAN 70.3 Boulder', dateISO: '2024-06-08', date: '8 июня', city: 'Боулдер', country: 'США', distance: '70.3', gender: 'ALL' },
  { raceId: 'ironman-cairns', name: 'IRONMAN Cairns Asia-Pacific Championship', dateISO: '2024-06-16', date: '16 июня', city: 'Кэрнс', country: 'Австралия', distance: 'IRONMAN', gender: 'ALL' },
  { raceId: 'ironman-70-3-mont-tremblant', name: 'IRONMAN 70.3 Mont-Tremblant', dateISO: '2024-06-23', date: '23 июня', city: 'Мон-Тремблан', country: 'Канада', distance: '70.3', gender: 'ALL' },
  { raceId: 'ironman-70-3-les-sables', name: 'IRONMAN 70.3 Les Sables d’Olonne', dateISO: '2024-06-29', date: '29 июня', city: 'Ле-Сабль-д’Олон', country: 'Франция', distance: '70.3', gender: 'ALL' },
  { raceId: 'ironman-vitoria-gasteiz', name: 'IRONMAN Vitoria-Gasteiz', dateISO: '2024-07-14', date: '14 июля', city: 'Витория-Гастейс', country: 'Испания', distance: 'IRONMAN', gender: 'ALL' },
  { raceId: 'ironman-lake-placid', name: 'IRONMAN Lake Placid', dateISO: '2024-07-21', date: '21 июля', city: 'Лейк-Плэсид', country: 'США', distance: 'IRONMAN', gender: 'ALL' },
  { raceId: 'ironman-frankfurt', name: 'IRONMAN Frankfurt European Championship', dateISO: '2024-08-18', date: '18 августа', city: 'Франкфурт', country: 'Германия', distance: 'IRONMAN', gender: 'MPRO' },
  { raceId: 'ironman-70-3-tallinn', name: 'IRONMAN 70.3 Tallinn European Championship', dateISO: '2024-08-25', date: '25 августа', city: 'Таллин', country: 'Эстония', distance: '70.3', gender: 'ALL' },
  { raceId: 'ironman-70-3-zell-am-see', name: 'IRONMAN 70.3 Zell am See-Kaprun', dateISO: '2024-09-01', date: '1 сентября', city: 'Целль-ам-Зее', country: 'Австрия', distance: '70.3', gender: 'ALL' },
  { raceId: 'ironman-world-championship-nice', name: 'IRONMAN World Championship', dateISO: '2024-09-22', date: '22 сентября', city: 'Ницца', country: 'Франция', distance: 'IRONMAN', gender: 'WPRO', suffix: 'women' },
  { raceId: 'ironman-world-championship-kona', name: 'IRONMAN World Championship', dateISO: '2024-10-26', date: '26 октября', city: 'Кона', country: 'США', distance: 'IRONMAN', gender: 'MPRO', suffix: 'men' },
  { raceId: 'ironman-70-3-western-australia', name: 'IRONMAN 70.3 Western Australia', dateISO: '2024-12-01', date: '1 декабря', city: 'Басселтон', country: 'Австралия', distance: '70.3', gender: 'ALL' },
  { raceId: 'ironman-70-3-world-championship-taupo', name: 'IRONMAN 70.3 World Championship', dateISO: '2024-12-14', date: '14 декабря', city: 'Таупо', country: 'Новая Зеландия', distance: '70.3', gender: 'WPRO', suffix: 'women' },
  { raceId: 'ironman-70-3-world-championship-taupo', name: 'IRONMAN 70.3 World Championship', dateISO: '2024-12-15', date: '15 декабря', city: 'Таупо', country: 'Новая Зеландия', distance: '70.3', gender: 'MPRO', suffix: 'men' },
]

const races2025: ArchiveRace[] = [
  { raceId: 'ironman-70-3-geelong', name: 'IRONMAN 70.3 Geelong', dateISO: '2025-03-23', date: '23 марта', city: 'Джилонг', country: 'Австралия', distance: '70.3', gender: 'ALL' },
  { raceId: 'ironman-south-africa', name: 'IRONMAN South Africa African Championship', dateISO: '2025-03-30', date: '30 марта', city: 'Гкеберха', country: 'ЮАР', distance: 'IRONMAN', gender: 'ALL' },
  { raceId: 'ironman-70-3-oceanside', name: 'IRONMAN 70.3 Oceanside', dateISO: '2025-04-05', date: '5 апреля', city: 'Оушенсайд', country: 'США', distance: '70.3', gender: 'ALL' },
  { raceId: 'ironman-texas', name: 'IRONMAN Texas North American Championship', dateISO: '2025-04-26', date: '26 апреля', city: 'Вудлендс', country: 'США', distance: 'IRONMAN', gender: 'ALL' },
  { raceId: 'ironman-70-3-venice-jesolo', name: 'IRONMAN 70.3 Venice-Jesolo', dateISO: '2025-05-04', date: '4 мая', city: 'Езоло', country: 'Италия', distance: '70.3', gender: 'ALL' },
  { raceId: 'ironman-70-3-st-george', name: 'IRONMAN 70.3 St. George North American Championship', dateISO: '2025-05-10', date: '10 мая', city: 'Сент-Джордж', country: 'США', distance: '70.3', gender: 'ALL' },
  { raceId: 'ironman-70-3-aix-en-provence', name: 'IRONMAN 70.3 Aix-en-Provence', dateISO: '2025-05-18', date: '18 мая', city: 'Экс-ан-Прованс', country: 'Франция', distance: '70.3', gender: 'ALL' },
  { raceId: 'ironman-hamburg', name: 'IRONMAN Hamburg European Championship', dateISO: '2025-06-01', date: '1 июня', city: 'Гамбург', country: 'Германия', distance: 'IRONMAN', gender: 'WPRO' },
  { raceId: 'ironman-70-3-eagleman', name: 'IRONMAN 70.3 Eagleman', dateISO: '2025-06-08', date: '8 июня', city: 'Кембридж', country: 'США', distance: '70.3', gender: 'ALL' },
  { raceId: 'ironman-cairns', name: 'IRONMAN Cairns', dateISO: '2025-06-15', date: '15 июня', city: 'Кэрнс', country: 'Австралия', distance: 'IRONMAN', gender: 'ALL' },
  { raceId: 'ironman-frankfurt', name: 'IRONMAN Frankfurt European Championship', dateISO: '2025-06-29', date: '29 июня', city: 'Франкфурт', country: 'Германия', distance: 'IRONMAN', gender: 'MPRO' },
  { raceId: 'ironman-70-3-swansea', name: 'IRONMAN 70.3 Swansea', dateISO: '2025-07-13', date: '13 июля', city: 'Суонси', country: 'Великобритания', distance: '70.3', gender: 'ALL' },
  { raceId: 'ironman-lake-placid', name: 'IRONMAN Lake Placid', dateISO: '2025-07-20', date: '20 июля', city: 'Лейк-Плэсид', country: 'США', distance: 'IRONMAN', gender: 'ALL' },
  { raceId: 'ironman-70-3-zell-am-see', name: 'IRONMAN 70.3 Zell am See-Kaprun', dateISO: '2025-08-31', date: '31 августа', city: 'Целль-ам-Зее', country: 'Австрия', distance: '70.3', gender: 'ALL' },
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
    sof: sofByEditionId[`${race.raceId}-${year}${race.suffix ? `-${race.suffix}` : ''}`],
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
