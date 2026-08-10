import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { apiClient } from '../../../lib/api-client'
import { isTabActive } from '../../../lib/tabs'
import type { Economics, InvoiceStatus } from '../../../mock/fixtures/types'

export interface EconomicsTabProps {
  projectId: string
}

const CATEGORY_COLORS: Record<string, string> = {
  Labor: '#6366f1',
  Software: '#f59e0b',
  Infrastructure: '#10b981',
  Other: '#94a3b8',
}

const INVOICE_STATUS_CHIP: Record<InvoiceStatus, { bg: string; text: string; label: string }> = {
  paid: { bg: 'bg-green-100', text: 'text-green-700', label: 'Paid' },
  pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Pending' },
  overdue: { bg: 'bg-red-100', text: 'text-red-700', label: 'Overdue' },
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(amount)
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

type SubTab = 'variance' | 'invoices' | 'cost-items' | 'hours'

const SUB_TABS: { key: SubTab; label: string }[] = [
  { key: 'variance', label: 'Budget Variance' },
  { key: 'invoices', label: 'Invoices' },
  { key: 'cost-items', label: 'Cost Items' },
  { key: 'hours', label: 'Hours' },
]

/**
 * Project Detail — Economics Tab (Req 27.1–27.7)
 *
 * Left column: Budget summary card + cost-by-category donut chart (recharts).
 * Right column: Sub-tab switcher (budget variance default, invoices, cost items, hours).
 * Empty states and error/retry for failed data load.
 */
export function EconomicsTab({ projectId }: EconomicsTabProps) {
  const [selectedSubTab, setSelectedSubTab] = useState(0)

  const { data: economics, isLoading, isError, refetch } = useQuery<Economics | null>({
    queryKey: ['project-economics', projectId],
    queryFn: () => apiClient.get<Economics | null>(`/projects/${projectId}/economics`),
  })

  if (isLoading) {
    return <p className="p-4 text-sm text-gray-400">Loading economics data…</p>
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-red-200 bg-red-50 p-8 text-center">
        <p className="text-sm text-red-600">Failed to load economics data.</p>
        <button
          type="button"
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          onClick={() => refetch()}
        >
          Retry
        </button>
      </div>
    )
  }

  if (!economics) {
    return (
      <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
        No economics data available for this project.
      </div>
    )
  }

  const variance = economics.totalBudget - economics.currentCost
  const variancePercent = economics.totalBudget > 0
    ? Math.round((variance / economics.totalBudget) * 100)
    : 0

  // Aggregate cost items by category for the donut chart
  const categoryData = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of economics.costItems) {
      const cat = item.category || 'Other'
      map.set(cat, (map.get(cat) ?? 0) + item.amount)
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [economics.costItems])

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left column: Budget summary + donut chart */}
      <div className="flex flex-col gap-4">
        {/* Budget summary card */}
        <div className="rounded-2xl bg-white p-5 shadow-[0px_2px_12px_0px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 text-sm font-semibold text-gray-800">Budget Summary</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Total Budget</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(economics.totalBudget)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Current Cost</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(economics.currentCost)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Remaining</p>
              <p className={`text-lg font-bold ${variance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {formatCurrency(variance)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Budget Used</p>
              <p className="text-lg font-bold text-gray-900">
                {economics.totalBudget > 0 ? Math.round((economics.currentCost / economics.totalBudget) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Donut chart */}
        <div className="rounded-2xl bg-white p-5 shadow-[0px_2px_12px_0px_rgba(0,0,0,0.04)]">
          <h3 className="mb-3 text-sm font-semibold text-gray-800">Cost by Category</h3>
          {categoryData.length === 0 ? (
            <p className="text-xs text-gray-400">No cost data available.</p>
          ) : (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    nameKey="name"
                    paddingAngle={2}
                  >
                    {categoryData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={CATEGORY_COLORS[entry.name] ?? CATEGORY_COLORS.Other}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 pt-2">
                {categoryData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[entry.name] ?? CATEGORY_COLORS.Other }}
                    />
                    <span className="text-xs text-gray-600">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right column: Sub-tabs */}
      <div className="flex flex-col gap-3">
        {/* Sub-tab strip */}
        <div className="flex gap-1 border-b border-gray-200" role="tablist">
          {SUB_TABS.map((tab, index) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={isTabActive(selectedSubTab, index)}
              className={`whitespace-nowrap px-3 py-2 text-xs font-medium transition-colors ${
                isTabActive(selectedSubTab, index)
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setSelectedSubTab(index)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Sub-tab panels */}
        {isTabActive(selectedSubTab, 0) && (
          <div className="rounded-2xl bg-white p-5 shadow-[0px_2px_12px_0px_rgba(0,0,0,0.04)]">
            <h4 className="mb-3 text-sm font-semibold text-gray-800">Budget Variance</h4>
            <div className="flex items-center gap-4">
              <div className={`text-2xl font-bold ${variance >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                variance >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
              }`}>
                {variancePercent >= 0 ? '+' : ''}{variancePercent}%
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {variance >= 0
                ? 'Project is under budget.'
                : 'Project has exceeded the allocated budget.'}
            </p>
          </div>
        )}

        {isTabActive(selectedSubTab, 1) && (
          <div className="max-h-80 overflow-y-auto">
            {economics.invoices.length === 0 ? (
              <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
                No invoices yet.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {economics.invoices.map((invoice) => {
                  const statusChip = INVOICE_STATUS_CHIP[invoice.status]
                  return (
                    <li key={invoice.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-[0px_1px_6px_0px_rgba(0,0,0,0.04)]">
                      <div className="flex flex-1 flex-col gap-0.5">
                        <span className="text-sm font-medium text-gray-800">{invoice.description}</span>
                        <span className="text-xs text-gray-400">{formatDate(invoice.date)}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(invoice.amount)}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusChip.bg} ${statusChip.text}`}>
                        {statusChip.label}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}

        {isTabActive(selectedSubTab, 2) && (
          <div className="max-h-80 overflow-y-auto">
            {economics.costItems.length === 0 ? (
              <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
                No cost items recorded.
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {economics.costItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-[0px_1px_6px_0px_rgba(0,0,0,0.04)]">
                    <div
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: CATEGORY_COLORS[item.category] ?? CATEGORY_COLORS.Other }}
                    />
                    <div className="flex flex-1 flex-col gap-0.5">
                      <span className="text-sm font-medium text-gray-800">{item.description}</span>
                      <span className="text-xs text-gray-400">{item.category} · {formatDate(item.date)}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {isTabActive(selectedSubTab, 3) && (
          <div className="flex min-h-32 items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">
            Hours tracking not available for this project.
          </div>
        )}
      </div>
    </div>
  )
}
