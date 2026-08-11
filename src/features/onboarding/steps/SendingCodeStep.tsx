import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import avatar from '../../../assets/avatar.png'
import { FlowleeLogo } from '../../../components/AppShell/FlowleeLogo'
import { sendVerificationCode } from '../../auth/verification-code'
import { StepIndicator } from '../components/StepIndicator'

interface SendingCodeStepProps {
  onNext: () => void
  email: string
}

/** Step — sends verification code and auto-advances after min display time. */
export function SendingCodeStep({ onNext, email }: SendingCodeStepProps) {
  const { t } = useTranslation()
  const [isSending, setIsSending] = useState(true)

  useEffect(() => {
    let cancelled = false

    const send = async () => {
      await Promise.all([
        sendVerificationCode({ email }),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ])

      if (!cancelled) {
        setIsSending(false)
        onNext()
      }
    }

    send()

    return () => {
      cancelled = true
    }
  }, [email, onNext])

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
        className="w-full text-center mb-2"
        style={{
          fontWeight: 700,
          fontSize: '32px',
          lineHeight: '1.2',
          color: '#000000',
        }}
      >
        {t('sending_code')}
      </div>

      {/* Email display */}
      <div className="w-full text-center text-gray-600 text-base mb-4">
        {email}
      </div>

      {/* Loading indicator */}
      {isSending && (
        <div className="flex justify-center mb-4">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
        </div>
      )}

      {/* Footer: step indicator pinned to bottom */}
      <div className="mt-auto flex-shrink-0 w-full">
        <StepIndicator hasNext={true} />
      </div>
    </div>
  )
}
