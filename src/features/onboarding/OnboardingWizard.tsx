import { useState, useEffect, useRef } from 'react'
import { RegistrationCarousel } from './components/RegistrationCarousel'
import { VerticalCarouselWizard } from './components/VerticalCarouselWizard'
import { TopNavigationBar } from './components/TopNavigationBar'
import { useOnboardingStore } from './useOnboardingStore'
import './OnboardingWizard.css'

const CROSSFADE_DURATION = 500

/** Top-level onboarding flow. Delegates registration steps 1–9 to the carousel,
 *  then renders the organizational steps via the VerticalCarouselWizard.
 *  Phase is persisted in sessionStorage so a refresh doesn't reset progress. */
export function OnboardingWizard() {
  const { phase, setPhase } = useOnboardingStore()
  const [showNav, setShowNav] = useState(false)
  const [navVisible, setNavVisible] = useState(false)

  // Cross-fade transition state
  const [crossfading, setCrossfading] = useState(false)
  const [crossfadeVisible, setCrossfadeVisible] = useState(false)
  const crossfadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Stagger: mount first, then add .visible on next frame to trigger CSS transition
  useEffect(() => {
    if (showNav) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setNavVisible(true)
        })
      })
    }
  }, [showNav])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (crossfadeTimerRef.current) clearTimeout(crossfadeTimerRef.current)
    }
  }, [])

  /** Triggered when RegistrationCarousel completes — starts cross-fade */
  const handleRegistrationComplete = () => {
    setCrossfading(true)
    // Next frame: trigger the CSS transitions
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setCrossfadeVisible(true)
      })
    })
    // After animation completes, commit the phase change and clean up
    crossfadeTimerRef.current = setTimeout(() => {
      setPhase('org-type')
      setCrossfading(false)
      setCrossfadeVisible(false)
    }, CROSSFADE_DURATION)
  }

  // During cross-fade: render both layers, navbar stays fixed above
  if (crossfading) {
    return (
      <>
        {showNav && (
          <div className={`top-nav-wrapper${navVisible ? ' visible' : ''}`}>
            <TopNavigationBar />
          </div>
        )}
        <div className="onboarding-crossfade-container">
          {/* Outgoing: registration carousel fades out */}
          <div className={`onboarding-layer onboarding-layer--out${crossfadeVisible ? ' leaving' : ''}`}>
            <RegistrationCarousel
              onComplete={() => {}}
              onShowNav={() => {}}
            />
          </div>
          {/* Incoming: vertical carousel wizard fades/slides in */}
          <div className={`onboarding-layer onboarding-layer--in${crossfadeVisible ? ' entering' : ''}`}>
            <VerticalCarouselWizard onComplete={() => setPhase('done')} />
          </div>
        </div>
      </>
    )
  }

  switch (phase) {
    case 'registration':
      return (
        <>
          {showNav && (
            <div className={`top-nav-wrapper${navVisible ? ' visible' : ''}`}>
              <TopNavigationBar />
            </div>
          )}
          <RegistrationCarousel
            onComplete={handleRegistrationComplete}
            onShowNav={() => setShowNav(true)}
          />
        </>
      )
    case 'org-type':
    case 'org-details':
    case 'company-settings':
      return <VerticalCarouselWizard onComplete={() => setPhase('done')} />
    case 'done':
      return null
  }
}

export default OnboardingWizard

