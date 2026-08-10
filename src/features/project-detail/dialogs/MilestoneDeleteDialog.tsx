import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '../../../components/ui/Modal'
import { Button } from '../../../components/ui/Button'
import { apiClient } from '../../../lib/api-client'

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MilestoneDeleteDialogProps {
  open: boolean
  onClose: () => void
  milestoneId: string
  milestoneName: string
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Simple confirmation dialog for deleting a milestone within the Project Detail's
 * Milestones & Tasks tab.
 *
 * On confirm, removes the milestone via DELETE /milestones/:id and invalidates
 * both the milestones and tasks queries (deletion may cascade to tasks).
 *
 * Requirements: 23.1
 */
export function MilestoneDeleteDialog({
  open,
  onClose,
  milestoneId,
  milestoneName,
}: MilestoneDeleteDialogProps) {
  const queryClient = useQueryClient()

  const deleteMutation = useMutation({
    mutationFn: () => apiClient.delete<{ id: string }>(`/milestones/${milestoneId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      onClose()
    },
  })

  function handleConfirm() {
    deleteMutation.mutate()
  }

  return (
    <Modal open={open} onClose={onClose} size="sm" ariaLabel="Delete milestone">
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-gray-900">Delete Milestone</h2>
        <p className="text-sm text-gray-600">
          Are you sure you want to delete{' '}
          <span className="font-medium text-gray-900">{milestoneName}</span>? This
          action cannot be undone. Tasks linked to this milestone will be unlinked.
        </p>

        {deleteMutation.isError && (
          <p className="text-sm text-red-600" role="alert">
            Failed to delete the milestone. Please try again.
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
