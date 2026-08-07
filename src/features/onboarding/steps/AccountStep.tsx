import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FlowleeLogo } from '../components/FlowleeLogo'
import { FormField } from '../../../components/ui/FormField'
import { createFormConfig } from '../../../lib/form-utils'
import { AccountSchema, type AccountData } from '../schemas'

interface AccountStepProps {
  onNext: () => void
}

/** Step 2 — collects the email/password for the new account. */
export function AccountStep({ onNext }: AccountStepProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccountData>(createFormConfig(AccountSchema))

  return (
    <div className="container-sfondo">
      <div className="Step">
        <div className="logo">
          <FlowleeLogo />
        </div>

        {/* Contenitore che gestisce il layout flessibile */}
        <div className="Step-inner-container">
          <h1 className="section-title">
            {t('hello_marco')}
            <br />
            {t('create_account')}
          </h1>
          <form onSubmit={handleSubmit(() => onNext())}>
            <FormField name="email" label="email" error={errors.email?.message}>
              <input
                id="email"
                type="email"
                placeholder={t('email')}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
              />
            </FormField>
            <FormField name="password" label="password" error={errors.password?.message}>
              <input
                id="password"
                type="password"
                placeholder={t('password')}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
              />
            </FormField>
            <FormField
              name="confirmPassword"
              label="confirm_password"
              error={errors.confirmPassword?.message}
            >
              <input
                id="confirmPassword"
                type="password"
                placeholder={t('confirm_password')}
                aria-invalid={!!errors.confirmPassword}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                {...register('confirmPassword')}
              />
            </FormField>

            {/* Il margin-top: auto del CSS lo spingerà in fondo */}
            <button className="de" type="submit">
              {t('next')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
