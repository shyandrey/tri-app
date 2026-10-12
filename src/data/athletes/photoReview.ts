// Manual rejection survives regeneration of the photo registry.
// 2026-10-12: https://stats.protriathletes.org/athlete/franzi-reng
// Profile portrait is no-pic; the registered PNG is the Sailfish sponsor logo.
// Reject only this known association, not a future verified replacement portrait.
export function reviewedAthletePhoto(athleteId: number, source: string | undefined) {
  if (athleteId === 172 && source === '/athletes/franzi-hofmann.png') return undefined
  return source
}
