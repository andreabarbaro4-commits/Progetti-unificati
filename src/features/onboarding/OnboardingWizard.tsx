import { useState } from 'react'
import type { Step } from './types'
import { PersonalInfoStep } from './steps/PersonalInfoStep'
import { AccountStep } from './steps/AccountStep'
import { SendingCodeStep } from './steps/SendingCodeStep'
import { VerifyCodeStep } from './steps/VerifyCodeStep'
import { WelcomeStep } from './steps/WelcomeStep'
import { RoleStep } from './steps/RoleStep'
import { JobStep } from './steps/JobStep'
import { PhotoUploadStep } from './steps/PhotoUploadStep'
import { OrgTypeStep } from './steps/OrgTypeStep'
import { OrgDetailsStep } from './steps/OrgDetailsStep'
import { CompanySettingsStep } from './steps/CompanySettingsStep'

/** Top-level onboarding flow. Owns step navigation and the state shared across steps. */
export function OnboardingWizard() {
  const [step, setStep] = useState<Step>('personal-info')
  const [selectedRole, setSelectedRole] = useState<string | null>(null)

  switch (step) {
    case 'personal-info':
      return <PersonalInfoStep onNext={() => setStep('account')} />
    case 'account':
      return <AccountStep onNext={() => setStep('sending-code')} />
    case 'sending-code':
      return <SendingCodeStep onNext={() => setStep('verify-code')} />
    case 'verify-code':
      return <VerifyCodeStep onNext={() => setStep('welcome')} />
    case 'welcome':
      return <WelcomeStep onNext={() => setStep('role')} />
    case 'role':
      return (
        <RoleStep
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
          onNext={() => setStep('job')}
        />
      )
    case 'job':
      return (
        <JobStep
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
          onNext={() => setStep('photo-upload')}
        />
      )
    case 'photo-upload':
      return <PhotoUploadStep hasPhoto={false} onNext={() => setStep('photo-uploaded')} />
    case 'photo-uploaded':
      return <PhotoUploadStep hasPhoto onNext={() => setStep('org-type')} />
    case 'org-type':
      return <OrgTypeStep onNext={() => setStep('org-details')} />
    case 'org-details':
      return (
        <OrgDetailsStep
          onBack={() => setStep('org-type')}
          onNext={() => setStep('company-settings')}
        />
      )
    case 'company-settings':
      return <CompanySettingsStep onSave={() => setStep('done')} />
    case 'done':
      return null
  }
}

export default OnboardingWizard;
