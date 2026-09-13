import type { Athlete } from '../../types/Athlete'
import { maleAthletes } from './men'
import { femaleAthletes } from './women'

export const athletes: Athlete[] = [
  ...maleAthletes,
  ...femaleAthletes,
]

export { maleAthletes, femaleAthletes }
