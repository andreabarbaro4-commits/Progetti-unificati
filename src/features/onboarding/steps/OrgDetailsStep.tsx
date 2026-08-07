import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { TopNavigation } from '../components/TopNavigation'
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
  'w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-600'

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
    <div className="container-sfondo">
      <div className="Step step-header-layout step10-layout">
        <TopNavigation leftLabel={`${t('organization')} / 2`} onBack={onBack} />

        <div
          className="step10-content"
          style={{ display: 'flex', gap: '40px', alignItems: 'center', justifyContent: 'center' }}
        >
          <div className="step10-right" style={{ flex: '1', maxWidth: '300px' }}>
            <div className="flex aspect-square w-full flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white shadow-sm">
              <span className="text-lg font-bold text-gray-800">{t('logo_placeholder')}</span>
            </div>
          </div>
          <div className="step10-left" style={{ flex: '1', maxWidth: '400px' }}>
            <form onSubmit={handleSubmit(() => onNext())}>
              <div className="space-y-4">
                <FormField
                  name="companyName"
                  label="company_name"
                  error={errors.companyName?.message}
                >
                  <input
                    id="companyName"
                    className={fieldClasses}
                    placeholder="Company Srl"
                    aria-invalid={!!errors.companyName}
                    aria-describedby={errors.companyName ? 'companyName-error' : undefined}
                    {...register('companyName')}
                  />
                </FormField>
                <FormField name="teamSize" label="team_size" error={errors.teamSize?.message}>
                  <div className="flex gap-2">
                    <select
                      id="teamSize"
                      className={fieldClasses}
                      aria-invalid={!!errors.teamSize}
                      aria-describedby={errors.teamSize ? 'teamSize-error' : undefined}
                      {...register('teamSize')}
                    >
                      <option value="1-5">1-5 persone</option>
                      <option value="6-10">6-10 persone</option>
                      <option value="11-20">11-20 persone</option>
                    </select>
                    <div className="flex min-w-[100px] items-center justify-center rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium whitespace-nowrap text-gray-700">
                      {priceForTeamSize(teamSize)}
                    </div>
                  </div>
                </FormField>
                <FormField
                  name="description"
                  label="description"
                  error={errors.description?.message}
                >
                  <div className="flex items-end gap-4">
                    <textarea
                      id="description"
                      className={`${fieldClasses} h-24`}
                      placeholder={t('description')}
                      aria-invalid={!!errors.description}
                      aria-describedby={errors.description ? 'description-error' : undefined}
                      {...register('description')}
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-black px-8 py-3 text-sm font-medium whitespace-nowrap text-white"
                    >
                      {t('proceed')}
                    </button>
                  </div>
                </FormField>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
