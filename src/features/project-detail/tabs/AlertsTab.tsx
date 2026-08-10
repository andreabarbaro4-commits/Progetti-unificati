import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HiOutlineBellAlert, HiOutlineClock, HiOutlineDocumentText } from 'react-icons/hi2'
import { apiClient } from '../../../lib/api-client'
import type { Alert, AlertType } from '../../../mock/fixtures/types'

export interface AlertsTabProps {
  projectId: string
}

const ALERT_TYPE_ICON: Record<AlertType, typeof HiOutlineBellAlert> = {
  overload: HiOutlineBellAlert,
  delay: HiOutlineClock,
  outdated_document: HiOutlineDocumentText,
}

const ALERT_TYPE_COLOR: Record<AlertType, string> = {
  overload: 'text-red-500',
  delay: 'text-amber-500',
  outdated_document: 'text-blue-500',
}

/**
 * Stable comparison for alerts: sort by triggeredAt descending (most recent first),
 * break ties by id for determinism (Req 26.1).
 */
function compareAlerts(a: Alert, b: Alert): number {
  const timeDiff = new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime()
  if (timeDiff !== 0) return timeDiff
  return a.id.localeCompare(b.id)
}

function formatTriggeredAt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * Project Detail — Alerts Tab (Req 26.1–26.5)
 *
 * Renders project alerts in stable order (most-recent first, tie-broken by id),
 * each with a per-type icon, non-empty description, and scrollable container.
 * Shows an empty-state message when there are no alerts.
 */
export function AlertsTab({ projectId }: AlertsTabProps) {
  const { data: allAlerts = [], isLoading } = useQuery<Alert[]>({
    queryKey: ['alerts'],
    queryFn: () => apiClient.get<Alert[]>('/alerts'),
  })

  const projectAlerts = useMemo(
    () =>
      allAlerts
        .filter((a) => a.projectId === projectId)
        .sort(compareAlerts),
    [allAlerts, projectId],
  )

  if (isLoading) {
    return <p className="p-4 text-sm text-gray-400">Loading alerts…</p>
  }

  if (projectAlerts.length === 0) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
        No alerts for this project.
      </div>
    )
  }

  return (
    <div className="max-h-[32rem] overflow-y-auto">
      <ul className="flex flex-col gap-3">
        {projectAlerts.map((alert) => {
          const Icon = ALERT_TYPE_ICON[alert.type]
          const iconColor = ALERT_TYPE_COLOR[alert.type]

          return (
            <li
              key={alert.id}
              className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-[0px_2px_12px_0px_rgba(0,0,0,0.04)]"
            >
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColor}`} />
              <div className="flex flex-1 flex-col gap-1">
                <span className="text-sm font-medium text-gray-800">{alert.message}</span>
                <span className="text-xs text-gray-400">{formatTriggeredAt(alert.triggeredAt)}</span>
              </div>
              {alert.dismissed && (
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  Dismissed
                </span>
              )}
              {alert.resolved && (
                <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  Resolved
                </span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
