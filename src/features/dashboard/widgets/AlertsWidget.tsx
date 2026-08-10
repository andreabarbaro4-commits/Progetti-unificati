import { useQuery } from '@tanstack/react-query';
import { Card } from '../../../components/ui/Card';
import { apiClient } from '../../../lib/api-client';
import { selectTopN } from '../../../lib/topN';
import type { Alert } from '../../../mock/fixtures/types';

/**
 * AlertsWidget — the "active alerts" Dashboard Widget (Requirement 12.1).
 *
 * Shows the 5 most-recently-triggered alerts that are neither dismissed
 * nor resolved, using the shared `selectTopN` template (design doc
 * "Property 10: Capped top-N selection by criterion") rather than
 * reimplementing sort/slice inline.
 */

const ALERTS_QUERY_KEY = ['alerts'] as const;
const CAP = 5;

function formatTriggeredAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function AlertsWidget() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ALERTS_QUERY_KEY,
    queryFn: () => apiClient.get<Alert[]>('/alerts'),
  });

  const activeAlerts = (data ?? []).filter((alert) => !alert.dismissed && !alert.resolved);
  const topAlerts = selectTopN(activeAlerts, (alert) => new Date(alert.triggeredAt).getTime(), CAP);

  return (
    <Card size="sm" className="max-w-none w-full items-stretch gap-3 p-4">
      <div className="flex w-full items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Alerts</h3>
        <span className="text-xs text-gray-400">{activeAlerts.length}</span>
      </div>

      {isLoading && <p className="text-xs text-gray-400">Loading alerts…</p>}

      {isError && (
        <p role="alert" className="text-xs text-red-600">
          Couldn't load alerts.
        </p>
      )}

      {!isLoading && !isError && topAlerts.length === 0 && (
        <p className="text-xs text-gray-400">No active alerts.</p>
      )}

      {!isLoading && !isError && topAlerts.length > 0 && (
        <ul className="flex w-full flex-col gap-2 overflow-y-auto">
          {topAlerts.map((alert) => (
            <li key={alert.id} className="flex flex-col gap-0.5 rounded-lg bg-gray-50 px-3 py-2">
              <span className="text-sm text-gray-800">{alert.message}</span>
              <span className="text-xs text-gray-400">{formatTriggeredAt(alert.triggeredAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
