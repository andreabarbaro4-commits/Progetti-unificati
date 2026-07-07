import { useState } from 'react'
import { TopNavigation } from '../components/TopNavigation'

interface OrgDetails {
  companyName: string
  teamSize: string
  description: string
}

const INITIAL_DETAILS: OrgDetails = {
  companyName: '',
  teamSize: '1-5',
  description: '',
}

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
  const [details, setDetails] = useState<OrgDetails>(INITIAL_DETAILS)

  const onChange = (patch: Partial<OrgDetails>) => {
    setDetails((current) => ({ ...current, ...patch }))
  }

  return (
    <div className="container-sfondo">
      <div className="Step step-header-layout step10-layout">
        <TopNavigation leftLabel="Organizzazione / 2" onBack={onBack} />

        <div
          className="step10-content"
          style={{ display: 'flex', gap: '40px', alignItems: 'center', justifyContent: 'center' }}
        >
          <div className="step10-right" style={{ flex: '1', maxWidth: '300px' }}>
            <div className="flex aspect-square w-full flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white shadow-sm">
              <span className="text-lg font-bold text-gray-800">LOGO</span>
            </div>
          </div>
          <div className="step10-left" style={{ flex: '1', maxWidth: '400px' }}>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Nome dell'azienda
                </label>
                <input
                  className={fieldClasses}
                  placeholder="Company Srl"
                  value={details.companyName}
                  onChange={(e) => onChange({ companyName: e.target.value })}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Grandezza team
                </label>
                <div className="flex gap-2">
                  <select
                    className={fieldClasses}
                    value={details.teamSize}
                    onChange={(e) => onChange({ teamSize: e.target.value })}
                  >
                    <option value="1-5">1-5 persone</option>
                    <option value="6-10">6-10 persone</option>
                    <option value="11-20">11-20 persone</option>
                  </select>
                  <div className="flex min-w-[100px] items-center justify-center rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm font-medium whitespace-nowrap text-gray-700">
                    {priceForTeamSize(details.teamSize)}
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Descrizione</label>
                <div className="flex items-end gap-4">
                  <textarea
                    className={`${fieldClasses} h-24`}
                    placeholder="Descrivi l'azienda..."
                    value={details.description}
                    onChange={(e) => onChange({ description: e.target.value })}
                  />
                  <button
                    className="rounded-xl bg-black px-8 py-3 text-sm font-medium whitespace-nowrap text-white"
                    onClick={onNext}
                  >
                    Procedi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
