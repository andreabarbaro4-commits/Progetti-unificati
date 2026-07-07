import avatar from '../../../assets/avatar.png'
import { FlowleeLogo } from '../components/FlowleeLogo'

interface SendingCodeStepProps {
  onNext: () => void
}

/** Step 3 — informs the user that a verification code is on its way. */
export function SendingCodeStep({ onNext }: SendingCodeStepProps) {
  return (
    <div className="container-sfondo">
      <div className="Step">
        <div className="logo">
          <FlowleeLogo />
          <img src={avatar} alt="avatar" className="avatar" />
          <h1 className="section-title">
            Sto inviando <br /> il codice di verifica.
          </h1>
          <button className="de" onClick={onNext}>
            Successivo
          </button>
        </div>
      </div>
    </div>
  )
}
