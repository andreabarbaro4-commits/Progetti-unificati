import { useQuery } from '@tanstack/react-query';
import { HiOutlineFlag } from 'react-icons/hi2';
import { Card } from '../../../components/ui/Card';
import { apiClient } from '../../../lib/api-client';
import { selectTopN } from '../../../lib/topN';
import type { Milestone } from '../../../mock/fixtures/types';

/**
 * MilestonesWeekWidget — the "weekly milestones" Dashboard Widget
 * (Requirement 12.1).
 *
 * Shows up to 10 milestones due within the current calendar week, soonest
 * date first, via the shared `selectTopN` template (design doc "Property
 * 10: Capped top-N selection by criterion"). `selectTopN` sorts
 * descending by its criterion, so the date timestamp is negated to turn
 * "soonest first" into a descending sort.
 *
 * Week boundary choice: the "current calendar week" is defined here as
 * the Monday-through-Sunday range containing today (device local time),
 * inclusive of both endpoints — matching the Mon-Fri business-week
 * convention used elsewhere in this integration (Timeline_Week_View,
 * Requirement 10) while still covering weekend-dated milestones rather
 * than silently excluding them.
 */

const MILESTONES_QUERY_KEY = ['milestones'] as const;
const CAP = 10;

/**
 * Returns the [start, end] Date pair (inclusive, local midnight-to-midnight)
 * for the Monday-Sunday week containing `today`.
 */
function getCurrentWeekRange(today: Date): [Date, Date] {
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  // Days to subtract to reach the Monday of this week (Sunday wraps back 6 days).
  const daysSinceMonday = (dayOfWeek + 6) % 7;

  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - daysSinceMonday);
  const sunday = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + 6, 23, 59, 59, 999);

  return [monday, sunday];
}

function isWithinRange(iso: string, [start, end]: [Date, Date]): boolean {
  const time = new Date(iso).getTime();
  return time >= start.getTime() && time <= end.getTime();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function MilestonesWeekWidget() {
  const { data, isLoading, isError } = useQuery({
    queryKey: MILESTONES_QUERY_KEY,
    queryFn: () => apiClient.get<Milestone[]>('/milestones'),
  });

  const weekRange = getCurrentWeekRange(new Date());
  const weekMilestones = (data ?? []).filter((milestone) => isWithinRange(milestone.date, weekRange));
  const topMilestones = selectTopN(weekMilestones, (milestone) => -new Date(milestone.date).getTime(), CAP);

  return (
    <Card size="sm" className="max-w-none w-full items-stretch gap-3 p-4">
      <div className="flex w-full items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">This Week's Milestones</h3>
      </div>

      {isLoading && <p className="text-xs text-gray-400">Loading milestones…</p>}

      {isError && (
        <p role="alert" className="text-xs text-red-600">
          Couldn't load milestones.
        </p>
      )}

      {!isLoading && !isError && topMilestones.length === 0 && (
        <p className="text-xs text-gray-400">No milestones due this week.</p>
      )}

      {!isLoading && !isError && topMilestones.length > 0 && (
        <ul className="grid w-full grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
          {topMilestones.map((milestone) => (
            <li key={milestone.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <HiOutlineFlag className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="flex-1 truncate text-sm text-gray-800">{milestone.name}</span>
              <span className="shrink-0 text-xs text-gray-400">{formatDate(milestone.date)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
