import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'
import { FlowleeLogo } from '../../../components/AppShell/FlowleeLogo'
import { StepIndicator } from '../components/StepIndicator'
import { createFormConfig } from '../../../lib/form-utils'
import { sendVerificationCode, verifyCode, type VerifyCodeErrorResponse } from '../../auth/verification-code'
import { useOnboardingStore } from '../useOnboardingStore'

const VerifyCodeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'validation.code_format'),
})

type VerifyCodeData = z.infer<typeof VerifyCodeSchema>

interface VerifyCodeStepProps {
  onNext: () => void
  email: string
}

/** Step 4 — the user enters the verification code sent by email. */
export function VerifyCodeStep({ onNext, email }: VerifyCodeStepProps) {
  const { t } = useTranslation()
  const setEmailVerified = useOnboardingStore((s) => s.setEmailVerified)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verifyError, setVerifyError] = useState<string | null>(null)
  const [isMaxAttempts, setIsMaxAttempts] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (cooldown <= 0) return

    const interval = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [cooldown])

  // Send verification code on mount (fire and forget)
  useEffect(() => {
    sendVerificationCode({ email })
  }, [email])

  const handleResend = () => {
    sendVerificationCode({ email })
    setCooldown(30)
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<VerifyCodeData>(createFormConfig(VerifyCodeSchema))

  const onSubmit = async (data: VerifyCodeData) => {
    setVerifyError(null)
    setIsSubmitting(true)

    try {
      await verifyCode({ email, code: data.code })
      setEmailVerified(true)
      onNext()
    } catch (err: unknown) {
      const errorResponse = err as VerifyCodeErrorResponse
      switch (errorResponse.error) {
        case 'invalid_code':
          setVerifyError('verification.errors.invalid_code')
          break
        case 'expired_code':
          setVerifyError('verification.errors.expired_code')
          break
        case 'max_attempts':
          setVerifyError('verification.errors.max_attempts')
          setIsMaxAttempts(true)
          break
        default:
          setVerifyError('verification.errors.network_error')
          break
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasFieldError = !!errors.code
  const hasVerifyError = !!verifyError
  const hasAnyError = hasFieldError || hasVerifyError

  return (
    <div className="flex flex-col items-center w-full h-full px-6 pt-8 pb-4 overflow-hidden">
      {/* Logo */}
      <FlowleeLogo />

      {/* Title */}
      <div className="w-full mt-5 mb-2 text-left text-[32px] font-bold leading-[1.2] text-black">
        {t('insert_code')}
      </div>

      {/* Email display */}
      <p className="w-full text-left mb-4" style={{ fontSize: '16px', color: '#000' }}>
        {email}
      </p>

      {/* Code input */}
      <form className="w-full flex flex-col flex-1 min-h-0" onSubmit={handleSubmit(onSubmit)}>
        <div className="w-full mb-4">
          <label
            className="block mb-1"
            htmlFor="code"
            style={{ fontWeight: 400, fontSize: '20px', color: '#000' }}
          >
            {t('code')}
          </label>
          <input
            aria-describedby={hasAnyError ? 'code-error' : undefined}
            aria-invalid={hasAnyError}
            className="w-full px-4 py-3 bg-[#f1f1f9] rounded-lg border-none text-[16px] outline-none placeholder:text-black/30 disabled:opacity-50"
            disabled={isMaxAttempts}
            id="code"
            placeholder={t('code')}
            type="text"
            inputMode="numeric"
            {...register('code')}
          />
          {/* Error container with aria-live for screen readers */}
          <div aria-live="polite" className="h-5 mt-1" id="code-error">
            {hasFieldError && (
              <span className="text-[12px] text-red-600 leading-none">
                {t(errors.code?.message ?? '')}
              </span>
            )}
            {hasVerifyError && !hasFieldError && (
              <span className="text-[12px] text-red-600 leading-none">
                {t(verifyError)}
              </span>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer: buttons + indicator pinned to bottom */}
        <div className="mt-auto flex-shrink-0 w-full">
          <div className="flex flex-col items-center gap-3 w-full">
            <button
              aria-label={cooldown > 0 ? `Resend code available in ${cooldown} seconds` : undefined}
              className="w-full h-[48px] bg-transparent text-black rounded-[16px] text-[20px] cursor-pointer border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={cooldown > 0 || isSubmitting}
              onClick={handleResend}
              type="button"
            >
              {cooldown > 0 ? `${t('resend_code')} (${cooldown}s)` : t('resend_code')}
            </button>
            <button
              className="w-full h-[48px] bg-black text-white rounded-[16px] text-[20px] cursor-pointer border-none hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isSubmitting || isMaxAttempts}
              type="submit"
            >
              {isSubmitting && (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-white rounded-full animate-spin" />
              )}
              {t('confirm').toUpperCase()}
            </button>
          </div>
          <StepIndicator hasNext={true} />
        </div>
      </form>
    </div>
  )
}
