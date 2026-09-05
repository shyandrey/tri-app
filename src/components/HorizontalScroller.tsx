import type { ReactNode } from 'react'
import './HorizontalScroller.css'

type HorizontalScrollerProps = {
  children: ReactNode
  className?: string
  ariaLabel?: string
}

function HorizontalScroller({ children, className = '', ariaLabel }: HorizontalScrollerProps) {
  return (
    <div
      className={`horizontal-scroller ${className}`.trim()}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  )
}

export default HorizontalScroller
