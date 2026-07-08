import { FlowleeLogo } from '../components/FlowleeLogo'

interface AccountStepProps {
  onNext: () => void
}

/** Step 2 — collects the email/password for the new account. */
export function AccountStep({ onNext }: AccountStepProps) {
  return (
    <div className="container-sfondo">
      <div className="Step">
        <div className="logo">
          <FlowleeLogo />
        </div>

        {/* Contenitore che gestisce il layout flessibile */}
        <div className="Step-inner-container">
          <h1 className="section-title">
            Ciao Marco!
            <br />
            Creiamo l'account.
          </h1>
          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="Email" />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Password" />
          </div>
          <div className="input-group">
            <label>Conferma password</label>
            <input type="password" placeholder="Conferma password" />
          </div>

          {/* Il margin-top: auto del CSS lo spingerà in fondo */}
          <button className="de" onClick={onNext}>
            Successivo
          </button>
        </div>
      </div>
    </div>
  )
}
