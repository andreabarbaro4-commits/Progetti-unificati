import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../components/ui/Button'
import { FormField } from '../../../components/ui/FormField'
import { createFormConfig } from '../../../lib/form-utils'
import { ContactInfoSchema, type ContactInfoData } from '../schemas'

const fieldClasses =
  'w-full rounded-full border border-gray-200 bg-white px-5 py-3 text-base outline-none focus:border-gray-400'

interface ContactInfoStepProps {
  onBack: () => void
  onNext: () => void
}

/** Step between OrgDetails and CompanySettings — collects optional company contact info. */
export function ContactInfoStep({ onBack, onNext }: ContactInfoStepProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactInfoData>(
    createFormConfig(ContactInfoSchema, {
      defaultValues: { address: '', email: '', phone: '' },
    }),
  )

  return (
    <form
      className="relative flex h-full flex-col"
      onSubmit={handleSubmit(() => onNext())}
    >
      {/* Two-column content */}
      <div className="flex flex-1 min-h-0 flex-col gap-8 md:flex-row md:items-center md:gap-[5%]">
        {/* Left: Heading text */}
        <div className="flex flex-col justify-center gap-4 md:w-[40%] md:flex-shrink-0">
          <h2 className="!text-5xl md:!text-6xl font-bold text-black leading-[1.1] m-0">
            Inserisci<br />
            solo alcuni<br />
            dati di contatto
          </h2>
          <p className="text-lg text-gray-500 m-0 leading-snug">
            Qui inseriamo un secondo testo,<br />
            per ora è un placeholder.
          </p>
        </div>

        {/* Right: Form fields */}
        <div className="flex-1 min-w-0 flex flex-col justify-center space-y-5">
          <FormField
            name="address"
            label="Indirizzo"
            error={errors.address?.message}
            unstyled
          >
            <input
              className={fieldClasses}
              aria-describedby={errors.address ? 'address-error' : undefined}
              aria-invalid={!!errors.address}
              id="address"
              placeholder="Inserire indirizzo..."
              {...register('address')}
            />
          </FormField>

          <FormField
            name="email"
            label="Email"
            error={errors.email?.message}
            unstyled
          >
            <input
              className={fieldClasses}
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={!!errors.email}
              id="contactEmail"
              placeholder="Inserire mail per il contatto aziendale..."
              type="email"
              {...register('email')}
            />
          </FormField>

          <FormField
            name="phone"
            label="Telefono"
            error={errors.phone?.message}
            unstyled
          >
            <input
              className={fieldClasses}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              aria-invalid={!!errors.phone}
              id="phone"
              placeholder="Inserire mail per il contatto aziendale..."
              type="tel"
              {...register('phone')}
            />
          </FormField>
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="absolute bottom-0 right-0 flex items-center gap-3">
        <Button className="rounded-3xl px-8 py-3 text-lg" type="submit" variant="primary">
          {t('proceed')}
        </Button>
        <Button
          className="rounded-3xl px-8 py-3 text-lg"
          type="button"
          variant="secondary"
          onClick={onNext}
        >
          {t('skip')}
        </Button>
      </div>
    </form>
  )
}
