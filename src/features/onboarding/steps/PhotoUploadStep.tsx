import avatar3 from '../../../assets/avatar3.png'
import profilo from '../../../assets/profilo.png'
import { TopNavigation } from '../components/TopNavigation'

const QUICK_ROLE_TAGS = ['Project manager', 'Hr Manager', 'Dog Sitter']

interface PhotoUploadStepProps {
  /** Whether a photo has already been uploaded. */
  hasPhoto: boolean
  onNext: () => void
}

/** Steps 8 & 9 — upload a profile photo, then confirm it. */
export function PhotoUploadStep({ hasPhoto, onNext }: PhotoUploadStepProps) {
  return (
    <div className="Step step-header-layout">
      <TopNavigation leftLabel="Profilo/Foto" />

      <div className="we">
        <h1 className="section-title">Carica una foto!</h1>

        <div className="profile-upload-container">
          <div className="profile-circle">
            {hasPhoto ? (
              <img src={profilo} alt="Profilo" className="profile-img" />
            ) : (
              <span>+</span>
            )}
          </div>
        </div>

        <div className="nome">
          <h1>Mario Rossi</h1>
          <span className="VE">@mariorossi@gmail.com</span>
        </div>

        <div className="button-container">
          {QUICK_ROLE_TAGS.map((tag) => (
            <button key={tag} type="button" className="step">
              {tag}
            </button>
          ))}
        </div>
        <img src={avatar3} alt="avatar" className="avatar-decorativo" />

        <div className="rt">
          <button className={hasPhoto ? 'qa' : 'qa btn-bianco'} onClick={onNext}>
            Inizia
          </button>
        </div>
      </div>
    </div>
  )
}
