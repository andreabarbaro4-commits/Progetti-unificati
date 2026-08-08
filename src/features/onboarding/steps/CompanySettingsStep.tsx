import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >

      {/* Contenitore Modale */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          backgroundColor: '#fff',
          padding: '40px',
          borderRadius: '24px',
          width: '850px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#000', margin: 0 }}>
          {t('company_settings')}
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 180px 1fr', gap: '40px' }}>
          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              style={{
                backgroundColor: '#000',
                color: '#fff',
                border: 'none',
                padding: '12px',
                borderRadius: '10px',
                textAlign: 'left',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {t('sidebar_details')}
            </button>
            <button
              type="button"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #e5e5e5',
                padding: '12px',
                borderRadius: '10px',
                textAlign: 'left',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {t('sidebar_admins')}
            </button>
            <button
              type="button"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #e5e5e5',
                padding: '12px',
                borderRadius: '10px',
                textAlign: 'left',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {t('sidebar_contacts')}
            </button>
            <button
              type="button"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #e5e5e5',
                padding: '12px',
                borderRadius: '10px',
                textAlign: 'left',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {t('sidebar_billing')}
            </button>
            <button
              type="button"
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #e5e5e5',
                padding: '12px',
                borderRadius: '10px',
                textAlign: 'left',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              {t('sidebar_work_model')}
            </button>
          </div>

          {/* Logo box */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#000' }}>
              {t('logo_placeholder')}
            </span>
            <div
              style={{
                width: '180px',
                height: '180px',
                border: '1px solid #e5e5e5',
                borderRadius: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fafafa',
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#ccc' }}>
                {t('logo_placeholder')}
              </span>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit(() => onSave())}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            <FormField
              name="companyName"
              label="company_name"
              error={errors.companyName?.message}
            >
              <input
                id="companyName"
                style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                placeholder="Company Srl"
                aria-invalid={!!errors.companyName}
                aria-describedby={errors.companyName ? 'companyName-error' : undefined}
                {...register('companyName')}
              />
            </FormField>

            <FormField name="teamSize" label="team_size" error={errors.teamSize?.message}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                <select
                  id="teamSize"
                  style={{
                    width: '100%',
                    height: '46px',
                    padding: '0 12px',
                    borderRadius: '10px',
                    boxSizing: 'border-box',
                  }}
                  aria-invalid={!!errors.teamSize}
                  aria-describedby={errors.teamSize ? 'teamSize-error' : undefined}
                  {...register('teamSize')}
                >
                  <option value="30-50">30-50 persone</option>
                </select>
                <div
                  style={{
                    width: '120px',
                    height: '46px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid #e5e5e5',
                    borderRadius: '10px',
                    backgroundColor: '#f9f9f9',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                >
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
                id="description"
                type="text"
                style={{ width: '100%', padding: '12px', borderRadius: '10px' }}
                placeholder="Company Srl"
                aria-invalid={!!errors.description}
                aria-describedby={errors.description ? 'description-error' : undefined}
                {...register('description')}
              />
            </FormField>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                style={{
                  backgroundColor: '#000',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '10px',
                }}
              >
                {t('save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
