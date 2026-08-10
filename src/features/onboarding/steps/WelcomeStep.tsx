import { useTranslation } from 'react-i18next'
import avatar3 from '../../../assets/avatar3.png'
import { StepIndicator } from '../components/StepIndicator'

interface WelcomeStepProps {
  onNext: () => void
  disabled?: boolean
}

/** Step 5 — welcomes the verified user before starting the profile setup. */
export function WelcomeStep({ onNext, disabled }: WelcomeStepProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center w-full h-full px-6 pt-8 pb-4 overflow-hidden">
      {/* Avatar */}
      <div className="flex-1 flex items-center justify-center min-h-0">
        <img
          alt="avatar"
          className="max-w-[300px] max-h-[280px] object-contain"
          src={avatar3}
        />
      </div>

      {/* Text */}
      <div
        className="w-full text-left mb-6"
        style={{
          fontWeight: 700,
          fontSize: '32px',
          lineHeight: '1.2',
          color: '#000000',
        }}
      >
        {t('nice_to_meet_you')}
      </div>

      {/* Footer: button + indicator pinned to bottom with guaranteed spacing */}
      <div className="mt-auto flex-shrink-0 w-full">
        <button
          className="w-full h-[48px] bg-black text-white rounded-[16px] text-[20px] cursor-pointer border-none hover:bg-gray-800 transition-colors font-[inherit] disabled:opacity-40 disabled:cursor-not-allowed"
          disabled={disabled}
          type="button"
          onClick={onNext}
        >
          {t('create_profile').toUpperCase()}
        </button>
        <StepIndicator hasNext={true} />
      </div>
    </div>
  )
}
