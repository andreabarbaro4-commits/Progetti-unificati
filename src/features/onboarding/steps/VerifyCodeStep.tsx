import { useTranslation } from 'react-i18next'
import { FlowleeLogo } from '../components/FlowleeLogo'
import { StepIndicator } from '../components/StepIndicator'

interface VerifyCodeStepProps {
  onNext: () => void
}

/** Step 4 — the user enters the verification code sent by email. */
export function VerifyCodeStep({ onNext }: VerifyCodeStepProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center w-full h-full px-6 pt-8 pb-4 overflow-hidden">
      {/* Logo */}
      <FlowleeLogo />

      {/* Title */}
      <div
        className="w-full mt-5 mb-2 text-left text-[32px] font-bold leading-[1.2] text-black"
      >
        {t('insert_code')}
      </div>

      {/* Email display */}
      <p
        className="w-full text-left mb-4"
        style={{ fontSize: '16px', color: '#000' }}
      >
        mario.rossi@gmail.com
      </p>

      {/* Code input */}
      <div className="w-full mb-4">
        <label
          className="block mb-1"
          htmlFor="code"
          style={{ fontWeight: 400, fontSize: '20px', color: '#000' }}
        >
          {t('code')}
        </label>
        <input
          className="w-full px-4 py-3 bg-[#f1f1f9] rounded-lg border-none text-[16px] outline-none placeholder:text-black/30"
          id="code"
          placeholder={t('code')}
          type="text"
        />
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Footer: buttons + indicator pinned to bottom with guaranteed spacing */}
      <div className="mt-auto flex-shrink-0 w-full">
        <div className="flex flex-col items-center gap-3 w-full">
          <button
            className="w-full h-[48px] bg-transparent text-black rounded-[16px] text-[20px] cursor-pointer border border-gray-200 hover:bg-gray-50 transition-colors"
            type="button"
          >
            {t('resend_code')}
          </button>
          <button
            className="w-full h-[48px] bg-black text-white rounded-[16px] text-[20px] cursor-pointer border-none hover:bg-gray-800 transition-colors"
            type="button"
            onClick={onNext}
          >
            {t('confirm').toUpperCase()}
          </button>
        </div>
        <StepIndicator hasNext={true} />
      </div>
    </div>
  )
}
