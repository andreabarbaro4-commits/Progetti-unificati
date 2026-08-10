import { useCallback } from 'react'
import { TopNavigationBar } from './TopNavigationBar'
import { AnimatedBackground } from '../../../components/AnimatedBackground/AnimatedBackground'
import { VerticalCarousel } from './VerticalCarousel'
import { WIZARD_STEPS, VERTICAL_CAROUSEL_CONFIG } from './verticalCarouselConfig'
import { useCompanyWizardStore } from '../useCompanyWizardStore'
import { OrgTypeStep } from '../steps/OrgTypeStep'
import { OrgDetailsStep } from '../steps/OrgDetailsStep'
import { CompanySettingsStep } from '../steps/CompanySettingsStep'

export interface VerticalCarouselWizardProps {
  /** Called when the wizard completes (last step submitted successfully) */
  onComplete: () => void
}

const TOTAL_STEPS = WIZARD_STEPS.length
const STEP_LABELS = WIZARD_STEPS.map((s) => s.label)

/**
 * Top-level orchestrator that composes the navigation bar, background decorations,
 * and vertical carousel for the company creation wizard flow.
 */
export function VerticalCarouselWizard({ onComplete }: VerticalCarouselWizardProps) {
  const activeStep = useCompanyWizardStore((s) => s.activeStep)
  const isTransitioning = useCompanyWizardStore((s) => s.isTransitioning)
  const setActiveStep = useCompanyWizardStore((s) => s.setActiveStep)
  const setTransitioning = useCompanyWizardStore((s) => s.setTransitioning)

  const handleAdvance = useCallback(() => {
    if (isTransitioning) return
    if (activeStep >= TOTAL_STEPS - 1) return

    setTransitioning(true)
    const nextStep = activeStep + 1
    setActiveStep(nextStep)

    setTimeout(() => {
      setTransitioning(false)
    }, VERTICAL_CAROUSEL_CONFIG.transitionDuration)
  }, [activeStep, isTransitioning, setActiveStep, setTransitioning])

  const handleBack = useCallback(() => {
    if (isTransitioning) return
    if (activeStep <= 0) return

    setTransitioning(true)
    const prevStep = activeStep - 1
    setActiveStep(prevStep)

    setTimeout(() => {
      setTransitioning(false)
    }, VERTICAL_CAROUSEL_CONFIG.transitionDuration)
  }, [activeStep, isTransitioning, setActiveStep, setTransitioning])

  return (
    <div className="fixed inset-0 overflow-hidden">
      <AnimatedBackground />

      <TopNavigationBar
        activeStep={activeStep}
        totalSteps={TOTAL_STEPS}
        stepLabels={STEP_LABELS}
        onBack={handleBack}
        onForward={handleAdvance}
        isTransitioning={isTransitioning}
      />

      <VerticalCarousel
        activeStep={activeStep}
        onAdvance={handleAdvance}
        onBack={handleBack}
      >
        <OrgTypeStep onNext={handleAdvance} />
        <OrgDetailsStep onBack={handleBack} onNext={handleAdvance} />
        <CompanySettingsStep onSave={onComplete} />
      </VerticalCarousel>
    </div>
  )
}
