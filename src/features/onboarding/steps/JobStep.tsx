import avatar3 from '../../../assets/avatar3.png'
import { TopNavigation } from '../components/TopNavigation'
import { RoleTagList } from '../components/RoleTagList'

interface JobStepProps {
  selectedRole: string | null
  onSelectRole: (role: string) => void
  onNext: () => void
}

/** Step 7 — asks what job the user does. */
export function JobStep({ selectedRole, onSelectRole, onNext }: JobStepProps) {
  return (
    <div className="Step step-header-layout">
      <TopNavigation leftLabel="Profilo/Lavoro" />

      <h1 className="section-title">Che lavoro fai?</h1>

      <RoleTagList selectedRole={selectedRole} onSelectRole={onSelectRole} />

      <img src={avatar3} alt="avatar" className="avatar-decorativo" />

      <button className="tr" onClick={onNext}>
        Procedi
      </button>
    </div>
  )
}
