import type { Athlete } from '../../types/Athlete'
import { maleAthletes } from './men'
import { femaleAthletes } from './women'
import { resultAthletes } from './resultAthletes.generated'
import { verifiedResultAthletes } from './verifiedResultAthletes'
import { athletePhotosByName } from './athletePhotos.generated'

const withRegisteredPhoto = (athlete: Athlete): Athlete => ({
  ...athlete,
  image: athlete.image ?? athletePhotosByName[athlete.nameEn],
})

export const athletes: Athlete[] = [
  ...maleAthletes,
  ...femaleAthletes,
  ...resultAthletes,
  ...verifiedResultAthletes,
].map(withRegisteredPhoto)

export { maleAthletes, femaleAthletes, resultAthletes, verifiedResultAthletes }
