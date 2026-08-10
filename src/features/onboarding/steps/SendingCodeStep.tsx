import { useTranslation } from 'react-i18next'
import avatar from '../../../assets/avatar.png'
import { FlowleeLogo } from '../../../components/AppShell/FlowleeLogo'
import { StepIndicator } from '../components/StepIndicator'

interface SendingCodeStepProps {
  onNext: () => void
}

/** Step 3 — informs the user that a verification code is on its way. Auto-advances after 3s. */
export function SendingCodeStep({ onNext }: SendingCodeStepProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center w-full h-full px-6 pt-8 pb-4 overflow-hidden">
      {/* Logo */}
      <FlowleeLogo />

      {/* Avatar */}
      <div className="flex-1 flex items-center justify-center min-h-0 my-4">
        <img
          alt="avatar"
          className="max-w-[280px] max-h-[260px] object-contain"
          src={avatar}
        />
      </div>

      {/* Text */}
      <div
        className="w-full text-center mb-6"
        style={{
          fontWeight: 700,
          fontSize: '32px',
          lineHeight: '1.2',
          color: '#000000',
        }}
      >
        {t('sending_code')}
      </div>

      {/* Footer: button + indicator pinned to bottom with guaranteed spacing */}
      <div className="mt-auto flex-shrink-0 w-full">
        <button
          className="w-full h-[48px] bg-black text-white rounded-[16px] text-[20px] cursor-pointer border-none hover:bg-gray-800 transition-colors"
          type="button"
          onClick={onNext}
        >
          {t('next').toUpperCase()}
        </button>
        <StepIndicator hasNext={true} />
      </div>
    </div>
  )
}
