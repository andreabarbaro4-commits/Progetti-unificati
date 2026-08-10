import { useForm } from 'react-hook-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Modal } from '../../../components/ui/Modal'
import { FormField } from '../../../components/ui/FormField'
import { Button } from '../../../components/ui/Button'
import { createFormConfig } from '../../../lib/form-utils'
import { apiClient } from '../../../lib/api-client'
import type { Milestone } from '../../../mock/fixtures/types'

// ---------------------------------------------------------------------------
// Schema — milestone name required & ≤100 chars, date required.
// ---------------------------------------------------------------------------

const MilestoneCreateSchema = z.object({
  name: z.string().trim().min(1, 'validation.required').max(100, 'validation.field_too_long'),
  date: z.string().min(1, 'validation.required'),
})

type MilestoneCreateData = z.infer<typeof MilestoneCreateSchema>

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MilestoneCreateDialogProps {
  open: boolean
  onClose: () => void
  projectId: string
  onCreated?: (milestone: Milestone) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Dialog for creating a new milestone within the Project Detail's
 * Milestones & Tasks tab.
 *
 * Uses Modal + FormField + Button. Validates required fields (name, date).
 * Calls POST /milestones via apiClient and invalidates the milestones query.
 *
 * Requirements: 23.1
 */
export function MilestoneCreateDialog({
  open,
  onClose,
  projectId,
  onCreated,
}: MilestoneCreateDialogProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MilestoneCreateData>(
    createFormConfig(MilestoneCreateSchema, {
      defaultValues: { name: '', date: '' },
    }),
  )

  const createMutation = useMutation({
    mutationFn: (data: MilestoneCreateData) =>
      apiClient.post<Milestone, Partial<Milestone>>('/milestones', {
        name: data.name,
        date: data.date,
        projectId,
        completed: false,
        taskIds: [],
      }),
    onSuccess: (newMilestone) => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] })
      reset()
      onCreated?.(newMilestone)
      onClose()
    },
  })

  function onSubmit(data: MilestoneCreateData) {
    createMutation.mutate(data)
  }

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} size="md" ariaLabel="Create milestone">
      <h2 className="mb-4 text-xl font-bold text-gray-900">Create Milestone</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <FormField name="name" label="projects.milestone_name" error={errors.name?.message}>
          <input
            id="name"
            type="text"
            placeholder="Milestone name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            {...register('name')}
          />
        </FormField>

        <FormField name="date" label="projects.milestone_date" error={errors.date?.message}>
          <input
            id="date"
            type="date"
            aria-invalid={!!errors.date}
            aria-describedby={errors.date ? 'date-error' : undefined}
            {...register('date')}
          />
        </FormField>

        {createMutation.isError && (
          <p className="text-sm text-red-600" role="alert">
            Failed to create the milestone. Please try again.
          </p>
        )}

        <div className="mt-4 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating…' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
