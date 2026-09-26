import type { Athlete } from '../../types/Athlete'
import { maleAthletes } from './men'
import { femaleAthletes } from './women'
import { resultAthletes } from './resultAthletes.generated'
import { verifiedResultAthletes } from './verifiedResultAthletes'
import { athletePhotosByName } from './athletePhotos.generated'
import { localizeAthlete } from './localization'

const withRegisteredPhoto = (athlete: Athlete): Athlete => ({
  ...athlete,
  image: athlete.image ?? (athlete.nameEn ? athletePhotosByName[athlete.nameEn] : undefined),
})

export const athletes: Athlete[] = [
  ...maleAthletes,
  ...femaleAthletes,
  ...resultAthletes,
  ...verifiedResultAthletes,
].map(withRegisteredPhoto).map(localizeAthlete)

export { maleAthletes, femaleAthletes, resultAthletes, verifiedResultAthletes }
