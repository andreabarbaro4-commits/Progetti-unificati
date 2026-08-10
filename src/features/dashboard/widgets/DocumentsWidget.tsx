import { useQuery } from '@tanstack/react-query';
import { HiOutlineDocument } from 'react-icons/hi2';
import { Card } from '../../../components/ui/Card';
import { apiClient } from '../../../lib/api-client';
import { selectTopN } from '../../../lib/topN';
import type { Document } from '../../../mock/fixtures/types';

/**
 * DocumentsWidget — the "recent documents" Dashboard Widget (Requirement 12.1).
 *
 * Shows the 5 most-recently-modified documents across all projects, using
 * the shared `selectTopN` template (design doc "Property 10: Capped
 * top-N selection by criterion").
 */

const DOCUMENTS_QUERY_KEY = ['documents'] as const;
const CAP = 5;

function formatUpdatedAt(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function DocumentsWidget() {
  const { data, isLoading, isError } = useQuery({
    queryKey: DOCUMENTS_QUERY_KEY,
    queryFn: () => apiClient.get<Document[]>('/documents'),
  });

  const documents = data ?? [];
  const topDocuments = selectTopN(documents, (doc) => new Date(doc.updatedAt).getTime(), CAP);

  return (
    <Card size="sm" className="max-w-none w-full items-stretch gap-3 p-4">
      <div className="flex w-full items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-800">Recent Documents</h3>
      </div>

      {isLoading && <p className="text-xs text-gray-400">Loading documents…</p>}

      {isError && (
        <p role="alert" className="text-xs text-red-600">
          Couldn't load documents.
        </p>
      )}

      {!isLoading && !isError && topDocuments.length === 0 && (
        <p className="text-xs text-gray-400">No documents yet.</p>
      )}

      {!isLoading && !isError && topDocuments.length > 0 && (
        <ul className="flex w-full flex-col gap-2 overflow-y-auto">
          {topDocuments.map((doc) => (
            <li key={doc.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
              <HiOutlineDocument className="h-4 w-4 shrink-0 text-gray-400" />
              <span className="flex-1 truncate text-sm text-gray-800">{doc.name}</span>
              <span className="shrink-0 text-xs text-gray-400">{formatUpdatedAt(doc.updatedAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
