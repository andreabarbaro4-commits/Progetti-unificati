import { useTranslation } from 'react-i18next'
import { FlowleeLogo } from '../../../components/AppShell/FlowleeLogo'
import { StepIndicator } from '../components/StepIndicator'

interface AuthChoiceStepProps {
  onSignUp: () => void
  onLogin: () => void
}

/** Step 0 — lets the visitor choose between Login and Sign up. */
export function AuthChoiceStep({ onSignUp, onLogin }: AuthChoiceStepProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center w-full h-full px-6 pt-8 pb-4 overflow-hidden">
      {/* Logo */}
      <FlowleeLogo />

      {/* Title */}
      <div className="w-full mt-5 mb-3 text-left text-[32px] font-bold leading-[1.2] text-black">
        {t('auth.choice_title')}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer: buttons + indicator pinned to bottom with guaranteed spacing */}
      <div className="mt-auto flex-shrink-0 flex flex-col gap-3">
        <button
          type="button"
          onClick={onSignUp}
          className="w-full h-[48px] bg-black text-white rounded-[16px] text-[20px] cursor-pointer border-none hover:bg-gray-800 transition-colors"
        >
          {t('auth.sign_up').toUpperCase()}
        </button>
        <button
          type="button"
          onClick={onLogin}
          className="w-full h-[48px] border border-black text-black rounded-[16px] text-[20px] cursor-pointer bg-transparent hover:bg-gray-50 transition-colors"
        >
          {t('auth.login').toUpperCase()}
        </button>
        <StepIndicator hasNext={true} />
      </div>
    </div>
  )
}
