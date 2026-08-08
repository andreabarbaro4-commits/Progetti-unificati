import { TopNavigation } from '../components/TopNavigation'
import { RoleTagList } from '../components/RoleTagList'

interface RoleStepProps {
  selectedRole: string | null
  onSelectRole: (role: string) => void
  onNext: () => void
}

/** Step 6 — asks the user what their role is. */
export function RoleStep({ selectedRole, onSelectRole, onNext }: RoleStepProps) {
  return (
    <div className="Step step-header-layout">
      <TopNavigation />

      <h1 className="section-title">
        Benvenuto!
        <br />
        Raccontaci chi sei
      </h1>

      <RoleTagList selectedRole={selectedRole} onSelectRole={onSelectRole} />

      <button className="procedi-btn" disabled={!selectedRole} onClick={onNext}>
        Procedi
      </button>
    </div>
  )
}
