import { useEffect, useRef } from 'react'
import { standingSeasons } from '../data/officialStandings'
import type { StandingSeason } from '../data/officialStandings'

const ROW_HEIGHT = 48
export default function StandingsSeasonPicker({ value, onSelect, onClose }: { value: StandingSeason; onSelect: (year: StandingSeason) => void; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const wheel = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const touching = useRef(false)
  const initial = useRef(value)
  const latestSelect = useRef(onSelect)
  useEffect(() => { latestSelect.current = onSelect }, [onSelect])
  useEffect(() => {
    const el = dialog.current!, track = wheel.current!
    const previousOverflow = document.body.style.overflow
    el.showModal()
    document.body.style.overflow = 'hidden'
    track.scrollTop = standingSeasons.indexOf(initial.current) * ROW_HEIGHT
    track.focus()
    return () => { clearTimeout(timer.current); document.body.style.overflow = previousOverflow; el.close() }
  }, [])
  const settle = () => {
    if (touching.current || !wheel.current) return
    const index = Math.max(0, Math.min(2, Math.round(wheel.current.scrollTop / ROW_HEIGHT)))
    wheel.current.scrollTo({ top: index * ROW_HEIGHT, behavior: 'instant' })
    latestSelect.current(standingSeasons[index])
  }
  const schedule = () => { clearTimeout(timer.current); timer.current = setTimeout(settle, 180) }
  const choose = (index: number) => {
    wheel.current?.scrollTo({ top: index * ROW_HEIGHT, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    schedule()
  }
  return <dialog ref={dialog} className="standings-sheet" aria-labelledby="season-picker-title" onCancel={onClose} onClick={e => { if (e.target === e.currentTarget) { settle(); onClose() } }}>
    <div className="standings-sheet__body">
      <div className="standings-sheet__handle" aria-hidden="true" />
      <header><h2 id="season-picker-title">Сезон</h2><button className="standings-sheet__done" type="button" onClick={() => { settle(); onClose() }}>Готово</button></header>
      <div className="standings-wheel-frame">
        <div ref={wheel} className="standings-wheel" role="listbox" aria-label="Сезон" tabIndex={0} aria-activedescendant={`season-${value}`} onScroll={schedule} onTouchStart={() => { touching.current = true; clearTimeout(timer.current) }} onTouchEnd={() => { touching.current = false; schedule() }} onTouchCancel={() => { touching.current = false; schedule() }} onKeyDown={e => {
          const current = standingSeasons.indexOf(value)
          if (['ArrowUp','ArrowDown','Home','End'].includes(e.key)) { e.preventDefault(); choose(e.key === 'Home' ? 0 : e.key === 'End' ? 2 : Math.max(0, Math.min(2, current + (e.key === 'ArrowDown' ? 1 : -1)))) }
          if (e.key === 'Enter') { e.preventDefault(); settle(); onClose() }
        }}>
          {standingSeasons.map((year, i) => <div role="option" aria-selected={value === year} id={`season-${year}`} key={year} onClick={() => choose(i)}>{year}</div>)}
        </div>
        <div className="standings-wheel__selection" aria-hidden="true" />
      </div>
    </div>
  </dialog>
}
