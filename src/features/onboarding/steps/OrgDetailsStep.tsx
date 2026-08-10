import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { Button } from '../../../components/ui/Button'
import { FormField } from '../../../components/ui/FormField'
import { createFormConfig } from '../../../lib/form-utils'
import { OrgDetailsSchema, type OrgDetailsData } from '../schemas'

const TEAM_SIZE_PRICES: Record<string, string> = {
  '1-5': '€29/mese',
  '6-10': '€49/mese',
  '11-20': '€89/mese',
  '21-50': '€149/mese',
  '51-100': '€449/mese',
  '250+': 'Custom',
}

function priceForTeamSize(teamSize: string): string {
  return TEAM_SIZE_PRICES[teamSize] ?? 'Contattaci'
}

const fieldClasses =
  'w-full rounded-full border border-gray-200 bg-white px-5 py-3 text-base outline-none focus:border-gray-400'

interface OrgDetailsStepProps {
  onBack: () => void
  onNext: () => void
}

/** Step 11 — collects the organisation's name, team size and description. */
export function OrgDetailsStep({ onBack, onNext }: OrgDetailsStepProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OrgDetailsData>(
    createFormConfig(OrgDetailsSchema, {
      defaultValues: { companyName: '', teamSize: '1-5', description: '' },
    }),
  )

  const teamSize = watch('teamSize')

  return (
    <form
      className="relative flex h-full flex-col"
      onSubmit={handleSubmit(() => onNext())}
    >
      {/* Two-column content: fills all available height */}
      <div className="flex flex-1 min-h-0 flex-col gap-6 md:flex-row md:items-stretch md:gap-[5%]">
        {/* Left: Logo — square box, width = available height via calc */}
        <div
          className="hidden md:flex md:flex-col md:gap-2 md:flex-shrink-0"
          style={{ width: 'calc(65vh - 8.5rem)' }}
        >
          <span className="text-lg font-bold text-black">Logo</span>
          <div className="flex-1 min-h-0 w-full rounded-2xl border border-black/20 flex items-center justify-center">
            <span className="text-lg font-bold text-gray-800">{t('logo_placeholder')}</span>
          </div>
        </div>

        {/* Right: Form fields — takes remaining width */}
        <div className="flex-1 min-w-0 flex flex-col justify-center space-y-5">
          <FormField
            name="companyName"
            label="company_name"
            error={errors.companyName?.message}
            unstyled
          >
            <input
              className={fieldClasses}
              aria-describedby={errors.companyName ? 'companyName-error' : undefined}
              aria-invalid={!!errors.companyName}
              id="companyName"
              placeholder="Company Srl"
              {...register('companyName')}
            />
          </FormField>

          <FormField name="teamSize" label="team_size" error={errors.teamSize?.message} unstyled>
            <div className="flex items-center rounded-full border border-gray-200 bg-white overflow-hidden">
              <select
                className="flex-1 bg-transparent px-5 py-3 text-base outline-none border-none appearance-none"
                aria-describedby={errors.teamSize ? 'teamSize-error' : undefined}
                aria-invalid={!!errors.teamSize}
                id="teamSize"
                {...register('teamSize')}
              >
                <option value="1-5">1-5 persone</option>
                <option value="6-10">6-10 persone</option>
                <option value="11-20">11-20 persone</option>
              </select>
              <span className="flex items-center gap-1 px-5 py-3 text-base font-bold text-black whitespace-nowrap">
                {priceForTeamSize(teamSize)}
                <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none"><path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </span>
            </div>
          </FormField>

          <FormField
            name="description"
            label="description"
            error={errors.description?.message}
            unstyled
          >
            <textarea
              className="w-full rounded-3xl border border-gray-200 bg-white px-5 py-4 text-base outline-none focus:border-gray-400 min-h-[100px] resize-none"
              aria-describedby={errors.description ? 'description-error' : undefined}
              aria-invalid={!!errors.description}
              id="description"
              placeholder={t('description')}
              {...register('description')}
            />
          </FormField>
        </div>
      </div>

      {/* Procedi button — absolute bottom-right so it doesn't eat content height */}
      <Button className="absolute bottom-0 right-0 rounded-3xl px-8 py-3 text-lg" type="submit" variant="primary">
        {t('proceed')}
      </Button>
    </form>
  )
}
