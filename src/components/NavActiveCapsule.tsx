import { useLayoutEffect, useRef } from 'react'

// Pages own their nav instances. Retain only the visual position across remounts;
// routing and the selected destination remain entirely controlled by currentPage.
let lastPosition: number | null = null

export function NavActiveCapsule({ index }: { index: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const element = ref.current!
    const step = () => element.getBoundingClientRect().width + 8
    const reduced = matchMedia('(prefers-reduced-motion: reduce)')
    const from = lastPosition ?? index
    const animation = !reduced.matches && from !== index
      ? element.animate([
          { transform: `translateX(${from * step()}px)` },
          { transform: `translateX(${index * step()}px)` },
        ], { duration: 210, easing: 'ease-out' })
      : undefined
    // Resizing/orientation changes should immediately use the responsive CSS target.
    const settle = () => animation?.cancel()
    window.addEventListener('resize', settle)
    reduced.addEventListener('change', settle)
    return () => {
      const transform = getComputedStyle(element).transform
      lastPosition = transform === 'none' ? index : new DOMMatrixReadOnly(transform).m41 / step()
      animation?.cancel()
      window.removeEventListener('resize', settle)
      reduced.removeEventListener('change', settle)
    }
  }, [index])
  return <span ref={ref} className="bottom-nav__capsule" aria-hidden="true" />
}
