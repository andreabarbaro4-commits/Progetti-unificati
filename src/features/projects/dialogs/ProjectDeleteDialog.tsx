import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { apiClient } from '../../../lib/api-client';

export interface ProjectDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  projectName: string;
}

/**
 * ProjectDeleteDialog — confirmation dialog for deleting a project.
 *
 * On confirm, removes the project from the mock collection via
 * `DELETE /projects/:id` and invalidates the projects query so the
 * grid re-renders without the deleted card.
 *
 * Requirements: 15.1, 15.5
 */
export function ProjectDeleteDialog({
  open,
  onClose,
  projectId,
  projectName,
}: ProjectDeleteDialogProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete<{ id: string }>(`/projects/${projectId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onClose();
    },
  });

  const handleConfirm = () => {
    deleteMutation.mutate();
  };

  return (
    <Modal open={open} onClose={onClose} size="sm" ariaLabel="Delete project">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Delete Project</h2>
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-medium text-gray-900">{projectName}</span>? This
          action cannot be undone.
        </p>

        {deleteMutation.isError && (
          <p className="text-sm text-red-600" role="alert">
            Failed to delete the project. Please try again.
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={deleteMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="bg-red-600 hover:bg-red-700"
            onClick={handleConfirm}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
