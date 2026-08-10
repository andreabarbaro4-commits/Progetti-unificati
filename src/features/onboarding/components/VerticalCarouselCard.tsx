import { forwardRef } from 'react'
import type { ReactNode, CSSProperties } from 'react'
import './VerticalCarousel.css'

export interface VerticalCarouselCardProps {
  /** Visual state of the card in the carousel */
  state: 'active' | 'peek' | 'peek-above' | 'above' | 'hidden'
  /** Optional inline styles (e.g. for positioning) */
  style?: CSSProperties
  children: ReactNode
}

const STATE_CLASS_MAP: Record<VerticalCarouselCardProps['state'], string> = {
  active: 'vertical-carousel-card',
  peek: 'vertical-carousel-card peek-card',
  'peek-above': 'vertical-carousel-card peek-above-card',
  above: 'vertical-carousel-card above-card',
  hidden: 'vertical-carousel-card hidden-card',
}

export const VerticalCarouselCard = forwardRef<HTMLDivElement, VerticalCarouselCardProps>(
  function VerticalCarouselCard({ state, style, children }, ref) {
    return (
      <div ref={ref} className={STATE_CLASS_MAP[state]} style={style}>
        {children}
      </div>
    )
  }
)
