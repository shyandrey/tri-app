import type { Athlete } from '../../types/Athlete'

// Result-derived profiles whose source result rows do not contain gender.
// Gender was verified against the corresponding 2026 T100 pro field / athlete profile.
// Keep these separate from resultAthletes.generated.ts so --write cannot overwrite them.
export const verifiedResultAthletes: Athlete[] = [
  { id: 20000, name: 'Henri Schoeman', nameEn: 'Henri Schoeman', country: 'ZA', countryEn: 'ZA', countryCode: 'ZA', flag: '', gender: 'M', discipline: 'IRONMAN / T100', bio: '', achievements: [] },
  { id: 20001, name: 'Jannik Schaufler', nameEn: 'Jannik Schaufler', country: 'DE', countryEn: 'DE', countryCode: 'DE', flag: '', gender: 'M', discipline: 'IRONMAN / T100', bio: '', achievements: [] },
  { id: 20002, name: 'Carlos Oliver Vives', nameEn: 'Carlos Oliver Vives', country: 'ES', countryEn: 'ES', countryCode: 'ES', flag: '', gender: 'M', discipline: 'IRONMAN / T100', bio: '', achievements: [] },
  { id: 20003, name: 'Dylan Magnien', nameEn: 'Dylan Magnien', country: 'FR', countryEn: 'FR', countryCode: 'FR', flag: '', gender: 'M', discipline: 'IRONMAN / T100', bio: '', achievements: [] },
  { id: 20004, name: 'Marcel Bolbat', nameEn: 'Marcel Bolbat', country: 'DE', countryEn: 'DE', countryCode: 'DE', flag: '', gender: 'M', discipline: 'IRONMAN / T100', bio: '', achievements: [] },
  { id: 20005, name: 'Will Draper', nameEn: 'Will Draper', country: 'GB', countryEn: 'GB', countryCode: 'GB', flag: '', gender: 'M', discipline: 'IRONMAN / T100', bio: '', achievements: [] },
  { id: 20006, name: 'Chloe Hartnett', nameEn: 'Chloe Hartnett', country: 'AU', countryEn: 'AU', countryCode: 'AU', flag: '', gender: 'W', discipline: 'IRONMAN / T100', bio: '', achievements: [] },
  { id: 20007, name: 'Danielle De Francesco', nameEn: 'Danielle De Francesco', country: 'AU', countryEn: 'AU', countryCode: 'AU', flag: '', gender: 'W', discipline: 'IRONMAN / T100', bio: '', achievements: [] },
  { id: 20008, name: 'Jessica Fullagar', nameEn: 'Jessica Fullagar', country: 'GB', countryEn: 'GB', countryCode: 'GB', flag: '', gender: 'W', discipline: 'IRONMAN / T100', bio: '', achievements: [] },
  { id: 20009, name: 'Lisa-Maria Dornauer', nameEn: 'Lisa-Maria Dornauer', country: 'AT', countryEn: 'AT', countryCode: 'AT', flag: '', gender: 'W', discipline: 'IRONMAN / T100', bio: '', achievements: [] },
]
