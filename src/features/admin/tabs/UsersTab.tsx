import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../../../lib/api-client'
import type { AuthUserProfile } from '../../../mock/fixtures/types'

/**
 * UsersTab — read-only list of mock Auth0 profiles (Req 36.11).
 * No create/edit/delete controls.
 */
export default function UsersTab() {
  const { data: users = [], isLoading } = useQuery<AuthUserProfile[]>({
    queryKey: ['admin-users'],
    queryFn: () => apiClient.get<AuthUserProfile[]>('/admin/users'),
  })

  if (isLoading) {
    return <p className="text-sm text-gray-400">Loading users…</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-xs font-semibold uppercase text-gray-500">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Admin</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-800">{user.name}</td>
              <td className="px-4 py-3 text-gray-600">{user.email}</td>
              <td className="px-4 py-3 text-gray-600">{user.role}</td>
              <td className="px-4 py-3">
                {user.isAdmin ? (
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                    Admin
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
