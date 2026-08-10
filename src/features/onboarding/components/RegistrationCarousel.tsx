import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { PersonalInfoStep } from '../steps/PersonalInfoStep'
import { WelcomeStep } from '../steps/WelcomeStep'
import { RoleStep } from '../steps/RoleStep'
import { PhotoUploadStep } from '../steps/PhotoUploadStep'
import './RegistrationCarousel.css'

type ExpandState = 'idle' | 'expanding' | 'expanded' | 'collapsing'

const CAROUSEL_CONFIG = {
  cardWidth: 448,
  cardHeight: 700,
  cardGap: 24,
  transitionDuration: 400,
  expandDuration: 500,
  collapseDuration: 400,
  welcomeStepIndex: 0,
}

const TOTAL_STEPS = 4

interface RegistrationCarouselProps {
  onComplete: () => void
  onShowNav?: () => void
}

/** Returns the effective card width + gap and viewport width for translateX calculations. */
function useResponsiveCardWidth(config: typeof CAROUSEL_CONFIG) {
  const MOBILE_BREAKPOINT = 600
  const MOBILE_GAP = 12

  const getCardWidth = () => {
    if (typeof window === 'undefined') return config.cardWidth
    if (window.innerWidth <= MOBILE_BREAKPOINT) {
      return window.innerWidth * 0.95
    }
    return config.cardWidth
  }

  const getGap = () => {
    if (typeof window === 'undefined') return config.cardGap
    if (window.innerWidth <= MOBILE_BREAKPOINT) return MOBILE_GAP
    return config.cardGap
  }

  const getViewportWidth = () => {
    if (typeof window === 'undefined') return config.cardWidth
    return window.innerWidth
  }

  const [cardWidth, setCardWidth] = useState(getCardWidth)
  const [gap, setGap] = useState(getGap)
  const [viewportWidth, setViewportWidth] = useState(getViewportWidth)

  useEffect(() => {
    const handleResize = () => {
      setCardWidth(getCardWidth())
      setGap(getGap())
      setViewportWidth(getViewportWidth())
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return { cardWidth, gap, viewportWidth }
}

/**
 * Horizontal carousel that renders the 4 post-auth registration steps.
 * Slides left on step completion using CSS transforms.
 * WelcomeStep (index 0) has a special expand-to-fullscreen animation.
 */
export function RegistrationCarousel({ onComplete, onShowNav }: RegistrationCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [expandState, setExpandState] = useState<ExpandState>('expanding')
  const transitioning = useRef(false)
  const expandTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const postCollapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Shared state for steps that need it
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [hasPhoto, setHasPhoto] = useState(false)
  const [firstName, setFirstName] = useState('')

  // Responsive card width calculation
  const { cardWidth, gap, viewportWidth } = useResponsiveCardWidth(CAROUSEL_CONFIG)

  // WelcomeStep starts expanded on mount
  useEffect(() => {
    expandTimerRef.current = setTimeout(() => {
      setExpandState('expanded')
    }, CAROUSEL_CONFIG.expandDuration)
  }, [])

  const advance = useCallback(() => {
    // Guard: prevent double-advance during any transition
    if (transitioning.current) return
    if (expandState === 'expanding' || expandState === 'collapsing') return

    if (activeIndex >= TOTAL_STEPS - 1) {
      onComplete()
      return
    }

    // Leaving WelcomeStep (index 0): collapse first, then normal advance
    if (activeIndex === CAROUSEL_CONFIG.welcomeStepIndex && expandState === 'expanded') {
      setExpandState('collapsing')
      transitioning.current = true

      collapseTimerRef.current = setTimeout(() => {
        // Collapse done — reset expand state and perform normal advance
        setExpandState('idle')
        setActiveIndex(1)

        // After normal transition completes, show TopNavigation
        postCollapseTimerRef.current = setTimeout(() => {
          transitioning.current = false
          onShowNav?.()
        }, CAROUSEL_CONFIG.transitionDuration)
      }, CAROUSEL_CONFIG.collapseDuration)
      return
    }

    // Normal advance for all other steps
    transitioning.current = true
    setActiveIndex((prev) => prev + 1)
    setTimeout(() => {
      transitioning.current = false
    }, CAROUSEL_CONFIG.transitionDuration)
  }, [activeIndex, expandState, onComplete, onShowNav])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (expandTimerRef.current) clearTimeout(expandTimerRef.current)
      if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current)
      if (postCollapseTimerRef.current) clearTimeout(postCollapseTimerRef.current)
    }
  }, [])

  // Center the active card within the viewport
  const translateX = (viewportWidth / 2) - (cardWidth / 2) - (activeIndex * (cardWidth + gap))

  const isWelcomeExpanding = expandState !== 'idle'

  function getCardClassName(index: number): string {
    if (index === activeIndex) return 'carousel-card'
    if (index === activeIndex - 1) return 'carousel-card adjacent-left'
    if (index === activeIndex + 1) return 'carousel-card adjacent-right'
    return 'carousel-card hidden-card'
  }

  return (
    <>
      {/* Portal: two layers — background animates, content stays still */}
      {isWelcomeExpanding && createPortal(
        <>
          {/* Layer 1: white background that scales from card to fullscreen */}
          <div
            className={`expand-bg ${expandState}`}
            style={{
              '--scale-x': window.innerWidth / cardWidth,
              '--scale-y': window.innerHeight / CAROUSEL_CONFIG.cardHeight,
            } as React.CSSProperties}
          />
          {/* Layer 2: content — fixed position, never moves */}
          <div className="expand-content">
            <WelcomeStep onNext={advance} disabled={expandState === 'expanding'} />
          </div>
        </>,
        document.body
      )}

      <div className="carousel-viewport">
        <div
          className="carousel-track"
          style={{
            transform: `translateX(${translateX}px)`,
          }}
        >
          {/* Step 0: WelcomeStep — hidden placeholder when rendered via portal */}
          <div className={
            isWelcomeExpanding ? 'carousel-card hidden-card' : getCardClassName(0)
          }>
            {!isWelcomeExpanding && <WelcomeStep onNext={advance} />}
          </div>

          {/* Step 1: PersonalInfoStep */}
          <div className={getCardClassName(1)}>
            <PersonalInfoStep onNext={advance} onNameChange={setFirstName} />
          </div>

          {/* Step 2: RoleStep */}
          <div className={getCardClassName(2)}>
            <RoleStep
              selectedRole={selectedRole}
              onSelectRole={setSelectedRole}
              onNext={advance}
            />
          </div>

          {/* Step 3: PhotoUploadStep */}
          <div className={getCardClassName(3)}>
            <PhotoUploadStep hasPhoto={hasPhoto} onNext={() => { setHasPhoto(true); advance() }} />
          </div>
        </div>
      </div>
    </>
  )
}
