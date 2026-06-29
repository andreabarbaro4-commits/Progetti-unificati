import { useState } from 'react'
import { OrgTypeStep } from './steps/OrgTypeStep'
import { OrgDetailsStep } from './steps/OrgDetailsStep'
import type { OnboardingForm, OnboardingStep, OrgType } from './types'

const BACKGROUND =
  '[background-image:radial-gradient(circle_at_50%_50%,#ff5f6d_0%,transparent_90%),radial-gradient(circle_at_50%_50%,#6a11cb_0%,transparent_90%)]'

const INITIAL_FORM: OnboardingForm = {
  companyName: '',
  teamSize: '30-50',
  description: '',
}

/**
 * Two-step onboarding wizard. Form state lives here so values are preserved
 * when the user navigates back and forth between steps.
 */
export function OnboardingWizard() {
  const [step, setStep] = useState<OnboardingStep>(1)
  const [orgType, setOrgType] = useState<OrgType | null>(null)
  const [form, setForm] = useState<OnboardingForm>(INITIAL_FORM)

  const handleSelectType = (type: OrgType) => {
    setOrgType(type)
    setStep(2)
  }

  const handleFormChange = (patch: Partial<OnboardingForm>) => {
    setForm((current) => ({ ...current, ...patch }))
  }

  return (
    <div className={`flex min-h-screen w-full items-center justify-center ${BACKGROUND}`}>
      <div className="absolute left-1/2 h-[700px] w-[700px] blur-[50px]" aria-hidden="true" />

      <main className="relative z-[2] flex min-h-screen w-full max-w-[900px] items-center justify-center">
        {step === 1 && <OrgTypeStep onSelectType={handleSelectType} />}

        {step === 2 && (
          <OrgDetailsStep
            orgType={orgType}
            values={form}
            onChange={handleFormChange}
            onBack={() => setStep(1)}
          />
        )}
      </main>
    </div>
  )
}
