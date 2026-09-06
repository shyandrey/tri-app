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

export function AthleteIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><circle cx="12" cy="7.5" r="3.2"/><path d="M5.5 20c.8-4.4 3-6.7 6.5-6.7s5.7 2.3 6.5 6.7"/></svg>
}

export function RankingIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><path d="m12 3 2.6 5.3 5.9.9-4.3 4.2 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.2 5.9-.9L12 3Z"/></svg>
}

export function PointsTableIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><rect x="3.5" y="4" width="17" height="16" rx="2.5"/><path d="M3.5 9h17M9 4v16M14.5 4v16"/></svg>
}

export function PaceIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><circle cx="12" cy="13" r="7.5"/><path d="M9.5 3.5h5M12 5.5V3.5M17.3 7.7l1.5-1.5M12 13l3.2-2.3"/></svg>
}

export function MoreIcon(props: IconProps) {
  return <svg {...baseProps} {...props}><circle cx="5" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.3" fill="currentColor" stroke="none"/></svg>
}
