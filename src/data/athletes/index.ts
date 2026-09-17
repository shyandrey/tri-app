import type { Athlete } from '../../types/Athlete'
import { maleAthletes } from './men'
import { femaleAthletes } from './women'
import { resultAthletes } from './resultAthletes.generated'

export const athletes: Athlete[] = [
  ...maleAthletes,
  ...femaleAthletes,
  ...resultAthletes,
]

export { maleAthletes, femaleAthletes, resultAthletes }
