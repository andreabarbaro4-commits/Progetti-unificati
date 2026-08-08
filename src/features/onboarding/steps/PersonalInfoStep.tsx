import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { FlowleeLogo } from '../components/FlowleeLogo'
import { FormField } from '../../../components/ui/FormField'
import { createFormConfig } from '../../../lib/form-utils'
import { PersonalInfoSchema, type PersonalInfoData } from '../schemas'

interface PersonalInfoStepProps {
  onNext: () => void
}

/** Step 1 — collects the user's basic personal details. */
export function PersonalInfoStep({ onNext }: PersonalInfoStepProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PersonalInfoData>(createFormConfig(PersonalInfoSchema))

  return (
    <div className="Step">
      <div className="logo">
        <FlowleeLogo />
        <h1 className="section-title">
          {t('welcome')}
          <br />
          {t('tell_us_who_you_are')}
        </h1>
        <form onSubmit={handleSubmit(() => onNext())}>
          <FormField name="name" label="name" error={errors.name?.message}>
            <input
              id="name"
              type="text"
              placeholder={t('name')}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              {...register('name')}
            />
          </FormField>
          <FormField name="surname" label="surname" error={errors.surname?.message}>
            <input
              id="surname"
              type="text"
              placeholder={t('surname')}
              aria-invalid={!!errors.surname}
              aria-describedby={errors.surname ? 'surname-error' : undefined}
              {...register('surname')}
            />
          </FormField>
          <FormField name="gender" label="gender" error={errors.gender?.message}>
            <select
              id="gender"
              aria-invalid={!!errors.gender}
              aria-describedby={errors.gender ? 'gender-error' : undefined}
              {...register('gender')}
            >
              <option value="male">{t('male')}</option>
              <option value="female">{t('female')}</option>
            </select>
          </FormField>
          <FormField name="birthDate" label="birth_date" error={errors.birthDate?.message}>
            <input
              id="birthDate"
              type="text"
              placeholder="01/01/1999"
              aria-invalid={!!errors.birthDate}
              aria-describedby={errors.birthDate ? 'birthDate-error' : undefined}
              {...register('birthDate')}
            />
          </FormField>
          <button className="de" type="submit">
            {t('next')}
          </button>
        </form>
      </div>
    </div>
  )
}
