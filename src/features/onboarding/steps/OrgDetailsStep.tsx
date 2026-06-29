import { Button } from '../../../components/ui/Button'
import type { OnboardingForm, OrgType } from '../types'

interface OrgDetailsStepProps {
  /** The organisation type chosen in step 1. */
  orgType: OrgType | null
  /** Current form values. */
  values: OnboardingForm
  /** Patch one or more form fields. */
  onChange: (patch: Partial<OnboardingForm>) => void
  /** Return to step 1. */
  onBack: () => void
}

const fieldClasses =
  'w-full rounded-[8px] border border-solid border-[#ddd] bg-[yellow] px-[14px] py-[10px] text-[16px]'

/**
 * Step 2 — collects the organisation/freelancer details. The employee-count
 * field is only shown for companies.
 */
export function OrgDetailsStep({ orgType, values, onChange, onBack }: OrgDetailsStepProps) {
  const isCompany = orgType === 'Azienda'

  return (
    <section className="animate-fade-in flex min-h-[460px] flex-col rounded-[20px] bg-white p-[40px] shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
      <header className="mb-[36px] flex items-center justify-start gap-[30px] text-[11px] font-medium text-[purple]">
        <span>Organizzazione /Dettagli </span>
        <div>
          <span className="text-[13px] font-semibold tracking-[0.3px]">Flowlee</span>
        </div>
        <span className="tracking-[1px]">Andrea ::</span>
      </header>

      <div className="flex items-start gap-[40px]">
        <div className="shrink-0 grow-0 basis-[200px]">
          <div>
            <svg className="company-logo" width="120" height="50">
              <use href="/icons.svg#icons" />
            </svg>
            <span className="text-[10px] font-extrabold tracking-[2px]">
              {isCompany ? 'Azienda' : 'PROFESSIONISTA'}
            </span>
          </div>
        </div>

        {/* Form input on the right */}
        <div className="flex-1">
          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-[16px]">
            <div className="mb-[20px] flex flex-col gap-[6px]">
              <label
                htmlFor="companyName"
                className="mb-[8px] text-[12px] font-medium text-[#4b5563]"
              >
                {isCompany ? "Nome dell'azienda" : 'Nome e cognome'}
              </label>
              <input
                type="text"
                id="companyName"
                className={fieldClasses}
                value={values.companyName}
                onChange={(e) => onChange({ companyName: e.target.value })}
              />
            </div>

            {/* Team size is only relevant for companies */}
            {isCompany && (
              <div className="mb-[20px] flex flex-col gap-[6px]">
                <label
                  htmlFor="teamSize"
                  className="mb-[8px] text-[12px] font-medium text-[#4b5563]"
                >
                  Numero dipendenti
                </label>
                <div>
                  <select
                    id="teamSize"
                    className={fieldClasses}
                    value={values.teamSize}
                    onChange={(e) => onChange({ teamSize: e.target.value })}
                  >
                    <option value="1-10">1-10 persone</option>
                    <option value="11-30">11-30 persone</option>
                    <option value="30-50">30-55s persone</option>
                  </select>
                </div>
              </div>
            )}

            <div className="mb-[20px] flex flex-col gap-[6px]">
              <label
                htmlFor="description"
                className="mb-[8px] text-[12px] font-medium text-[#4b5563]"
              >
                Di cosa ti occupi??
              </label>
              <textarea
                id="description"
                rows={4}
                className={`${fieldClasses} resize-none leading-[24px]`}
                value={values.description}
                onChange={(e) => onChange({ description: e.target.value })}
              />
            </div>

            <div className="mt-[10px] flex items-center justify-between gap-[15px]">
              <Button variant="light" type="button" onClick={onBack}>
                Torna Indietro
              </Button>
              <Button variant="dark" type="submit">
                Salva e Continua
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
