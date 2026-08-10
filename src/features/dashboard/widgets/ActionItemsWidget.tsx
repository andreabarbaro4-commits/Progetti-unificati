import { useQuery } from '@tanstack/react-query';
import { Card } from '../../../components/ui/Card';
import { PriorityChip } from '../../../components/ui/StatusChip';
import { apiClient } from '../../../lib/api-client';
import { selectTopN } from '../../../lib/topN';
import type { Task } from '../../../mock/fixtures/types';

/**
 * ActionItemsWidget — the "recommended action items" Dashboard Widget
 * (Requirement 12.1).
 *
 * Shows the 5 highest-priority tasks (`priority === 'high'`), soonest
 * deadline first, via the shared `selectTopN` template (design doc
 * "Property 10: Capped top-N selection by criterion"). `selectTopN` sorts
 * descending by its criterion, so the deadline timestamp is negated to
 * turn "soonest first" into a descending sort.
 */

const TASKS_QUERY_KEY = ['tasks'] as const;
const CAP = 5;

function formatDeadline(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function ActionItemsWidget() {
  const { data, isLoading, isError } = useQuery({
    queryKey: TASKS_QUERY_KEY,
    queryFn: () => apiClient.get<Task[]>('/tasks'),
  });

  const highPriorityTasks = (data ?? []).filter((task) => task.priority === 'high');
  const topTasks = selectTopN(highPriorityTasks, (task) => -new Date(task.deadline).getTime(), CAP);

  return (
    <Card size="sm" className="max-w-none w-full items-stretch gap-3 p-4">
      <div className="flex w-full items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Action Items</h3>
      </div>

      {isLoading && <p className="text-xs text-gray-400">Loading action items…</p>}

      {isError && (
        <p role="alert" className="text-xs text-red-600">
          Couldn't load action items.
        </p>
      )}

      {!isLoading && !isError && topTasks.length === 0 && (
        <p className="text-xs text-gray-400">No high-priority action items.</p>
      )}

      {!isLoading && !isError && topTasks.length > 0 && (
        <ul className="flex w-full flex-col gap-2 overflow-y-auto">
          {topTasks.map((task) => (
            <li key={task.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <span className="flex-1 truncate text-sm text-gray-800">{task.name}</span>
              <span className="shrink-0 text-xs text-gray-400">{formatDeadline(task.deadline)}</span>
              <PriorityChip variant={task.priority} />
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
