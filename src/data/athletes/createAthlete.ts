import type { Athlete } from '../../types/Athlete'

export const makeAthlete = (
  id: number,
  name: string,
  nameEn: string,
  country: string,
  countryEn: string,
  countryCode: string,
  flag: string,
  gender: 'M' | 'W',
  discipline = 'IRONMAN / T100',
): Athlete => ({
  id,
  name,
  nameEn,
  country,
  countryEn,
  countryCode,
  flag,
  gender,
  discipline,
  bio: `${name} — профессиональный триатлет. Профиль добавлен для тестирования каталога атлетов.`,
  achievements: [],
})
