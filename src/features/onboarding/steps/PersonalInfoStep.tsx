import { useForm, Controller } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FlowleeLogo } from '../components/FlowleeLogo'
import { StepIndicator } from '../components/StepIndicator'
import { CustomSelect } from '../../../components/ui/CustomSelect'
import { createFormConfig } from '../../../lib/form-utils'
import { PersonalInfoSchema, type PersonalInfoData } from '../schemas'

interface PersonalInfoStepProps {
  onNext: () => void
  onNameChange: (name: string) => void
}

/** Step 1 — collects the user's basic personal details. */
export function PersonalInfoStep({ onNext, onNameChange }: PersonalInfoStepProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PersonalInfoData>(createFormConfig(PersonalInfoSchema))

  return (
    <div className="flex flex-col items-center w-full h-full px-6 pt-8 pb-4 overflow-hidden">
      {/* Logo */}
      <FlowleeLogo />

      {/* Title */}
      <div
        className="w-full mt-5 mb-3 text-left text-[32px] font-bold leading-[1.2] text-black"
      >
        {t('welcome')}
        <br />
        {t('tell_us_who_you_are')}
      </div>

      {/* Form */}
      <form className="w-full flex flex-col flex-1 min-h-0" onSubmit={handleSubmit((data) => { onNameChange(data.name); onNext() })}>
        {/* Nome */}
        <FieldGroup
          error={errors.name?.message}
          htmlFor="name"
          label={t('name')}
        >
          <input
            aria-describedby={errors.name ? 'name-error' : undefined}
            aria-invalid={!!errors.name}
            className="w-full px-4 py-3 bg-[#f1f1f9] rounded-lg border-none text-[16px] outline-none placeholder:text-black/30"
            id="name"
            placeholder={`${t('name')}...`}
            type="text"
            {...register('name')}
          />
        </FieldGroup>

        {/* Cognome */}
        <FieldGroup
          error={errors.surname?.message}
          htmlFor="surname"
          label={t('surname')}
        >
          <input
            aria-describedby={errors.surname ? 'surname-error' : undefined}
            aria-invalid={!!errors.surname}
            className="w-full px-4 py-3 bg-[#f1f1f9] rounded-lg border-none text-[16px] outline-none placeholder:text-black/30"
            id="surname"
            placeholder={`${t('name')}...`}
            type="text"
            {...register('surname')}
          />
        </FieldGroup>

        {/* Genere */}
        <FieldGroup
          error={errors.gender?.message}
          htmlFor="gender"
          label={t('gender')}
        >
          <Controller
            control={control}
            name="gender"
            render={({ field }) => (
              <CustomSelect
                aria-describedby={errors.gender ? 'gender-error' : undefined}
                aria-invalid={!!errors.gender}
                id="gender"
                name={field.name}
                options={[
                  { value: 'male', label: t('male') },
                  { value: 'female', label: t('female') },
                  { value: 'other', label: t('other') },
                ]}
                placeholder="—"
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
              />
            )}
          />
        </FieldGroup>

        {/* Data di nascita */}
        <FieldGroup
          error={errors.birthDate?.message}
          htmlFor="birthDate"
          label={t('birth_date')}
        >
          <input
            aria-describedby={errors.birthDate ? 'birthDate-error' : undefined}
            aria-invalid={!!errors.birthDate}
            className="w-full px-4 py-3 bg-[#f1f1f9] rounded-lg border-none text-[16px] outline-none placeholder:text-black/30"
            id="birthDate"
            placeholder="01-01-1999..."
            type="date"
            {...register('birthDate')}
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

/**
 * A form field wrapper with a fixed-height error slot to prevent layout shift.
 * Error text is always allocated 16px of height — visible or not.
 */
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
