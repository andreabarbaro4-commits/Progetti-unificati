import { useRef, useEffect, useCallback, Children } from 'react'
import { VERTICAL_CAROUSEL_CONFIG, calculateCardDimensions } from './verticalCarouselConfig'
import { VerticalCarouselCard } from './VerticalCarouselCard'
import type { VerticalCarouselCardProps } from './VerticalCarouselCard'
import './VerticalCarousel.css'

export interface VerticalCarouselProps {
  /** 0-based active step index */
  activeStep: number
  /** Callback to advance to next step */
  onAdvance: () => void
  /** Callback to go back to previous step */
  onBack: () => void
  /** Children are the step components */
  children: React.ReactNode[]
}

function getCardState(index: number, activeStep: number, totalSteps: number): VerticalCarouselCardProps['state'] {
  if (index === activeStep) return 'active'
  if (index === activeStep + 1 && activeStep < totalSteps - 1) return 'peek'
  if (index === activeStep - 1 && activeStep > 0) return 'peek-above'
  if (index < activeStep) return 'above'
  return 'hidden'
}

/** Calculate the resting top position for a card at a given index */
function getCardTop(index: number, activeStep: number, dimensions: ReturnType<typeof calculateCardDimensions>, viewportHeight: number): number {
  if (index === activeStep) {
    return dimensions.topOffset
  } else if (index === activeStep + 1) {
    return dimensions.peekOffset
  } else if (index === activeStep - 1) {
    // Peek-above: show card peeking between nav bar and active card
    const cardHeight = viewportHeight * 0.65 // 65vh matches CSS
    const { peekAboveGap } = VERTICAL_CAROUSEL_CONFIG
    // Card bottom = topOffset - peekAboveGap (just above active card)
    // The nav bar (z-50) naturally clips the top, leaving ~60px visible
    return dimensions.topOffset - peekAboveGap - cardHeight
  } else if (index < activeStep) {
    return -dimensions.minHeight - 200
  } else {
    return dimensions.peekOffset + dimensions.minHeight
  }
}

export function VerticalCarousel({ activeStep, onAdvance, onBack, children }: VerticalCarouselProps) {
  const transitioning = useRef<boolean>(false)
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevStepRef = useRef<number>(activeStep)

  const childArray = Children.toArray(children)
  const totalSteps = childArray.length

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current)
      }
    }
  }, [])

  // Calculate the translateY for each card based on activeStep and viewport
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : VERTICAL_CAROUSEL_CONFIG.referenceViewport
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : VERTICAL_CAROUSEL_CONFIG.referenceViewportHeight
  const dimensions = calculateCardDimensions(viewportWidth, viewportHeight)

  const { transitionDuration } = VERTICAL_CAROUSEL_CONFIG

  // Animate transition when activeStep changes
  useEffect(() => {
    const prevStep = prevStepRef.current
    prevStepRef.current = activeStep

    // Skip on initial render or same step
    if (prevStep === activeStep) return

    const direction: 'advance' | 'back' = activeStep > prevStep ? 'advance' : 'back'
    const outgoingIndex = prevStep
    const incomingIndex = activeStep

    const outgoingCard = cardRefs.current[outgoingIndex]
    const incomingCard = cardRefs.current[incomingIndex]

    if (!outgoingCard || !incomingCard) return

    transitioning.current = true

    // Disable pointer-events on both cards during transition
    outgoingCard.style.pointerEvents = 'none'
    incomingCard.style.pointerEvents = 'none'

    // --- Content opacity via CSS classes ---
    // Outgoing card: content fades out
    outgoingCard.classList.add('content-hidden', 'transitioning')
    // Incoming card: content fades in (ensure content-hidden is removed, e.g. from peek state)
    incomingCard.classList.remove('content-hidden')
    incomingCard.classList.add('transitioning')

    // --- Set up OUTGOING card position animation ---
    // CSS has `transition: transform 500ms ...` always on, so updating --card-y triggers animation
    if (direction === 'advance') {
      // Active card moves UP out of view
      outgoingCard.style.setProperty('--card-y', `${-dimensions.minHeight}px`)
    } else {
      // Active card moves DOWN to below position
      outgoingCard.style.setProperty('--card-y', `${dimensions.peekOffset + dimensions.minHeight}px`)
    }

    // --- Set up INCOMING card position animation ---
    // Disable transition, jump to start position, then re-enable and animate to end
    incomingCard.style.transition = 'none'
    if (direction === 'advance') {
      // Incoming card starts from below (peek position)
      incomingCard.style.setProperty('--card-y', `${dimensions.peekOffset}px`)
    } else {
      // Incoming card starts from above
      incomingCard.style.setProperty('--card-y', `${-dimensions.minHeight}px`)
    }
    // Make incoming card visible during transition
    incomingCard.style.visibility = 'visible'

    // Force a reflow to ensure the starting position is applied before transition begins
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    void incomingCard.offsetHeight

    // Re-enable transition and animate to final position
    incomingCard.style.transition = ''
    incomingCard.style.setProperty('--card-y', `${dimensions.topOffset}px`)

    // --- CSS class-based mask transitions ---
    // Outgoing card: add mask class to trigger fade overlay
    if (direction === 'advance') {
      // Moving up: top-fade mask on outgoing card
      outgoingCard.classList.add('mask-top')
      // Incoming card: remove any mask (becoming active)
      incomingCard.classList.remove('mask-bottom', 'mask-top')
    } else {
      // Moving back: bottom-fade mask on outgoing card
      outgoingCard.classList.add('mask-bottom')
      // Incoming card: remove any mask (becoming active)
      incomingCard.classList.remove('mask-top', 'mask-bottom')
    }

    // After transition completes, set --card-y to resting positions and clear inline styles
    transitionTimerRef.current = setTimeout(() => {
      transitioning.current = false

      // Set outgoing card --card-y to its final resting position
      const outgoingRestingTop = getCardTop(outgoingIndex, activeStep, dimensions, viewportHeight)
      outgoingCard.style.setProperty('--card-y', `${outgoingRestingTop}px`)
      outgoingCard.style.transition = ''
      outgoingCard.style.pointerEvents = ''
      outgoingCard.style.visibility = ''
      outgoingCard.style.webkitMaskImage = ''
      outgoingCard.style.maskImage = ''
      outgoingCard.classList.remove('mask-top', 'mask-bottom', 'content-hidden', 'transitioning')

      // Set incoming card --card-y to its final resting position
      const incomingRestingTop = getCardTop(incomingIndex, activeStep, dimensions, viewportHeight)
      incomingCard.style.setProperty('--card-y', `${incomingRestingTop}px`)
      incomingCard.style.transition = ''
      incomingCard.style.pointerEvents = ''
      incomingCard.style.visibility = ''
      incomingCard.style.webkitMaskImage = ''
      incomingCard.style.maskImage = ''
      incomingCard.classList.remove('mask-top', 'mask-bottom', 'content-hidden', 'transitioning')
    }, transitionDuration)
  }, [activeStep, dimensions, transitionDuration])

  /** Guarded advance: ignores calls while transitioning */
  const handleAdvance = useCallback(() => {
    if (transitioning.current) return
    onAdvance()
  }, [onAdvance])

  /** Guarded back: ignores calls while transitioning */
  const handleBack = useCallback(() => {
    if (transitioning.current) return
    onBack()
  }, [onBack])

  return (
    <div className="vertical-carousel-viewport">
      <div className="vertical-carousel-track">
        {childArray.map((child, index) => {
          const top = getCardTop(index, activeStep, dimensions, viewportHeight)
          const cardState = getCardState(index, activeStep, totalSteps)

          return (
            <VerticalCarouselCard
              key={index}
              ref={(el) => { cardRefs.current[index] = el }}
              state={cardState}
              style={{ '--card-y': `${top}px` } as React.CSSProperties}
            >
              {child}
            </VerticalCarouselCard>
          )
        })}
      </div>
    </div>
  )
}
