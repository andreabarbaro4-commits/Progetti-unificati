import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { apiClient } from '../../../lib/api-client'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TaskDeleteDialogProps {
  open: boolean
  onClose: () => void
  taskId: string
  taskName: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Simple confirmation dialog for deleting a task within the Project Detail's
 * Milestones & Tasks tab.
 *
 * On confirm, removes the task via DELETE /tasks/:id and invalidates
 * the tasks and milestones queries.
 *
 * Requirements: 23.1
 */
export function TaskDeleteDialog({
  open,
  onClose,
  taskId,
  taskName,
}: TaskDeleteDialogProps) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete<{ id: string }>(`/tasks/${taskId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['milestones'] })
      onClose()
    },
  })

  function handleConfirm() {
    deleteMutation.mutate()
  }

  return (
    <Modal open={open} onClose={onClose} size="sm" ariaLabel="Delete task">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Delete Task</h2>
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-medium text-gray-900">{taskName}</span>? This
          action cannot be undone.
        </p>

        {deleteMutation.isError && (
          <p className="text-sm text-red-600" role="alert">
            Failed to delete the task. Please try again.
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
  )
}
