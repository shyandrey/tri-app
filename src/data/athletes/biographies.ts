import type { Athlete } from '../../types/Athlete'
import approvedBiographies from './athleteBiographies.json'

// Curated owner-approved text, independent of generated catalog files.
const biographies: Record<string, { nameEn: string; bio: string }> = approvedBiographies

export function withApprovedBiography(athlete: Athlete): Athlete {
  const approved = biographies[String(athlete.id)]
  if (!approved || approved.nameEn !== athlete.nameEn) return athlete
  return { ...athlete, bio: approved.bio }
}
