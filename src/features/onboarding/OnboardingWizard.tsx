import { useState } from 'react'
import { RegistrationCarousel } from './components/RegistrationCarousel'
import { OrgTypeStep } from './steps/OrgTypeStep'
import { OrgDetailsStep } from './steps/OrgDetailsStep'
import { CompanySettingsStep } from './steps/CompanySettingsStep'

type Phase = 'registration' | 'org-type' | 'org-details' | 'company-settings' | 'done'

/** Top-level onboarding flow. Delegates registration steps 1–9 to the carousel,
 *  then renders the organizational steps as full-page components. */
export function OnboardingWizard() {
  const [phase, setPhase] = useState<Phase>('registration')

  switch (phase) {
    case 'registration':
      return <RegistrationCarousel onComplete={() => setPhase('org-type')} />
    case 'org-type':
      return <OrgTypeStep onNext={() => setPhase('org-details')} />
    case 'org-details':
      return (
        <OrgDetailsStep
          onBack={() => setPhase('org-type')}
          onNext={() => setPhase('company-settings')}
        />
      )
    case 'company-settings':
      return <CompanySettingsStep onSave={() => setPhase('done')} />
    case 'done':
      return null
  }
}

export default OnboardingWizard
