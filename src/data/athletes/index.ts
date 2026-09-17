import type { Athlete } from '../../types/Athlete'
import { maleAthletes } from './men'
import { femaleAthletes } from './women'
import { resultAthletes } from './resultAthletes.generated'
import { verifiedResultAthletes } from './verifiedResultAthletes'

export const athletes: Athlete[] = [
  ...maleAthletes,
  ...femaleAthletes,
  ...resultAthletes,
  ...verifiedResultAthletes,
]

export { maleAthletes, femaleAthletes, resultAthletes, verifiedResultAthletes }
