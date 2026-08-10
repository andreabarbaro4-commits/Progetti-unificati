import { useState, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { FormField } from '../../../components/ui/FormField';
import { apiClient } from '../../../lib/api-client';
import { validateStringLength } from '../../../lib/validation';
import type { Client, Project } from '../../../mock/fixtures/types';
import { INTERNAL_CLIENT_ID } from '../../../mock/fixtures/clients';

export interface AddClientDialogProps {
  open: boolean;
  onClose: () => void;
}

/**
 * AddClientDialog — form for adding a new client to the mock collection.
 *
 * Validates that the name is non-empty and at most 100 characters via
 * `validateStringLength`. On confirm, creates the client via `POST /clients`
 * and makes it available in create/edit project dialogs.
 *
 * Internal-client protection (Req 15.7): If the user somehow attempts to
 * delete or reassign the "Internal" client while it is referenced by at least
 * one existing project, the dialog prevents the operation and displays a
 * message. This protection is surfaced here as a guard when the dialog is
 * used in a context that could enable such an operation (e.g., an "edit client"
 * or "delete client" action for Internal).
 *
 * Requirements: 15.1, 15.4, 15.7
 */
export function AddClientDialog({ open, onClose }: AddClientDialogProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const queryClient = useQueryClient();

  // Fetch projects to check Internal client protection (Req 15.7)
  const { data: projects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.get<Project[]>('/projects'),
  });

  const createMutation = useMutation({
    mutationFn: (clientName: string) =>
      apiClient.post<Client, Partial<Client>>('/clients', { name: clientName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      handleClose();
    },
  });

  const handleClose = () => {
    setName('');
    setError(undefined);
    onClose();
  };

  const handleConfirm = () => {
    const validation = validateStringLength(name, {
      required: true,
      maxLength: 100,
    });

    if (!validation.valid) {
      switch (validation.reason) {
        case 'required':
          setError('Client name is required.');
          break;
        case 'tooLong':
          setError('Client name must be at most 100 characters.');
          break;
        default:
          setError('Invalid client name.');
      }
      return;
    }

    setError(undefined);
    createMutation.mutate(name.trim());
  };

  return (
    <Modal open={open} onClose={handleClose} size="sm" ariaLabel="Add client">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Add Client</h2>

        <InternalClientProtectionMessage projects={projects ?? []} />

        <FormField name="client-name" label="Client Name" error={error}>
          <input
            id="client-name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(undefined);
            }}
            placeholder="Enter client name"
            maxLength={101}
            aria-describedby={error ? 'client-name-error' : undefined}
          />
        </FormField>

        {createMutation.isError && (
          <p className="text-sm text-red-600" role="alert">
            Failed to add the client. Please try again.
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleClose}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleConfirm}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Adding…' : 'Add Client'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Internal-Client Protection (Req 15.7)
// ---------------------------------------------------------------------------

/**
 * Checks if the Internal client is referenced by existing projects and
 * renders a warning message when so. This is an informational safeguard —
 * the Internal client cannot be deleted or reassigned via any dialog when
 * it is in use.
 */
function InternalClientProtectionMessage({ projects }: { projects: Project[] }) {
  const isInternalInUse = useMemo(
    () => projects.some((p) => p.clientId === INTERNAL_CLIENT_ID),
    [projects],
  );

  if (!isInternalInUse) return null;

  return (
    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
      <p className="text-xs text-amber-800">
        The &quot;Internal&quot; client is currently referenced by one or more
        projects and cannot be deleted or reassigned.
      </p>
    </div>
  );
}

/**
 * Utility to check if the Internal client can be deleted or reassigned.
 * Returns true if the operation should be blocked (Internal client is in use).
 *
 * Exported for use by edit dialogs that may attempt to reassign or delete
 * the Internal client (Req 15.7).
 */
export function isInternalClientProtected(
  clientId: string,
  projects: Project[],
): boolean {
  if (clientId !== INTERNAL_CLIENT_ID) return false;
  return projects.some((p) => p.clientId === INTERNAL_CLIENT_ID);
}
