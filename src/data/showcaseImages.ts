import { imageVariants } from '../generated/showcaseImageVariants'

const showcaseImagesByRaceId: Record<string, string[]> = {
  'ironman-world-championship-kona': ['kona-bike-lava', 'kona-swim-start', 'kona-finish-alii'],
  'ironman-70-3-world-championship': ['nice-bike-mountains', 'nice-swim-start', 'nice-run-promenade'],
  't100-french-riviera': ['french-riviera-run'],
  't100-dubai': ['dubai-swim-skyline'],
  't100-saudi-arabia': ['saudi-arabia-seaview'],
  't100-qatar': ['qatar-lusail-sunset'],
}

export function pickShowcaseImage(raceId?: string) {
  const images = raceId ? showcaseImagesByRaceId[raceId] ?? [] : []
  return images.length ? imageVariants[images[Math.floor(Math.random() * images.length)]] : undefined
}
