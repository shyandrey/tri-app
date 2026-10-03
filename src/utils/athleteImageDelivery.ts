import { imageVariants } from '../generated/athleteImageVariants'

// Match the existing source URL, never an athlete name/ID. Future ungenerated photos
// retain the original URL until the local derivatives are regenerated.
export function athleteImageDelivery(source: string, sizes: string) {
  const variants = imageVariants[source]
  if (!variants) return { src: source }
  const largest = variants[variants.length - 1]
  return {
    src: largest.src,
    srcSet: variants.map(image => `${image.src} ${image.width}w`).join(', '),
    sizes,
    width: largest.width,
    height: largest.height,
  }
}
