import { useEffect, useMemo, useRef, useState } from 'react'
import { usePageState } from '../navigation/usePageState'
import type { RaceEditionView } from '../types/Race'
import { CalendarIcon, LocationIcon } from './AppIcons'
import { pickShowcaseImage } from '../data/showcaseImages'
import { getRaceGenderLabel } from '../utils/raceGender'
import './HomeShowcase.css'

type HomeShowcaseProps = {
  races: RaceEditionView[]
  onRaceClick: (race: RaceEditionView) => void
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
  const [activeIndex, setActiveIndex] = usePageState<number>('showcaseIndex',0)

  // Mount only current/next images initially; reveal other neighbours before they enter.
  const [loadedImages, setLoadedImages] = useState(() => new Set([activeIndex, (activeIndex + 1) % races.length]))
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting && entry.intersectionRect.width > 0)
      if (!visible.length) return
      setLoadedImages(previous => {
        const next = new Set(previous)
        visible.forEach(entry => next.add(cardRefs.current.indexOf(entry.target as HTMLElement)))
        return next
      })
      visible.forEach(entry => observer.unobserve(entry.target))
    }, { root: trackRef.current, rootMargin: '0px 100% 0px 100%' })
    cardRefs.current.forEach(card => { if (card) observer.observe(card) })
    return () => observer.disconnect()
  }, [races.length])

  const imageByRaceId = useMemo(() => {
    const selected = new Map<string, ReturnType<typeof pickShowcaseImage>>()
    races.forEach((race) => {
      if (!selected.has(race.raceId)) {
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
    track.scrollTo({ left, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
  }

  const pauseAutoScroll = () => {
    manualPauseUntilRef.current = Date.now() + MANUAL_PAUSE_MS
  }

  useEffect(() => {
    if (races.length < 2) return

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let timer: number | undefined
    const updateAutoplay = () => {
      window.clearInterval(timer)
      if (motion.matches) return
      timer = window.setInterval(() => {
        if (Date.now() < manualPauseUntilRef.current) return
        const nextIndex = (activeIndexRef.current + 1) % races.length
        scrollToCard(nextIndex)
      }, AUTO_SCROLL_MS)
    }
    updateAutoplay()
    motion.addEventListener('change', updateAutoplay)
    return () => { window.clearInterval(timer); motion.removeEventListener('change', updateAutoplay) }
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
        ref={trackRef} data-navigation-scroll="showcase"
        onScroll={handleScroll}
        onPointerDown={pauseAutoScroll}
        onWheel={pauseAutoScroll}
      >
        {races.map((race, index) => {
          const showcaseName = getRaceName(race.name)
          const [seriesName, locationName] = splitShowcaseName(showcaseName)
          const showcaseImage = imageByRaceId.get(race.raceId)
          const genderLabel = getRaceGenderLabel(race.gender)

          return (
            <article
              className={`showcase-card showcase-card--${index + 1}${showcaseImage ? ' showcase-card--has-image' : ''}`}
              key={`showcase-${race.editionId}`}
              ref={(node) => { cardRefs.current[index] = node }}
              onClick={() => onRaceClick(race)}
            >
              {showcaseImage && loadedImages.has(index) && <img
                className="showcase-card__image" alt="" aria-hidden="true"
                src={showcaseImage[1].src}
                srcSet={showcaseImage.map(image => `${image.src} ${image.width}w`).join(', ')}
                sizes="(max-width: 640px) max(410px, calc(100vw - 24px)), (max-width: 1126px) calc(100vw - 40px), 1086px"
                width={1672} height={941}
                loading={index === activeIndex ? 'eager' : 'lazy'}
                fetchPriority={index === activeIndex ? 'high' : 'low'}
              />}
              <div className="showcase-card__shade" aria-hidden="true" />
              <div className="showcase-card__content">
                <span className="showcase-card__eyebrow">Скоро</span>
                <div className="showcase-card__tag-row">
                  <span className="showcase-card__tag">{race.series}</span>
                  {genderLabel && <span className="showcase-card__tag">{genderLabel}</span>}
                </div>
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
