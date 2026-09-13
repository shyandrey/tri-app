export type AthleteGender = 'M' | 'W'

export type Athlete = {
  id: number
  name: string
  nameEn?: string
  country: string
  countryEn?: string
  countryCode?: string
  flag: string
  gender?: AthleteGender
  discipline: string
  image?: string
  bio: string
  achievements: string[]
}
