import konaBikeLava from '../assets/showcase/kona/kona-bike-lava.png'
import konaFinishAlii from '../assets/showcase/kona/kona-finish-alii.png'
import konaSwimStart from '../assets/showcase/kona/kona-swim-start.png'
import niceBikeMountains from '../assets/showcase/nice/nice-bike-mountains.png'
import niceRunPromenade from '../assets/showcase/nice/nice-run-promenade.png'
import niceSwimStart from '../assets/showcase/nice/nice-swim-start.png'

const showcaseImagesByRaceId: Record<string, string[]> = {
  'ironman-world-championship-kona': [konaBikeLava, konaSwimStart, konaFinishAlii],
  'ironman-70-3-world-championship': [niceBikeMountains, niceSwimStart, niceRunPromenade],
}

export function pickShowcaseImage(raceId?: string) {
  const images = raceId ? showcaseImagesByRaceId[raceId] ?? [] : []
  return images.length ? images[Math.floor(Math.random() * images.length)] : undefined
}
