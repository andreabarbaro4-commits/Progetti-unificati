import { useState, useRef, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { PersonalInfoStep } from '../steps/PersonalInfoStep'
import { AccountStep } from '../steps/AccountStep'
import { SendingCodeStep } from '../steps/SendingCodeStep'
import { VerifyCodeStep } from '../steps/VerifyCodeStep'
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
  welcomeStepIndex: 4,
}

const TOTAL_STEPS = 7

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
 * Horizontal carousel that renders all 7 registration steps on a single page.
 * Slides left on step completion using CSS transforms.
 * WelcomeStep (index 4) has a special expand-to-fullscreen animation.
 */
export function RegistrationCarousel({ onComplete, onShowNav }: RegistrationCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [expandState, setExpandState] = useState<ExpandState>('idle')
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

  const advance = useCallback(() => {
    // Guard: prevent double-advance during any transition
    if (transitioning.current) return
    if (expandState === 'expanding' || expandState === 'collapsing') return

    if (activeIndex >= TOTAL_STEPS - 1) {
      onComplete()
      return
    }

    // Arriving at WelcomeStep: trigger expand instead of normal advance
    if (activeIndex === 3) {
      transitioning.current = true
      setActiveIndex(4)
      setExpandState('expanding')

      expandTimerRef.current = setTimeout(() => {
        setExpandState('expanded')
        transitioning.current = false
      }, CAROUSEL_CONFIG.expandDuration)
      return
    }

    // Leaving WelcomeStep: collapse first, then normal advance
    if (activeIndex === 4 && expandState === 'expanded') {
      setExpandState('collapsing')
      transitioning.current = true

      collapseTimerRef.current = setTimeout(() => {
        // Collapse done — reset expand state and perform normal advance
        setExpandState('idle')
        setActiveIndex(5)

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
          {/* Step 1: PersonalInfoStep */}
          <div className={getCardClassName(0)}>
            <PersonalInfoStep onNext={advance} onNameChange={setFirstName} />
          </div>

          {/* Step 2: AccountStep */}
          <div className={getCardClassName(1)}>
            <AccountStep firstName={firstName} onNext={advance} />
          </div>

          {/* Step 3: SendingCodeStep */}
          <div className={getCardClassName(2)}>
            <SendingCodeStep onNext={advance} />
          </div>

          {/* Step 4: VerifyCodeStep */}
          <div className={getCardClassName(3)}>
            <VerifyCodeStep onNext={advance} />
          </div>

          {/* Step 5: WelcomeStep — hidden placeholder when rendered via portal */}
          <div className={
            isWelcomeExpanding ? 'carousel-card hidden-card' : getCardClassName(4)
          }>
            {!isWelcomeExpanding && <WelcomeStep onNext={advance} />}
          </div>

          {/* Step 6: RoleStep */}
          <div className={getCardClassName(5)}>
            <RoleStep
              selectedRole={selectedRole}
              onSelectRole={setSelectedRole}
              onNext={advance}
            />
          </div>

          {/* Step 7: PhotoUploadStep */}
          <div className={getCardClassName(6)}>
            <PhotoUploadStep hasPhoto={hasPhoto} onNext={() => { setHasPhoto(true); advance() }} />
          </div>
        </div>
      </div>
    </>
  )
}
