import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Modal } from '../../../components/ui/Modal'
import { FormField } from '../../../components/ui/FormField'
import { CustomSelect } from '../../../components/ui/CustomSelect'
import { Button } from '../../../components/ui/Button'
import { createFormConfig } from '../../../lib/form-utils'
import { apiClient } from '../../../lib/api-client'
import type { Task, Milestone, TaskPriority } from '../../../mock/fixtures/types'

// ---------------------------------------------------------------------------
// Schema — task name required & ≤100 chars, priority required, milestone optional.
// ---------------------------------------------------------------------------

const TaskEditSchema = z.object({
  name: z.string().trim().min(1, 'validation.required').max(100, 'validation.field_too_long'),
  priority: z.enum(['high', 'medium', 'low'], {
    required_error: 'validation.required',
  }),
  milestoneId: z.string().optional(),
})

type TaskEditData = z.infer<typeof TaskEditSchema>

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TaskEditDialogProps {
  open: boolean
  onClose: () => void
  task: Task | null
  projectId: string
  onUpdated?: (task: Task) => void
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Dialog for editing an existing task within the Project Detail's
 * Milestones & Tasks tab.
 *
 * Uses Modal + FormField + CustomSelect + Button. Validates required fields
 * (name, priority). Calls PUT /tasks/:id via apiClient and invalidates the
 * tasks query.
 *
 * Requirements: 23.1
 */
export function TaskEditDialog({
  open,
  onClose,
  task,
  projectId,
  onUpdated,
}: TaskEditDialogProps) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<TaskEditData>(
    createFormConfig(TaskEditSchema, {
      defaultValues: {
        name: task?.name ?? '',
        priority: task?.priority ?? 'medium',
        milestoneId: task?.milestoneId ?? '',
      },
    }),
  )

  // Reset form when the task prop changes
  useEffect(() => {
    if (task) {
      reset({
        name: task.name,
        priority: task.priority,
        milestoneId: task.milestoneId ?? '',
      })
    }
  }, [task, reset])

  // Fetch milestones for the project to populate the optional milestone dropdown
  const { data: allMilestones = [] } = useQuery<Milestone[]>({
    queryKey: ['milestones'],
    queryFn: () => apiClient.get<Milestone[]>('/milestones'),
  })

  const projectMilestones = allMilestones.filter((ms) => ms.projectId === projectId)

  const milestoneOptions = [
    { value: '', label: 'No milestone' },
    ...projectMilestones.map((ms) => ({
      value: ms.id,
      label: ms.name,
    })),
  ]

  const priorityOptions = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ]

  const updateMutation = useMutation({
    mutationFn: (data: TaskEditData) =>
      apiClient.put<Task, Partial<Task>>(`/tasks/${task!.id}`, {
        name: data.name,
        priority: data.priority as TaskPriority,
        milestoneId: data.milestoneId || undefined,
      }),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['milestones'] })
      onUpdated?.(updatedTask)
      onClose()
    },
  })

  function onSubmit(data: TaskEditData) {
    if (!task) return
    updateMutation.mutate(data)
  }

  function handleClose() {
    reset()
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} size="md" ariaLabel="Edit task">
      <h2 className="mb-4 text-xl font-bold text-gray-900">Edit Task</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        <FormField name="name" label="projects.task_name" error={errors.name?.message}>
          <input
            id="name"
            type="text"
            placeholder="Task name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            {...register('name')}
          />
        </FormField>

        <FormField name="priority" label="projects.priority" error={errors.priority?.message} unstyled>
          <Controller
            control={control}
            name="priority"
            render={({ field }) => (
              <CustomSelect
                id="priority"
                name={field.name}
                options={priorityOptions}
                value={field.value}
                placeholder="Select priority"
                onChange={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={!!errors.priority}
                aria-describedby={errors.priority ? 'priority-error' : undefined}
              />
            )}
          />
        </FormField>

        <FormField name="milestoneId" label="projects.milestone" error={errors.milestoneId?.message} unstyled>
          <Controller
            control={control}
            name="milestoneId"
            render={({ field }) => (
              <CustomSelect
                id="milestoneId"
                name={field.name}
                options={milestoneOptions}
                value={field.value ?? ''}
                placeholder="Select milestone (optional)"
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            )}
          />
        </FormField>

        {updateMutation.isError && (
          <p className="text-sm text-red-600" role="alert">
            Failed to update the task. Please try again.
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
