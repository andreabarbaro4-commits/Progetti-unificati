import { Button } from '../../../components/ui/Button'
import omino from '../../../assets/omino.png'
import type { OrgType } from '../types'

interface OrgTypeStepProps {
  /** Called when the user picks how they work. */
  onSelectType: (type: OrgType) => void
}

/**
 * Step 1 — asks whether the user works with a company or as a freelancer.
 */
export function OrgTypeStep({ onSelectType }: OrgTypeStepProps) {
  return (
    <section className="animate-fade-in flex min-h-[460px] flex-col rounded-[20px] bg-white p-[40px] shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
      <header className="mb-[36px] flex items-center justify-start gap-[30px] text-[11px] font-medium text-[purple]">
        <span>Organizzazione/con chi lavori? </span>
        <div>
          <span>Flowlee</span>
        </div>
        <span className="tracking-[1px]">Andrea ::</span>
      </header>

      <div className="flex items-center gap-[40px]">
        <div className="flex-1">
          <h1 className="mb-[100px] ml-[10px] bg-white text-[28px] leading-[42px] font-bold tracking-[-0.5px] text-black">
            Iniziamo dalle basi. <br />
            Lavori con un'azienda
            <br />o sei un freelance?
          </h1>

          <div className="mt-[5px] ml-[10px] text-[red]">
            <header>Abbiamo soluzioni diverse per te.</header>
          </div>

          <br />

          {/* Selection buttons */}
          <div>
            <Button variant="dark" onClick={() => onSelectType('Azienda')}>
              Azienda
            </Button>
            <Button variant="light" onClick={() => onSelectType('professionista')}>
              Lavoro da solo
            </Button>
          </div>
        </div>

        <div className="flex [flex:0.8] items-center justify-center">
          <div>
            <img
              src={omino}
              alt="Flowlee Illustration"
              className="h-auto max-w-[220px] object-contain"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
