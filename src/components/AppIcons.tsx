import type { SVGProps } from 'react'
import './AppIcons.css'

type IconProps = SVGProps<SVGSVGElement>

const baseProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export function HomeIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9.8V20h13V9.8"/><path d="M9.5 20v-6h5v6"/></svg>
}

export function CalendarIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M7.5 3.5v3M16.5 3.5v3M3.5 9h17"/><path d="M7 12h2M11 12h2M15 12h2M7 15.5h2M11 15.5h2M15 15.5h2"/></svg>
}

export function LocationIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="M19 10c0 5.2-7 11-7 11S5 15.2 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.3"/></svg>
}

export function AthleteIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><circle cx="12" cy="7.5" r="3.2"/><path d="M5.5 20c.8-4.4 3-6.7 6.5-6.7s5.7 2.3 6.5 6.7"/></svg>
}

export function PointsTableIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M3.5 9h17M9 4v16M14.5 4v16"/></svg>
}

export function GearIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><circle cx="12" cy="12" r="3.2"/><path d="M19.2 13.3a7.8 7.8 0 0 0 0-2.6l2-1.5-2-3.4-2.4 1a8 8 0 0 0-2.2-1.3L14.3 3h-4.1l-.4 2.5a8 8 0 0 0-2.2 1.3l-2.4-1-2 3.4 2 1.5a7.8 7.8 0 0 0 0 2.6l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 2.2 1.3l.4 2.5h4.1l.4-2.5a8 8 0 0 0 2.2-1.3l2.4 1 2-3.4-2.1-1.5Z"/></svg>
}

export function MoreIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><circle cx="5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.3" fill="currentColor" stroke="none"/></svg>
}

export function ChevronRightIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="m9 5 7 7-7 7" /></svg>
}

export function TelegramIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="m21 3-4 18-6-5-3 3v-6L3 11 21 3Z"/><path d="m8 13 9-6-6 9"/></svg>
}
