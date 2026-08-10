import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { RegistrationCarousel } from './components/RegistrationCarousel'
import { VerticalCarouselWizard } from './components/VerticalCarouselWizard'
import { TopNavigationBar } from '../../components/AppShell/TopNavigationBar'
import { AuthChoiceStep } from './steps/AuthChoiceStep'
import { useOnboardingStore } from './useOnboardingStore'
import { useAuth } from '../auth/AuthProvider'
import { useProfileCheck } from './hooks/useProfileCheck'
import './OnboardingWizard.css'

const CROSSFADE_DURATION = 500

/** Top-level onboarding flow. Delegates registration steps 1–9 to the carousel,
 *  then renders the organizational steps via the VerticalCarouselWizard.
 *  Phase is persisted in sessionStorage so a refresh doesn't reset progress. */
export function OnboardingWizard() {
  const { phase, setPhase } = useOnboardingStore()
  const { isAuthenticated, isLoading, signup, login } = useAuth()
  const navigate = useNavigate()
  const [showNav, setShowNav] = useState(false)
  const [navVisible, setNavVisible] = useState(false)

  // Profile check — must be called unconditionally (hook rules).
  // The `enabled` flag inside the hook handles conditional fetching.
  const profileQuery = useProfileCheck()

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

  // If profile already exists, skip registration and go to org-type
  useEffect(() => {
    if (phase === 'registration' && isAuthenticated && profileQuery.data) {
      setPhase('org-type')
    }
  }, [phase, isAuthenticated, profileQuery.data, setPhase])

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
            <VerticalCarouselWizard
              onComplete={() => {
                setPhase('done')
                navigate('/dashboard')
              }}
              onFreelanceSkip={() => {
                setPhase('done')
                navigate('/dashboard')
              }}
            />
          </div>
        </div>
      </>
    )
  }

  switch (phase) {
    case 'registration':
      // Not authenticated: show pre-auth landing with signup/login buttons
      if (!isAuthenticated) {
        if (isLoading) return null
        return (
          <div className="carousel-viewport">
            <div className="flex items-center justify-center w-full h-full">
              <div className="carousel-card" style={{ width: 448, height: 700 }}>
                <AuthChoiceStep
                  onSignUp={() => signup('/onboarding')}
                  onLogin={() => login('/onboarding')}
                />
              </div>
            </div>
          </div>
        )
      }

      // Authenticated: check profile state before showing wizard
      // Loading state — waiting for profile check
      if (profileQuery.isLoading || profileQuery.isFetching) {
        return (
          <div className="carousel-viewport">
            <div className="flex items-center justify-center w-full h-full">
              <p className="text-gray-500">Loading...</p>
            </div>
          </div>
        )
      }

      // Profile exists — effect above will redirect to org-type, render nothing while that happens
      if (profileQuery.data) {
        return null
      }

      // 404 or other error — show the registration wizard (normal new-user flow)
      // For non-404 errors we also show the wizard as a fallback
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
      return (
        <VerticalCarouselWizard
          onComplete={() => {
            setPhase('done')
            navigate('/dashboard')
          }}
          onFreelanceSkip={() => {
            setPhase('done')
            navigate('/dashboard')
          }}
        />
      )
    case 'done':
      return null
  }
}

export default OnboardingWizard

