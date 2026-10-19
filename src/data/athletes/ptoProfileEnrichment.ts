import type { Athlete } from '../../types/Athlete'
import type { PtoProfileData } from '../../utils/athleteProfileData'
import { profileSocials } from '../../utils/athleteProfileData'
import registry from './ptoProfileEnrichment.json'

const entries: Record<string, { name: string; profile: PtoProfileData }> = registry.entries

// Additive overlay on stable IDs; generated catalog files remain untouched.
export function enrichPtoProfile(athlete: Athlete): Athlete {
  const entry = entries[String(athlete.id)]
  if (!entry || entry.name !== athlete.nameEn) return athlete
  const existing = Object.fromEntries(profileSocials(athlete))
  const socials = { ...entry.profile.socials }
  for (const platform of Object.keys(socials) as Array<keyof typeof socials>) {
    if (existing[platform]) delete socials[platform]
  }
  return {
    ...athlete,
    ptoProfile: {
      ...entry.profile,
      ...athlete.ptoProfile,
      socials: { ...socials, ...athlete.ptoProfile?.socials },
    },
  }
}
