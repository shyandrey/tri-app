import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Race } from '../types/Race'
import { CalendarIcon, LocationIcon } from './AppIcons'
import { pickShowcaseImage } from '../data/showcaseImages'
import './HomeShowcase.css'

type HomeShowcaseProps = {
  races: Race[]
  onRaceClick: (race: Race) => void
  getRaceName: (name: string) => string
}

const AUTO_SCROLL_MS = 4000
const MANUAL_PAUSE_MS = 7000

function splitShowcaseName(name: string) {
  if (name.startsWith('IRONMAN 70.3 ')) {
    return ['IRONMAN 70.3', name.slice('IRONMAN 70.3 '.length)]
  }

  if (name.startsWith('IRONMAN ')) {
    return ['IRONMAN', name.slice('IRONMAN '.length)]
  }

  if (name.startsWith('T100 ')) {
    return ['T100', name.slice('T100 '.length)]
  }

  return ['', name]
}

export default function HomeShowcase({ races, onRaceClick, getRaceName }: HomeShowcaseProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Array<HTMLElement | null>>([])
  const activeIndexRef = useRef(0)
  const manualPauseUntilRef = useRef(0)
  const [activeIndex, setActiveIndex] = useState(0)

  const imageByRaceId = useMemo(() => {
    const selected = new Map<string, string | undefined>()
    races.forEach((race) => {
      if (race.raceId && !selected.has(race.raceId)) {
        selected.set(race.raceId, pickShowcaseImage(race.raceId))
      }
    })
    return selected
  }, [races])

  useEffect(() => {
    activeIndexRef.current = activeIndex
  }, [activeIndex])

  const scrollToCard = (index: number) => {
    const track = trackRef.current
    const card = cardRefs.current[index]
    if (!track || !card) return

    const left = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2
    track.scrollTo({ left, behavior: 'smooth' })
  }

  const pauseAutoScroll = () => {
    manualPauseUntilRef.current = Date.now() + MANUAL_PAUSE_MS
  }

  useEffect(() => {
    if (races.length < 2) return

    const timer = window.setInterval(() => {
      if (Date.now() < manualPauseUntilRef.current) return
      const nextIndex = (activeIndexRef.current + 1) % races.length
      scrollToCard(nextIndex)
    }, AUTO_SCROLL_MS)

    return () => window.clearInterval(timer)
  }, [races.length])

  const handleScroll = () => {
    const track = trackRef.current
    if (!track) return

    const trackCenter = track.scrollLeft + track.clientWidth / 2
    let nearestIndex = 0
    let nearestDistance = Number.POSITIVE_INFINITY

    cardRefs.current.forEach((card, index) => {
      if (!card) return
      const cardCenter = card.offsetLeft + card.clientWidth / 2
      const distance = Math.abs(cardCenter - trackCenter)
      if (distance < nearestDistance) {
        nearestDistance = distance
        nearestIndex = index
      }
    })

    if (nearestIndex !== activeIndexRef.current) {
      activeIndexRef.current = nearestIndex
      setActiveIndex(nearestIndex)
    }
  }

  return (
    <section className="home-showcase" aria-label="Ближайшие старты">
      <div
        className="home-showcase__track"
        ref={trackRef}
        onScroll={handleScroll}
        onPointerDown={pauseAutoScroll}
        onWheel={pauseAutoScroll}
      >
        {races.map((race, index) => {
          const showcaseName = getRaceName(race.name)
          const [seriesName, locationName] = splitShowcaseName(showcaseName)
          const showcaseImage = race.raceId ? imageByRaceId.get(race.raceId) : undefined

          return (
            <article
              className={`showcase-card showcase-card--${index + 1}${showcaseImage ? ' showcase-card--has-image' : ''}`}
              key={`showcase-${race.editionId}`}
              ref={(node) => { cardRefs.current[index] = node }}
              onClick={() => onRaceClick(race)}
              style={showcaseImage ? { '--showcase-image': `url(${showcaseImage})` } as CSSProperties : undefined}
            >
              <div className="showcase-card__shade" aria-hidden="true" />
              <div className="showcase-card__content">
                <span className="showcase-card__eyebrow">Ближайший старт</span>
                <span className="showcase-card__tag">{race.series}</span>
                <h2 className="showcase-card__title">
                  {seriesName && <span className="showcase-card__title-part">{seriesName}</span>}
                  <span className="showcase-card__title-part">{locationName}</span>
                </h2>
                <div className="showcase-card__meta">
                  <p><CalendarIcon /> <span>{race.date}</span></p>
                  <p><LocationIcon /> <span>{[race.city, race.country].filter(Boolean).join(', ')}</span></p>
                </div>
              </div>
              <button className="showcase-card__open" type="button" aria-label={`Открыть ${race.name}`}>→</button>
            </article>
          )
        })}
      </div>
      <div className="home-showcase__hint" aria-hidden="true">
        {races.map((race, index) => (
          <span className={index === activeIndex ? 'is-active' : ''} key={`dot-${race.editionId}`} />
        ))}
      </div>
    </section>
  )
}
