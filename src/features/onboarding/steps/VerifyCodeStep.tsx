import { FlowleeLogo } from '../components/FlowleeLogo'

interface VerifyCodeStepProps {
  onNext: () => void
}

/** Step 4 — the user enters the verification code sent by email. */
export function VerifyCodeStep({ onNext }: VerifyCodeStepProps) {
  return (
    <div className="container-sfondo">
      <div className="Step">
        <div className="logo">
          <FlowleeLogo />
          <h1 className="section-title">
            Inserisci il codice
            <br />
            che trovi sulla mail!
          </h1>
          <p style={{ marginBottom: '20px', color: '#666', fontSize: '14px' }}>
            mariorossi@gmail.com
          </p>
          <div className="input-group">
            <label>Codice</label>
            <input type="text" placeholder="Inserisci codice" />
          </div>
          <button className="WE">Invia di nuovo</button>
          <button className="era" onClick={onNext}>
            Conferma
          </button>
        </div>
      </div>
    </div>
  )
}
