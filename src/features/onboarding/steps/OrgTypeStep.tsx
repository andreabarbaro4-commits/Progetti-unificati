import omino from '../../../assets/omino.png'
import { Button } from '../../../components/ui/Button'
import { TopNavigation } from '../components/TopNavigation'

interface OrgTypeStepProps {
  onNext: () => void
}

/** Step 10 — asks whether the user works with a company or as a freelancer. */
export function OrgTypeStep({ onNext }: OrgTypeStepProps) {
  return (
    <div className="container-sfondo">
      <div className="Step step-header-layout step10-layout">
        <TopNavigation leftLabel="Organizzazione" />

        <div className="step10-content">
          <div className="step10-left">
            <h1 className="section-title">
              Iniziamo dalle basi.
              <br />
              Lavori con un'azienda
              <br />o sei un freelance?
            </h1>
            <p className="step10-subtitle">Abbiamo soluzioni diverse per te.</p>
            <div className="step10-buttons">
              <Button variant="dark" onClick={onNext}>
                Company
              </Button>
              <Button variant="light" onClick={onNext}>
                Freelance
              </Button>
            </div>
          </div>
          <div className="step10-right">
            <img src={omino} alt="Flowlee" className="step10-image" />
          </div>
        </div>
      </div>
    </div>
  )
}
