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
// Schema — project name is non-empty & ≤100 chars; client is required selection
// (matches validateStringLength rules for project name: required + max 100).
// ---------------------------------------------------------------------------

const ProjectCreateSchema = z.object({
  name: z.string().trim().min(1, 'validation.required').max(100, 'validation.field_too_long'),
  clientId: z.string().min(1, 'validation.required'),
});

type ProjectCreateData = z.infer<typeof ProjectCreateSchema>;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface ProjectCreateDialogProps {
  open: boolean;
  onClose: () => void;
  /** Called after a project is successfully created. */
  onCreated?: (project: Project) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Dialog for creating a new project.
 *
 * - Uses `Modal` + `FormField` + `CustomSelect` following onboarding form patterns.
 * - Validation via zod with `createFormConfig` (mock-mode bypass is automatic).
 * - On confirm with valid input: POSTs to `/projects`, invalidates the project
 *   query cache so the new ProjectCard renders.
 * - On invalid input: keeps dialog open with field-level validation messages.
 */
export function ProjectCreateDialog({ open, onClose, onCreated }: ProjectCreateDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ProjectCreateData>(
    createFormConfig(ProjectCreateSchema, {
      defaultValues: { name: '', clientId: '' },
    }),
  );

  // Fetch clients for the dropdown
  const { data: clients } = useQuery({
    queryKey: ['clients'],
    queryFn: () => apiClient.get<Client[]>('/clients'),
  });

  const clientOptions = (clients ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  const createMutation = useMutation({
    mutationFn: (data: ProjectCreateData) =>
      apiClient.post<Project, Partial<Project>>('/projects', {
        name: data.name,
        clientId: data.clientId,
      }),
    onSuccess: (newProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      reset();
      onCreated?.(newProject);
      onClose();
    },
  });

  function onSubmit(data: ProjectCreateData) {
    createMutation.mutate(data);
  }

  function handleClose() {
    reset();
    onClose();
  }

  return (
    <Modal open={open} onClose={handleClose} size="md" ariaLabel={t('projects.create_project')}>
      <h2 className="mb-4 text-xl font-bold text-gray-900">
        {t('projects.create_project')}
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
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? t('common.saving') : t('common.create')}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
