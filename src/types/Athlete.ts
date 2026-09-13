export type AthleteGender = 'M' | 'W'

export type AthleteSocialLinks = {
  instagram?: string
  youtube?: string
}

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
  age?: number
  socialLinks?: AthleteSocialLinks
  bio: string
  bioFacts?: string[]
  achievements: string[]
}
