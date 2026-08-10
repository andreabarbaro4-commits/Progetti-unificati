import { useEffect } from 'react'
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
// Schema — same constraints as create: name required & ≤100 chars, date required.
// ---------------------------------------------------------------------------

const MilestoneEditSchema = z.object({
  name: z.string().trim().min(1, 'validation.required').max(100, 'validation.field_too_long'),
  date: z.string().min(1, 'validation.required'),
})

type MilestoneEditData = z.infer<typeof MilestoneEditSchema>

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface MilestoneEditDialogProps {
  open: boolean
  onClose: () => void
  milestone: Milestone | null
  onUpdated?: (milestone: Milestone) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Dialog for editing an existing milestone within the Project Detail's
 * Milestones & Tasks tab.
 *
 * Uses Modal + FormField + Button. Validates required fields (name, date).
 * Calls PUT /milestones/:id via apiClient and invalidates the milestones query.
 *
 * Requirements: 23.1
 */
export function MilestoneEditDialog({
  open,
  onClose,
  milestone,
  onUpdated,
}: MilestoneEditDialogProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MilestoneEditData>(
    createFormConfig(MilestoneEditSchema, {
      defaultValues: {
        name: milestone?.name ?? '',
        date: milestone?.date ?? '',
      },
    }),
  )

  // Reset form when the milestone prop changes
  useEffect(() => {
    if (milestone) {
      reset({
        name: milestone.name,
        date: milestone.date,
      })
    }
  }, [milestone, reset])

  const updateMutation = useMutation({
    mutationFn: (data: MilestoneEditData) =>
      apiClient.put<Milestone, Partial<Milestone>>(`/milestones/${milestone!.id}`, {
        name: data.name,
        date: data.date,
      }),
    onSuccess: (updatedMilestone) => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] })
      onUpdated?.(updatedMilestone)
      onClose()
    },
  })

  function onSubmit(data: MilestoneEditData) {
    if (!milestone) return
    updateMutation.mutate(data)
  }

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} size="md" ariaLabel="Edit milestone">
      <h2 className="mb-4 text-xl font-bold text-gray-900">Edit Milestone</h2>

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

        {updateMutation.isError && (
          <p className="text-sm text-red-600" role="alert">
            Failed to update the milestone. Please try again.
          </p>
        )}

        <div className="mt-4 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
