import type { Athlete } from '../../types/Athlete'
import { athletePhotosByName } from './athletePhotos.generated'

const VERIFIED_NO_PHOTO_NAMES = new Set([
  'Andy Krueger','Matt Kerr','Brock Hoel','Matthew Richard','Blake Selm',
  'Ethan Sunseri','Federico Scarabino','James Hayes','John Killeen',
  'Tommy Doubleday','Yvan Jarrige','Albert Askengren',
  'Ari Klau','Benjamin Randall','Brad Bischoff','Brian Folts','David Reynolds',
  'Dries Matthys','Dylan Clough','Dylan Thissen','Erwan Jacobi','Florin Parfuss',
  'Fraser Minnican','Jack Sosinski','Jens Emil Nielsen','Joona Lehtonen','Stephanie Clutterbuck',
])

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
  image: VERIFIED_NO_PHOTO_NAMES.has(nameEn) ? undefined : athletePhotosByName[nameEn],
  achievements: [],
})
