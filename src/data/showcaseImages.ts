import { imageVariants } from '../generated/showcaseImageVariants'
import type { RaceEditionView } from '../types/Race'

type ImageTarget = Pick<RaceEditionView, 'editionId' | 'raceId'>
const kona = ['kona-bike-lava', 'kona-swim-start', 'kona-finish-alii']
const nice = ['nice-bike-mountains', 'nice-swim-start', 'nice-run-promenade']
// Location-specific assets are bound to known editions, never championship aliases.
const editionArtwork: Record<string, string[]> = {
  // CAL-03B2 owner-approved reuse; Saudi artwork does not verify the 2027 host city.
  'ironman-world-championship-2027': kona,
  't100-french-riviera-2027': ['french-riviera-run'],
  't100-saudi-arabia-2027': ['saudi-arabia-seaview'],
  't100-qatar-2027': ['qatar-lusail-sunset'],
  'ironman-world-championship-kona-2024-men': kona,
  'ironman-world-championship-kona-2025-women': kona,
  'ironman-world-championship-kona-2026': kona,
  'ironman-70-3-world-championship-2026-women': nice,
  'ironman-70-3-world-championship-2026-men': nice,
  't100-french-riviera-2025': ['french-riviera-run'],
  't100-french-riviera-2026': ['french-riviera-run'],
  't100-dubai-2024-women': ['dubai-swim-skyline'],
  't100-dubai-2024-men': ['dubai-swim-skyline'],
  't100-dubai-2025': ['dubai-swim-skyline'],
  't100-dubai-2026': ['dubai-swim-skyline'],
  't100-saudi-arabia-2026': ['saudi-arabia-seaview'],
  't100-qatar-2025': ['qatar-lusail-sunset'],
  't100-qatar-2026': ['qatar-lusail-sunset'],
}
// Only geographically neutral, owner-approved assets may be registered here.
// None approved yet. Missing entries use the existing neutral CSS fallback.
const neutralEntityArtwork: Record<string, { geographicallyNeutral: true; approval: string; images: string[] }> = {}
export function showcaseImageKeys(target: ImageTarget): readonly string[] {
  const explicit = editionArtwork[target.editionId]
  if (explicit) return explicit
  const shared = neutralEntityArtwork[target.raceId]
  return shared?.geographicallyNeutral && shared.approval.trim() ? shared.images : []
}
export function pickShowcaseImage(target: ImageTarget) {
  const images = showcaseImageKeys(target)
  return images.length ? imageVariants[images[Math.floor(Math.random() * images.length)]] : undefined
}
