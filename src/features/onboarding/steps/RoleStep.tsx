import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RoleTagList } from '../components/RoleTagList'
import { StepIndicator } from '../components/StepIndicator'
import { useRegistrationStore } from '../useRegistrationStore'
import { isMockMode } from '../../../mock'

interface RoleStepProps {
  selectedRole: string | null
  onNext: () => void
  onSelectRole: (role: string) => void
}

/** Step 6 — asks the user what their role is. */
export function RoleStep({ selectedRole, onNext, onSelectRole }: RoleStepProps) {
  const { t } = useTranslation()
  const jobTitle = useRegistrationStore((s) => s.jobTitle)
  const setField = useRegistrationStore((s) => s.setField)

  // Initialize from store on mount (supports back-navigation)
  useEffect(() => {
    if (!selectedRole && jobTitle) {
      onSelectRole(jobTitle)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleNext = () => {
    // Persist selected role to registration store before advancing
    setField('jobTitle', selectedRole ?? '')
    onNext()
  }

  return (
    <div className="flex flex-col items-center w-full h-full px-6 pt-8 pb-4 overflow-hidden">
      {/* Title */}
      <div
        className="w-full text-left mb-4"
        style={{
          fontWeight: 700,
          fontSize: '32px',
          lineHeight: '1.2',
          color: '#000000',
        }}
      >
        {t('what_is_your_job')}
      </div>

      {/* Role tags */}
      <div className="w-full flex-1 min-h-0 overflow-y-auto">
        <RoleTagList selectedRole={selectedRole} onSelectRole={onSelectRole} />
      </div>

      {/* Footer: button + indicator pinned to bottom with guaranteed spacing */}
      <div className="mt-auto flex-shrink-0 w-full">
        <button
          className="w-full h-[48px] bg-black text-white rounded-[16px] text-[20px] cursor-pointer border-none hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={!isMockMode() && !selectedRole}
          type="button"
          onClick={handleNext}
        >
          {t('proceed').toUpperCase()}
        </button>
        <StepIndicator hasNext={true} />
      </div>
    </div>
  )
}
