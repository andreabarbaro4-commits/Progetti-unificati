import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FlowleeLogo } from '../components/FlowleeLogo'
import { StepIndicator } from '../components/StepIndicator'
import { createFormConfig } from '../../../lib/form-utils'
import { AccountSchema, type AccountData } from '../schemas'

interface AccountStepProps {
  onNext: () => void
  firstName: string
}

/** Step 2 — collects the email/password for the new account. */
export function AccountStep({ onNext, firstName }: AccountStepProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountData>(createFormConfig(AccountSchema))

  return (
    <div className="flex flex-col items-center w-full h-full px-6 pt-8 pb-4 overflow-hidden">
      {/* Logo */}
      <FlowleeLogo />

      {/* Title */}
      <div
        className="w-full mt-5 mb-3 text-left text-[32px] font-bold leading-[1.2] text-black"
      >
        {t('hello_name', { name: firstName || 'Marco' })}
        <br />
        {t('create_account')}
      </div>

      {/* Form */}
      <form className="w-full flex flex-col flex-1 min-h-0" onSubmit={handleSubmit(() => onNext())}>
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

        {/* Confirm Password */}
        <FieldGroup error={errors.confirmPassword?.message} htmlFor="confirmPassword" label={t('confirm_password')}>
          <input
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            aria-invalid={!!errors.confirmPassword}
            className="w-full px-4 py-3 bg-[#f1f1f9] rounded-lg border-none text-[16px] outline-none placeholder:text-black/30"
            id="confirmPassword"
            placeholder={t('confirm_password')}
            type="password"
            {...register('confirmPassword')}
          />
        </FieldGroup>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer: button + indicator pinned to bottom with guaranteed spacing */}
        <div className="mt-auto flex-shrink-0">
          <button
            className="w-full h-[48px] bg-black text-white rounded-[16px] text-[20px] cursor-pointer border-none hover:bg-gray-800 transition-colors"
            type="submit"
          >
            {t('next').toUpperCase()}
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
