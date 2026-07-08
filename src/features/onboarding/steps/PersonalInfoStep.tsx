import { FlowleeLogo } from '../components/FlowleeLogo'

interface PersonalInfoStepProps {
  onNext: () => void
}

/** Step 1 — collects the user's basic personal details. */
export function PersonalInfoStep({ onNext }: PersonalInfoStepProps) {
  return (
    <div className="container-sfondo">
      <div className="Step">
        <div className="logo">
          <FlowleeLogo />
          <h1 className="section-title">
            Benvenuto!
            <br />
            Raccontaci chi sei.
          </h1>
          <div className="input-group">
            <label>Nome</label>
            <input type="text" placeholder="Nome" />
          </div>
          <div className="input-group">
            <label>Cognome</label>
            <input type="text" placeholder="Cognome" />
          </div>
          <div className="input-group">
            <label>Genere</label>
            <select>
              <option>Maschile</option>
              <option>Femminile</option>
            </select>
          </div>
          <div className="input-group">
            <label>Data di nascita</label>
            <input type="text" placeholder="01/01/1999" />
          </div>
          <button className="de" onClick={onNext}>
            Successivo
          </button>
        </div>
      </div>
    </div>
  )
}
