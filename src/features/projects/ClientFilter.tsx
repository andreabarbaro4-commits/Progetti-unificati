import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { HiCheck } from 'react-icons/hi2';
import { cn } from '../../lib/utils';
import type { Client } from '../../mock/fixtures/types';

export interface ClientFilterOption {
  value: string;
  label: string;
}

export interface ClientFilterProps {
  /** Full list of clients (must include the Internal client) */
  clients: Client[];
  /** Currently selected client id, or undefined for "all" */
  selectedClient: string | undefined;
  /** Called when the user picks a client filter option, or `undefined` for "all" */
  onSelect: (clientId: string | undefined) => void;
}

/**
 * Builds the option list per Req 13.2:
 * - "Internal" always first
 * - Then every non-internal client that owns ≥1 project, sorted alphabetically ascending (case-insensitive)
 * - No duplicates
 *
 * The `clientsWithProjects` filtering (≥1 project) is expected to be done by
 * the caller passing only clients that own at least one project.
 */
export function buildClientFilterOptions(clients: Client[]): ClientFilterOption[] {
  const internalClient = clients.find((c) => c.isInternal);
  const externalClients = clients.filter((c) => !c.isInternal);

  // Sort alphabetically ascending, case-insensitive
  const sorted = [...externalClients].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
  );

  const options: ClientFilterOption[] = [];

  // "Internal" always first
  if (internalClient) {
    options.push({ value: internalClient.id, label: internalClient.name });
  }

  // Then alphabetical external clients
  for (const client of sorted) {
    options.push({ value: client.id, label: client.name });
  }

  return options;
}

/**
 * Client filter control for the Projects List — a horizontally-scrolling
 * row of pill-shaped chips ("All" plus one per client), rather than a
 * single-select dropdown, so every option stays visible at a glance.
 *
 * Lists "Internal" first, then every client that owns at least one project
 * sorted alphabetically ascending, case-insensitive (Req 13.2).
 */
export function ClientFilter({ clients, selectedClient, onSelect }: ClientFilterProps) {
  const { t } = useTranslation();
  const options = useMemo(() => buildClientFilterOptions(clients), [clients]);
  const isAllSelected = selectedClient === undefined;

  return (
    <div
      className="flex w-full items-center gap-2 overflow-x-auto pb-1"
      role="tablist"
      aria-label={t('projects.filter_by_client')}
    >
      <FilterChip
        label={t('projects.all_clients')}
        selected={isAllSelected}
        onClick={() => onSelect(undefined)}
      />
      {options.map((option) => (
        <FilterChip
          key={option.value}
          label={option.label}
          selected={selectedClient === option.value}
          onClick={() => onSelect(option.value)}
        />
      ))}
    </div>
  );
}

interface FilterChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

function FilterChip({ label, selected, onClick }: FilterChipProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
        selected
          ? 'border-gray-900 bg-gray-900 text-white'
          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
      )}
    >
      {selected && <HiCheck className="h-4 w-4" aria-hidden="true" />}
      {label}
    </button>
  );
}
