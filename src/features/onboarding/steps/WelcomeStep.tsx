import avatar3 from '../../../assets/avatar3.png'

interface WelcomeStepProps {
  onNext: () => void
}

/** Step 5 — welcomes the verified user before starting the profile setup. */
export function WelcomeStep({ onNext }: WelcomeStepProps) {
  return (
    <div className="Step">
      <img src={avatar3} alt="avatar3" className="avatar3" />
      <div>
        <h1 className="section-title">
          Piacere Flowlee! <br />
          Benvenuto. Creiamo il tuo profilo?
        </h1>
      </div>
      <div className="hey">
        <button className="wr" onClick={onNext}>
          Crea profilo
        </button>
      </div>
    </div>
  )
}
