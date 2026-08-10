import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Modal } from '../../../components/ui/Modal';
import { FormField } from '../../../components/ui/FormField';
import { CustomSelect } from '../../../components/ui/CustomSelect';
import { Button } from '../../../components/ui/Button';
import { createFormConfig } from '../../../lib/form-utils';
import { apiClient } from '../../../lib/api-client';
import type { Project, Client } from '../../../mock/fixtures/types';

// ---------------------------------------------------------------------------
// Schema — same constraints as create: name non-empty & ≤100, client required.
// ---------------------------------------------------------------------------

const ProjectEditSchema = z.object({
  name: z.string().trim().min(1, 'validation.required').max(100, 'validation.field_too_long'),
  clientId: z.string().min(1, 'validation.required'),
});

type ProjectEditData = z.infer<typeof ProjectEditSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ProjectEditDialogProps {
  open: boolean;
  onClose: () => void;
  /** The project being edited — determines initial form values. */
  project: Project | null;
  /** Called after a project is successfully updated. */
  onUpdated?: (project: Project) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Dialog for editing an existing project.
 *
 * - Uses `Modal` + `FormField` + `CustomSelect` following onboarding form patterns.
 * - Validation via zod with `createFormConfig` (mock-mode bypass is automatic).
 * - On confirm with valid input: PUTs to `/projects/:id`, invalidates the project
 *   query cache so the updated ProjectCard re-renders.
 * - On invalid input: keeps dialog open with field-level validation messages.
 */
export function ProjectEditDialog({ open, onClose, project, onUpdated }: ProjectEditDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProjectEditData>(
    createFormConfig(ProjectEditSchema, {
      defaultValues: {
        name: project?.name ?? '',
        clientId: project?.clientId ?? '',
      },
    }),
  );

  // Reset form values when the project prop changes (e.g. opening for a different project)
  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        clientId: project.clientId,
      });
    }
  }, [project, reset]);

  // Fetch clients for the dropdown
  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.get<Client[]>('/clients'),
  });

  const clientOptions = (clients ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const updateMutation = useMutation({
    mutationFn: (data: ProjectEditData) =>
      apiClient.put<Project, Partial<Project>>(`/projects/${project!.id}`, {
        name: data.name,
        clientId: data.clientId,
      }),
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      onUpdated?.(updatedProject);
      onClose();
    },
  });

  function onSubmit(data: ProjectEditData) {
    if (!project) return;
    updateMutation.mutate(data);
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} size="md" ariaLabel={t('projects.edit_project')}>
      <h2 className="mb-4 text-xl font-bold text-gray-900">
        {t('projects.edit_project')}
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-2">
        {/* Project name */}
        <FormField name="name" label="projects.project_name" error={errors.name?.message}>
          <input
            id="name"
            type="text"
            placeholder={t('projects.project_name_placeholder')}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            {...register('name')}
          />
        </FormField>

        {/* Client selection */}
        <FormField name="clientId" label="projects.client" error={errors.clientId?.message} unstyled>
          <Controller
            control={control}
            name="clientId"
            render={({ field }) => (
              <CustomSelect
                id="clientId"
                name={field.name}
                options={clientOptions}
                value={field.value}
                placeholder={t('projects.select_client')}
                onChange={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={!!errors.clientId}
                aria-describedby={errors.clientId ? 'clientId-error' : undefined}
              />
            )}
          />
        </FormField>

        {/* Actions */}
        <div className="mt-4 flex items-center justify-end gap-3">
          <Button type="button" variant="ghost" onClick={handleClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? t('common.saving') : t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
