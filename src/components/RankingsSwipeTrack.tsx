import { useLayoutEffect, useRef } from 'react'
import type { ReactNode } from 'react'

/** Home's native Scroll Snap model, plus desktop pointer dragging.
 * Touch momentum/axis arbitration stay with the browser; no animation dependency. */
export default function RankingsSwipeTrack({ index, onSelect, gap = 0, children, label }: {
  index: number; onSelect: (index: number) => void; gap?: number; children: ReactNode; label: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const selected = useRef(index)
  const callback = useRef(onSelect)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const suppress = useRef(0)
  const gesture = useRef<{ id: number; x: number; y: number; left: number; time: number; horizontal: boolean; vertical: boolean; mouse: boolean } | null>(null)
  const step = () => (ref.current?.clientWidth ?? 0) + gap
  const move = (next: number, instant = false) => {
    const track = ref.current
    if (!track) return
    track.scrollTo({ left: next * step(), behavior: instant || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }
  useLayoutEffect(() => { callback.current = onSelect })
  useLayoutEffect(() => {
    selected.current = index
    move(index)
  // Selection changes should not restart animation on unrelated parent renders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])
  useLayoutEffect(() => {
    const track = ref.current!
    const observer = new ResizeObserver(() => {
      gesture.current = null
      track.classList.remove('is-dragging')
      move(selected.current, true)
    })
    observer.observe(track)
    move(selected.current, true)
    return () => { observer.disconnect(); clearTimeout(timer.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  const settle = () => {
    if (gesture.current) return
    const next = Math.max(0, Math.min(1, Math.round((ref.current?.scrollLeft ?? 0) / step())))
    if (next !== selected.current) { selected.current = next; callback.current(next) }
  }
  const finish = (cancel = false) => {
    const g = gesture.current, track = ref.current
    gesture.current = null
    if (!g || !track) return
    if (g.horizontal) suppress.current = performance.now() + 500
    if (g.mouse) {
      track.classList.remove('is-dragging')
      const distance = track.scrollLeft - g.left
      const speed = Math.abs(distance) / Math.max(1, performance.now() - g.time)
      const advance = !cancel && (Math.abs(distance) > Math.min(80, step() * .2) || (Math.abs(distance) > 24 && speed > .45))
      const next = advance ? Math.max(0, Math.min(1, selected.current + Math.sign(distance))) : selected.current
      move(next)
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(settle, 180)
  }
  return <div ref={ref} className="rankings-snap-track" aria-label={label} style={{ gap }}
    onScroll={() => { clearTimeout(timer.current); timer.current = setTimeout(settle, 120) }}
    onDragStart={e => e.preventDefault()}
    onPointerDown={e => {
      if (!e.isPrimary || e.button !== 0) return
      clearTimeout(timer.current)
      const track = e.currentTarget
      // Interrupt an in-flight smooth scroll at its actual position.
      track.scrollTo({ left: track.scrollLeft, behavior: 'instant' })
      gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, left: track.scrollLeft, time: performance.now(), horizontal: false, vertical: false, mouse: e.pointerType === 'mouse' }
    }}
    onPointerMove={e => {
      const g = gesture.current
      if (!g || g.id !== e.pointerId) return
      const dx = e.clientX - g.x, dy = e.clientY - g.y
      if (!g.horizontal && !g.vertical && Math.max(Math.abs(dx), Math.abs(dy)) > 8) {
        if (Math.abs(dx) > Math.abs(dy) * 1.25) g.horizontal = true
        else g.vertical = true
      }
      if (!g.horizontal) return
      suppress.current = performance.now() + 500
      if (g.mouse) {
        e.currentTarget.setPointerCapture(e.pointerId)
        e.currentTarget.classList.add('is-dragging')
        e.currentTarget.scrollLeft = g.left - dx
        e.preventDefault()
      }
    }}
    onPointerUp={() => finish()}
    onPointerCancel={() => finish(true)}
    onLostPointerCapture={() => finish(true)}
    onClickCapture={e => { if (performance.now() < suppress.current) { e.preventDefault(); e.stopPropagation() } }}>
    {children}
  </div>
}
