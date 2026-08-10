import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'
import { HiOutlinePhoto } from 'react-icons/hi2'
import { FormField } from '../../components/ui/FormField'
import { CustomSelect } from '../../components/ui/CustomSelect'
import { Button } from '../../components/ui/Button'
import { WizardLayout } from './WizardLayout'
import { useWizardStore } from './useWizardStore'
import { createFormConfig } from '../../lib/form-utils'
import { apiClient } from '../../lib/api-client'
import { isMockMode } from '../../mock'
import type { TeamMember } from '../../mock/fixtures/types'

// ── Predefined project types ────────────────────────────────────────────────

const PROJECT_TYPES = ['Mobile', 'Web', 'Backend', 'Design', 'Data', 'DevOps', 'Research'] as const

// ── Validation schema ───────────────────────────────────────────────────────

const today = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

const ProjectFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'validation.required')
    .max(100, 'validation.field_too_long'),
  brief: z
    .string()
    .trim()
    .min(20, 'validation.field_too_short')
    .max(500, 'validation.field_too_long'),
  owner: z.string().min(1, 'validation.required'),
  deadline: z
    .string()
    .min(1, 'validation.required')
    .refine(
      (val) => {
        const date = new Date(val)
        return !isNaN(date.getTime()) && date >= today()
      },
      { message: 'validation.deadline_past' },
    ),
  // Kept as a string end-to-end (no `.transform()`) so the schema's input and
  // output types match — `WizardFormData.budget` is also a string, parsed to
  // a number only where consumed (see TeamSelectionStep.tsx).
  budget: z.string().refine(
    (val) => {
      if (val === '') return true
      const num = parseFloat(val)
      return !isNaN(num) && num >= 0 && num <= 999_999_999.99
    },
    { message: 'validation.budget_invalid' },
  ),
  type: z.string().min(1, 'validation.required'),
})

type ProjectFormData = z.infer<typeof ProjectFormSchema>

// ── Thumbnail validation constants ──────────────────────────────────────────

const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

// ── Component ───────────────────────────────────────────────────────────────

export default function ProjectFormStep() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const setFormData = useWizardStore((s) => s.setFormData)

  // Thumbnail state (managed outside react-hook-form since File objects don't serialize)
  const [thumbnail, setThumbnail] = useState<string | null>(null)
  const [thumbnailError, setThumbnailError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fetch team members for the owner select
  const { data: teamMembers } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => apiClient.get<TeamMember[]>('/team-members'),
  })

  const ownerOptions = (teamMembers ?? []).map((m) => ({
    value: m.id,
    label: `${m.name} ${m.surname}`,
  }))

  const typeOptions = PROJECT_TYPES.map((type) => ({
    value: type,
    label: type,
  }))

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProjectFormData>(
    createFormConfig(ProjectFormSchema, {
      defaultValues: {
        name: '',
        brief: '',
        owner: '',
        deadline: '',
        budget: '',
        type: '',
      },
    }),
  )

  // ── Thumbnail handling ──────────────────────────────────────────────────────

  function handleThumbnailChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setThumbnailError(null)

    if (!file) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setThumbnailError('validation.invalid_file_type')
      return
    }

    if (file.size > MAX_THUMBNAIL_SIZE) {
      setThumbnailError('validation.file_too_large')
      return
    }

    // Convert to base64 for session storage persistence
    const reader = new FileReader()
    reader.onload = () => {
      setThumbnail(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveThumbnail() {
    setThumbnail(null)
    setThumbnailError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // ── Submit ──────────────────────────────────────────────────────────────────

  function onSubmit(data: ProjectFormData) {
    setFormData({
      name: data.name,
      brief: data.brief,
      owner: data.owner,
      deadline: data.deadline,
      budget: data.budget,
      type: data.type,
      thumbnail: thumbnail ?? undefined,
    })
    navigate('/projects/new/analysis')
  }

  function handleFormSubmit(e: React.FormEvent) {
    // In mock mode, bypass validation and allow progression
    if (isMockMode()) {
      e.preventDefault()
      // Gather whatever values are in the form, save and proceed
      const formEl = e.target as HTMLFormElement
      const formDataObj = new FormData(formEl)
      setFormData({
        name: (formDataObj.get('name') as string) || '',
        brief: (formDataObj.get('brief') as string) || '',
        owner: (formDataObj.get('owner') as string) || '',
        deadline: (formDataObj.get('deadline') as string) || '',
        budget: (formDataObj.get('budget') as string) || '',
        type: (formDataObj.get('type') as string) || '',
        thumbnail: thumbnail ?? undefined,
      })
      navigate('/projects/new/analysis')
      return
    }

    handleSubmit(onSubmit)(e)
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <WizardLayout chatPanel={undefined}>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-6 lg:px-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">
          {t('wizard.new_project')}
        </h1>

        <form onSubmit={handleFormSubmit} className="flex flex-col gap-1 max-w-2xl">
          {/* Project Name */}
          <FormField name="name" label="wizard.project_name" error={errors.name?.message}>
            <input
              id="name"
              type="text"
              placeholder={t('wizard.project_name_placeholder')}
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? 'name-error' : undefined}
              {...register('name')}
            />
          </FormField>

          {/* Brief */}
          <FormField name="brief" label="wizard.brief" error={errors.brief?.message}>
            <textarea
              id="brief"
              rows={4}
              placeholder={t('wizard.brief_placeholder')}
              aria-invalid={!!errors.brief}
              aria-describedby={errors.brief ? 'brief-error' : undefined}
              {...register('brief')}
            />
          </FormField>

          {/* Owner */}
          <FormField name="owner" label="wizard.owner" error={errors.owner?.message} unstyled>
            <Controller
              control={control}
              name="owner"
              render={({ field }) => (
                <CustomSelect
                  id="owner"
                  name={field.name}
                  options={ownerOptions}
                  value={field.value}
                  placeholder={t('wizard.select_owner')}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.owner}
                  aria-describedby={errors.owner ? 'owner-error' : undefined}
                />
              )}
            />
          </FormField>

          {/* Deadline */}
          <FormField name="deadline" label="wizard.deadline" error={errors.deadline?.message}>
            <input
              id="deadline"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              aria-invalid={!!errors.deadline}
              aria-describedby={errors.deadline ? 'deadline-error' : undefined}
              {...register('deadline')}
            />
          </FormField>

          {/* Budget */}
          <FormField name="budget" label="wizard.budget" error={errors.budget?.message}>
            <input
              id="budget"
              type="number"
              step="0.01"
              min="0"
              max="999999999.99"
              placeholder="0.00"
              aria-invalid={!!errors.budget}
              aria-describedby={errors.budget ? 'budget-error' : undefined}
              {...register('budget')}
            />
          </FormField>

          {/* Project Type */}
          <FormField name="type" label="wizard.project_type" error={errors.type?.message} unstyled>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <CustomSelect
                  id="type"
                  name={field.name}
                  options={typeOptions}
                  value={field.value}
                  placeholder={t('wizard.select_type')}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  aria-invalid={!!errors.type}
                  aria-describedby={errors.type ? 'type-error' : undefined}
                />
              )}
            />
          </FormField>

          {/* Thumbnail (optional) */}
          <FormField
            name="thumbnail"
            label="wizard.thumbnail"
            error={thumbnailError ?? undefined}
            unstyled
          >
            <div className="flex items-center gap-3">
              {thumbnail ? (
                <div className="relative">
                  <img
                    src={thumbnail}
                    alt={t('wizard.thumbnail_preview')}
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[0.625rem] text-white"
                    onClick={handleRemoveThumbnail}
                    aria-label={t('common.remove')}
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed border-gray-300 text-gray-400 hover:border-gray-400 hover:text-gray-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label={t('wizard.upload_thumbnail')}
                >
                  <HiOutlinePhoto className="h-6 w-6" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                className="hidden"
                onChange={handleThumbnailChange}
              />
              <span className="text-xs text-gray-500">
                {t('wizard.thumbnail_hint')}
              </span>
            </div>
          </FormField>

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate('/projects')}
            >
              {t('common.cancel')}
            </Button>
            <Button type="submit">
              {t('wizard.continue')}
            </Button>
          </div>
        </form>
      </div>
    </WizardLayout>
  )
}
