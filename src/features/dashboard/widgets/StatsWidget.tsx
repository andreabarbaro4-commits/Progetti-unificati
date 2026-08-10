import { useQuery } from '@tanstack/react-query';
import { Card } from '../../../components/ui/Card';
import { apiClient } from '../../../lib/api-client';
import type { Project } from '../../../mock/fixtures/types';

const PROJECTS_QUERY_KEY = ['projects'] as const;

/**
 * StatsWidget — the Dashboard KPI widget (Requirement 12.2).
 *
 * Displays:
 * - Active project count (projects with status !== 'completed')
 * - Rounded average completion percentage across all projects
 */
export default function StatsWidget() {
  const { data, isLoading, isError } = useQuery({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: () => apiClient.get<Project[]>('/projects'),
  });

  const projects = data ?? [];
  const activeProjects = projects.filter((p) => p.status !== 'completed');
  const avgCompletion =
    projects.length > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length)
      : 0;

  return (
    <Card size="sm" className="max-w-none w-full items-stretch gap-4 p-4">
      <h3 className="text-sm font-semibold text-gray-800">Project Stats</h3>

      {isLoading && <p className="text-xs text-gray-400">Loading stats…</p>}

      {isError && (
        <p role="alert" className="text-xs text-red-600">
          Couldn't load project stats.
        </p>
      )}

      {!isLoading && !isError && (
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-gray-900">{activeProjects.length}</span>
            <span className="text-xs text-gray-500">Active Projects</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold text-gray-900">{avgCompletion}%</span>
            <span className="text-xs text-gray-500">Avg Completion</span>
          </div>
        </div>
      )}
    </Card>
  );
}
