import { FaSearch } from 'react-icons/fa'

const ROLES = [
  'Project Manager',
  'Ux Designer',
  'UI Designer',
  'Hr Manager',
  'Troll',
  'Data Analyst',
  'Dog Sitter',
]

interface RoleTagListProps {
  selectedRole: string | null
  onSelectRole: (role: string) => void
}

/** Search box + selectable role tags, shared by the role and job steps. */
export function RoleTagList({ selectedRole, onSelectRole }: RoleTagListProps) {
  return (
    <>
      <div className="search-container">
        <span className="search-icon">
          <FaSearch />
        </span>
        <input type="text" placeholder="Cerca un ruolo" className="search-input" />
      </div>

      <div className="ruoli-container">
        {ROLES.map((role) => (
          <button
            key={role}
            type="button"
            className={`ruolo-tag ${selectedRole === role ? 'active' : ''}`}
            onClick={() => onSelectRole(role)}
          >
            {role}
          </button>
        ))}
      </div>
    </>
  )
}
