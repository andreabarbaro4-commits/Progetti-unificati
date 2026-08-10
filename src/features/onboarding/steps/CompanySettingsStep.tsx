import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { cn } from '../../../lib/utils'
import { Button } from '../../../components/ui/Button'
import { FormField } from '../../../components/ui/FormField'
import { createFormConfig } from '../../../lib/form-utils'
import { CompanySettingsSchema, type CompanySettingsData } from '../schemas'

interface CompanySettingsStepProps {
  onSave: () => void
}

/** Step 12 — company settings modal shown after onboarding completes. */
export function CompanySettingsStep({ onSave }: CompanySettingsStepProps) {
  const { t } = useTranslation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanySettingsData>(createFormConfig(CompanySettingsSchema))

  return (
    <div className="flex flex-col gap-6 w-full">
      <h2 className="text-xl font-bold text-black m-0">
        {t('company_settings')}
      </h2>

      <div className="flex flex-col gap-6 md:grid md:grid-cols-[220px_180px_1fr] md:gap-10">
        {/* Sidebar */}
        <div className="flex flex-col gap-2">
          {(['sidebar_details', 'sidebar_admins', 'sidebar_contacts', 'sidebar_billing', 'sidebar_work_model'] as const).map((key, index) => (
            <button
              key={key}
              className={cn(
                'p-3 rounded-[10px] text-left text-sm cursor-pointer',
                index === 0
                  ? 'bg-black text-white border-none'
                  : 'bg-transparent text-inherit border border-gray-200'
              )}
              type="button"
            >
              {t(key)}
            </button>
          ))}
        </div>

        {/* Logo box */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold text-black">
            {t('logo_placeholder')}
          </span>
          <div className="w-[180px] h-[180px] border border-gray-200 rounded-3xl flex items-center justify-center bg-neutral-50">
            <span className="text-sm font-bold text-gray-300">
              {t('logo_placeholder')}
            </span>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(() => onSave())}
          className="flex flex-col gap-4"
        >
          <FormField
            name="companyName"
            label="company_name"
            error={errors.companyName?.message}
          >
            <input
              className="w-full p-3 rounded-[10px]"
              aria-describedby={errors.companyName ? 'companyName-error' : undefined}
              aria-invalid={!!errors.companyName}
              id="companyName"
              placeholder="Company Srl"
              {...register('companyName')}
            />
          </FormField>

          <FormField name="teamSize" label="team_size" error={errors.teamSize?.message}>
            <div className="flex gap-2.5 items-end">
              <select
                className="w-full h-12 px-3 rounded-[10px] box-border"
                aria-describedby={errors.teamSize ? 'teamSize-error' : undefined}
                aria-invalid={!!errors.teamSize}
                id="teamSize"
                {...register('teamSize')}
              >
                <option value="30-50">30-50 persone</option>
              </select>
              <div className="w-[120px] h-12 flex items-center justify-center border border-gray-200 rounded-[10px] bg-neutral-50 text-sm box-border">
                €200/mese
              </div>
            </div>
          </FormField>

          <FormField
            name="description"
            label="description"
            error={errors.description?.message}
          >
            <input
              className="w-full p-3 rounded-[10px]"
              aria-describedby={errors.description ? 'description-error' : undefined}
              aria-invalid={!!errors.description}
              id="description"
              placeholder="Company Srl"
              type="text"
              {...register('description')}
            />
          </FormField>

          <div className="flex justify-end">
            <Button
              className="rounded-[10px] px-5 py-2.5"
              size="sm"
              type="submit"
              variant="primary"
            >
              {t('save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
