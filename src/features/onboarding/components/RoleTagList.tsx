import { FaSearch } from 'react-icons/fa'
import { Badge } from '../../../components/ui/Badge'

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
      <div className="relative my-2.5">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30">
          <FaSearch />
        </span>
        <input
          className="w-full pl-10 pr-4 py-3 bg-[#f1f1f9] rounded-lg border-none text-[16px] outline-none placeholder:text-black/30"
          placeholder="Cerca un ruolo"
          type="text"
        />
      </div>

      <div className="flex flex-wrap gap-2 my-2.5">
        {ROLES.map((role) => (
          <Badge
            key={role}
            variant={selectedRole === role ? 'active' : 'default'}
            onClick={() => onSelectRole(role)}
          >
            {role}
          </Badge>
        ))}
      </div>
    </>
  )
}
