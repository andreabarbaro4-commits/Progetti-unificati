import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { FlowleeLogo } from '../../../components/AppShell/FlowleeLogo'
import { StepIndicator } from '../components/StepIndicator'
import { createFormConfig } from '../../../lib/form-utils'
import { LoginSchema, type LoginData } from '../schemas'
import { login } from '../../auth/api'
import { useAuth } from '../../auth/AuthProvider'

/**
 * Login card shown when a visitor selects "Log in" on AuthChoiceStep.
 * Takes no props — unlike every other step, a successful login leaves the
 * onboarding flow entirely (navigates straight to /dashboard) instead of
 * advancing the carousel, so it needs no `onNext`/`advance` callback.
 */
export function LoginCard() {
  const { t } = useTranslation()
  const { establishSession } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>(createFormConfig(LoginSchema))

  const onSubmit = async (data: LoginData) => {
    setError(null) // Requirement 5.3: clear previous error before the new request
    try {
      const response = await login(data)
      establishSession(
        { sub: response.user.id, email: response.user.email, name: response.user.name },
        response.accessToken,
      )
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('error.something_went_wrong'))
    }
  }

  return (
    <div className="flex flex-col items-center w-full h-full px-6 pt-8 pb-4 overflow-hidden">
      {/* Logo */}
      <FlowleeLogo />

      {/* Title */}
      <div
        className="w-full mt-5 mb-3 text-left text-[32px] font-bold leading-[1.2] text-black"
      >
        {t('auth.login_title')}
      </div>

      {/* Form */}
      <form className="w-full flex flex-col flex-1 min-h-0" onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        <FieldGroup error={errors.email?.message} htmlFor="email" label={t('email')}>
          <input
            aria-describedby={errors.email ? 'email-error' : undefined}
            aria-invalid={!!errors.email}
            className="w-full px-4 py-3 bg-[#f1f1f9] rounded-lg border-none text-[16px] outline-none placeholder:text-black/30"
            id="email"
            placeholder={t('email')}
            type="email"
            {...register('email')}
          />
        </FieldGroup>

        {/* Password */}
        <FieldGroup error={errors.password?.message} htmlFor="password" label={t('password')}>
          <input
            aria-describedby={errors.password ? 'password-error' : undefined}
            aria-invalid={!!errors.password}
            className="w-full px-4 py-3 bg-[#f1f1f9] rounded-lg border-none text-[16px] outline-none placeholder:text-black/30"
            id="password"
            placeholder={t('password')}
            type="password"
            {...register('password')}
          />
        </FieldGroup>

        {/* Submission error */}
        {error && (
          <p className="text-[11px] text-red-600 mt-1" role="alert">
            {error}
          </p>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer: button + indicator pinned to bottom with guaranteed spacing */}
        <div className="mt-auto flex-shrink-0">
          <button
            className="w-full h-[48px] bg-black text-white rounded-[16px] text-[20px] cursor-pointer border-none hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
            type="submit"
          >
            {t('auth.login').toUpperCase()}
          </button>
          <StepIndicator hasNext={true} />
        </div>
      </form>
    </div>
  )
}

/* ─── Internal helper ─── */

interface FieldGroupProps {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}

function FieldGroup({ label, htmlFor, error, children }: FieldGroupProps) {
  const { t } = useTranslation()

  return (
    <div className="mb-1">
      <label
        className="block mb-1"
        htmlFor={htmlFor}
        style={{ fontWeight: 400, fontSize: '20px', color: '#000' }}
      >
        {label}
      </label>
      {children}
      {/* Fixed-height error slot — prevents layout shift */}
      <div className="h-4 mt-0.5">
        {error && (
          <span
            className="text-[11px] text-red-600 leading-none"
            id={`${htmlFor}-error`}
            role="alert"
          >
            {t(error)}
          </span>
        )}
      </div>
    </div>
  )
}
