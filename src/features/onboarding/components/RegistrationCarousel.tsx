import { useState, useRef, useCallback, useEffect } from 'react'
import { PersonalInfoStep } from '../steps/PersonalInfoStep'
import { AccountStep } from '../steps/AccountStep'
import { SendingCodeStep } from '../steps/SendingCodeStep'
import { VerifyCodeStep } from '../steps/VerifyCodeStep'
import { WelcomeStep } from '../steps/WelcomeStep'
import { RoleStep } from '../steps/RoleStep'
import { JobStep } from '../steps/JobStep'
import { PhotoUploadStep } from '../steps/PhotoUploadStep'
import { StepIndicator } from './StepIndicator'
import './RegistrationCarousel.css'

const CAROUSEL_CONFIG = {
  cardWidth: 450,
  cardHeight: 640,
  cardGap: 24,
  transitionDuration: 400,
}

const TOTAL_STEPS = 9

interface RegistrationCarouselProps {
  onComplete: () => void
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
 * Horizontal carousel that renders all 9 registration steps on a single page.
 * Slides left on step completion using CSS transforms.
 */
export function RegistrationCarousel({ onComplete }: RegistrationCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const transitioning = useRef(false)

  // Shared state for steps that need it
  const [selectedRole, setSelectedRole] = useState<string | null>(null)
  const [hasPhoto, setHasPhoto] = useState(false)

  // Responsive card width calculation
  const { cardWidth, gap, viewportWidth } = useResponsiveCardWidth(CAROUSEL_CONFIG)

  const advance = useCallback(() => {
    // Guard: prevent double-advance during CSS transition
    if (transitioning.current) return

    if (activeIndex >= TOTAL_STEPS - 1) {
      // Last step completed — exit the carousel
      onComplete()
      return
    }

    transitioning.current = true
    setActiveIndex((prev) => prev + 1)

    // Release the guard after transition completes
    setTimeout(() => {
      transitioning.current = false
    }, CAROUSEL_CONFIG.transitionDuration)
  }, [activeIndex, onComplete])

  // Center the active card within the viewport
  const translateX = (viewportWidth / 2) - (cardWidth / 2) - (activeIndex * (cardWidth + gap))

  /**
   * Computes the CSS class for a card based on its position relative to activeIndex.
   * - Active card: fully visible
   * - Adjacent cards (±1): faint shadow preview
   * - All others: hidden
   */
  function getCardClassName(index: number): string {
    if (index === activeIndex) return 'carousel-card'
    if (index === activeIndex - 1) return 'carousel-card adjacent-left'
    if (index === activeIndex + 1) return 'carousel-card adjacent-right'
    return 'carousel-card hidden-card'
  }

  return (
    <div className="carousel-viewport">
      <div
        className="carousel-track"
        style={{
          transform: `translateX(${translateX}px)`,
        }}
      >
        {/* Step 1: PersonalInfoStep */}
        <div className={getCardClassName(0)}>
          <PersonalInfoStep onNext={advance} />
        </div>

        {/* Step 2: AccountStep */}
        <div className={getCardClassName(1)}>
          <AccountStep onNext={advance} />
        </div>

        {/* Step 3: SendingCodeStep */}
        <div className={getCardClassName(2)}>
          <SendingCodeStep onNext={advance} />
        </div>

        {/* Step 4: VerifyCodeStep */}
        <div className={getCardClassName(3)}>
          <VerifyCodeStep onNext={advance} />
        </div>

        {/* Step 5: WelcomeStep */}
        <div className={getCardClassName(4)}>
          <WelcomeStep onNext={advance} />
        </div>

        {/* Step 6: RoleStep */}
        <div className={getCardClassName(5)}>
          <RoleStep
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
            onNext={advance}
          />
        </div>

        {/* Step 7: JobStep */}
        <div className={getCardClassName(6)}>
          <JobStep
            selectedRole={selectedRole}
            onSelectRole={setSelectedRole}
            onNext={advance}
          />
        </div>

        {/* Step 8: PhotoUploadStep */}
        <div className={getCardClassName(7)}>
          <PhotoUploadStep hasPhoto={hasPhoto} onNext={() => { setHasPhoto(true); advance() }} />
        </div>

        {/* Step 9: PhotoUploadedStep (same component with hasPhoto=true) */}
        <div className={getCardClassName(8)}>
          <PhotoUploadStep hasPhoto={hasPhoto} onNext={advance} />
        </div>
      </div>

      {/* StepIndicator */}
      <StepIndicator total={TOTAL_STEPS} current={activeIndex} />
    </div>
  )
}
